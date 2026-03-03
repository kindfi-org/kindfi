import { supabase } from '@packages/lib/supabase'
import type { Enums } from '@services/supabase'
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { AppError } from '~/lib/error'
import type { MediatorAssignmentPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateMediatorAssignment } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	try {
		// Authenticate user from session - never trust client-provided user IDs
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Derive assignedById from authenticated session
		const assignedById = session.user.id

		// 1. Parse and validate the mediator assignment data
		const assignmentData = await req.json()
		const validationResult = validateMediatorAssignment(assignmentData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid mediator assignment data',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			)
		}

		const validatedData = validationResult.data as MediatorAssignmentPayload

		const { disputeId, mediatorId } = validatedData

		// 2 & 4. Verify dispute exists and assigner is authorized in parallel
		const [disputeResult, assignerResult] = await Promise.all([
			supabase
				.from('escrow_reviews')
				.select('id, status, type, escrow_id, milestone_id')
				.eq('id', disputeId)
				.eq('status', 'PENDING')
				.eq('type', 'dispute')
				.single(),
			supabase
				.from('users')
				.select('id, user_roles!inner(role)')
				.eq('id', assignedById)
				.single(),
		])

		const { data: dispute, error: disputeError } = disputeResult
		const { data: assigner, error: assignerError } = assignerResult

		if (disputeError || !dispute) {
			return NextResponse.json(
				{ error: 'Dispute not found or already resolved' },
				{ status: 404 },
			)
		}

		if (assignerError || !assigner) {
			return NextResponse.json({ error: 'Assigner not found' }, { status: 404 })
		}

		// Check if the assigner has the required role (admin or dispute_manager)
		const hasRequiredRole = assigner.user_roles.some(
			(userRole: { role: Enums<'user_role'> }) =>
				['admin', 'dispute_manager'].includes(userRole.role),
		)

		if (!hasRequiredRole) {
			return NextResponse.json(
				{ error: 'Not authorized to assign mediators' },
				{ status: 403 },
			)
		}

		// 7. Send notification to the mediator (non-blocking)
		after(async () => {
			const { error: notificationError } = await supabase
				.from('notifications')
				.insert({
					user_id: mediatorId,
					review_id: disputeId, // Use review_id instead of dispute_id
					message: 'You have been assigned as a mediator for a dispute',
					type: 'MEDIATOR_ASSIGNED',
				})

			if (notificationError) {
				console.error('Failed to send notification:', notificationError)
			}
		})

		return NextResponse.json(
			{
				success: true,
				message: 'Mediator assigned successfully',
				data: {
					disputeId,
					mediatorId,
					status: 'MEDIATION',
				},
			},
			{ status: 200 },
		)
	} catch (error) {
		console.error('Mediator Assignment Error:', error)

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

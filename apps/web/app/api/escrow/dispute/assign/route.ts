import { supabase } from '@packages/lib/supabase'
import type { Enums } from '@services/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '~/lib'
import { AppError } from '~/lib/error'
import type { MediatorAssignmentPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateMediatorAssignment } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	try {
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

		const { disputeId, mediatorId, assignedById } = validatedData

		// 2. Verify the dispute exists and is in PENDING status
		const { data: dispute, error: disputeError } = await supabase
			.from('escrow_reviews')
			.select('*')
			.eq('id', disputeId)
			.eq('status', 'PENDING')
			.eq('type', 'dispute')
			.single()

		if (disputeError || !dispute) {
			return NextResponse.json(
				{ error: 'Dispute not found or already resolved' },
				{ status: 404 },
			)
		}

		// 4. Verify the assigner is authorized (platform admin or authorized role)
		const { data: assigner, error: assignerError } = await supabase
			.from('users')
			.select('*, user_roles!inner(role)')
			.eq('id', assignedById)
			.single()

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

		// 7. Send notification to the mediator
		const { error: notificationError } = await supabase
			.from('notifications')
			.insert({
				user_id: mediatorId,
				review_id: disputeId, // Use review_id instead of dispute_id
				message: 'You have been assigned as a mediator for a dispute',
				type: 'MEDIATOR_ASSIGNED',
			})

		if (notificationError) {
			logger.error({
				eventType: 'Mediator Assignment Notification Error',
				error: notificationError.message,
				details: notificationError,
			})
			// Non-critical error, don't throw
		}

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
		logger.error({
			eventType: 'Mediator Assignment Error',
			details: error,
		})

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

import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
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

		// 3. Verify the mediator exists
		const { data: mediator, error: mediatorError } = await supabase
			.from('escrow_mediators')
			.select('*')
			.eq('id', mediatorId)
			.single()

		if (mediatorError || !mediator) {
			return NextResponse.json({ error: 'Mediator not found' }, { status: 404 })
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
		const hasRequiredRole = assigner.user_roles.some((userRole: any) =>
			['admin', 'dispute_manager'].includes(userRole.role),
		)

		if (!hasRequiredRole) {
			return NextResponse.json(
				{ error: 'Not authorized to assign mediators' },
				{ status: 403 },
			)
		}

		// 5. Check if a mediator is already assigned to this dispute
		const { data: existingAssignment, error: assignmentError } = await supabase
			.from('escrow_dispute_assignments')
			.select('*')
			.eq('review_id', disputeId)
			.maybeSingle()

		if (existingAssignment) {
			// If there's an existing assignment, update it
			const { error: updateError } = await supabase
				.from('escrow_dispute_assignments')
				.update({
					mediator_id: mediatorId,
					assigned_by: assignedById,
					assigned_at: new Date().toISOString(),
				})
				.eq('review_id', disputeId)

			if (updateError) {
				throw new Error(
					`Failed to update mediator assignment: ${updateError.message}`,
				)
			}
		} else {
			// If there's no existing assignment, create a new one
			const { error: insertError } = await supabase
				.from('escrow_dispute_assignments')
				.insert({
					review_id: disputeId,
					mediator_id: mediatorId,
					assigned_by: assignedById,
					assigned_at: new Date().toISOString(),
				})

			if (insertError) {
				throw new Error(
					`Failed to create mediator assignment: ${insertError.message}`,
				)
			}
		}

		// Note: We're skipping updating the dispute status here as per feedback
		// The status will be updated after the user signs the transaction
		// This follows the Trustless Work API flow where we prepare the transaction first,
		// then the user signs it, and only then do we update the off-chain data

		// 7. Send notification to the mediator
		const { error: notificationError } = await supabase
			.from('notifications')
			.insert({
				user_id: mediator.user_id,
				review_id: disputeId, // Use review_id instead of dispute_id
				message: 'You have been assigned as a mediator for a dispute',
				type: 'MEDIATOR_ASSIGNED',
			})

		if (notificationError) {
			console.error('Failed to send notification:', notificationError)
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

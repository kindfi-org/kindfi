import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import type { MediatorAssignmentPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateMediatorAssignment } from '~/lib/validators/escrow'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the mediator assignment data
		const assignmentData: MediatorAssignmentPayload = await req.json()
		const validationResult = validateMediatorAssignment(assignmentData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid mediator assignment data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const { disputeId, mediatorId, assignedById } = assignmentData

		// 2. Verify the dispute exists and is in PENDING status
		const { data: dispute, error: disputeError } = await supabase
			.from('escrow_disputes')
			.select('*')
			.eq('id', disputeId)
			.eq('status', 'PENDING')
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
			return NextResponse.json(
				{ error: 'Mediator not found' },
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
			return NextResponse.json(
				{ error: 'Assigner not found' },
				{ status: 404 },
			)
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
			.eq('dispute_id', disputeId)
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
				.eq('dispute_id', disputeId)

			if (updateError) {
				throw new Error(`Failed to update mediator assignment: ${updateError.message}`)
			}
		} else {
			// If there's no existing assignment, create a new one
			const { error: insertError } = await supabase
				.from('escrow_dispute_assignments')
				.insert({
					dispute_id: disputeId,
					mediator_id: mediatorId,
					assigned_by: assignedById,
					assigned_at: new Date().toISOString(),
				})

			if (insertError) {
				throw new Error(`Failed to create mediator assignment: ${insertError.message}`)
			}
		}

		// 6. Update the dispute status to indicate a mediator has been assigned
		const { error: updateError } = await supabase
			.from('escrow_disputes')
			.update({
				status: 'MEDIATION',
				updated_at: new Date().toISOString(),
			})
			.eq('id', disputeId)

		if (updateError) {
			throw new Error(`Failed to update dispute status: ${updateError.message}`)
		}

		// 7. Send notification to the mediator
		const { error: notificationError } = await supabase
			.from('notifications')
			.insert({
				user_id: mediator.user_id,
				dispute_id: disputeId,
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

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url)
		const disputeId = url.searchParams.get('disputeId')

		if (!disputeId) {
			return NextResponse.json(
				{ error: 'Dispute ID is required' },
				{ status: 400 },
			)
		}

		const { data: assignment, error } = await supabase
			.from('escrow_dispute_assignments')
			.select(
				`
				*,
				escrow_mediators!inner(id, mediator_address, name, user_id),
				users!inner(id, email, display_name)
			`,
			)
			.eq('dispute_id', disputeId)
			.single()

		if (error) {
			if (error.code === 'PGRST116') {
				// No mediator assigned yet
				return NextResponse.json(
					{
						success: true,
						data: null,
						message: 'No mediator assigned to this dispute',
					},
					{ status: 200 },
				)
			}
			throw new Error(`Failed to fetch mediator assignment: ${error.message}`)
		}

		return NextResponse.json(
			{
				success: true,
				data: assignment,
			},
			{ status: 200 },
		)
	} catch (error) {
		console.error('Fetch Mediator Assignment Error:', error)

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

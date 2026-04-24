import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { AuditLogger } from '~/lib/services/audit-logger'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import type { DisputeResolutionPayload } from '~/lib/types/escrow/escrow-payload.types'
import { generateUniqueId } from '~/lib/utils/id'
import { validateDisputeResolution } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	const auditLogger = new AuditLogger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		// 1. Parse and validate the dispute resolution data
		const resolutionData = await req.json()
		const validationResult = validateDisputeResolution(resolutionData)

		if (!validationResult.success) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.dispute.resolve',
				resourceType: 'dispute',
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return NextResponse.json(
				{
					error: 'Invalid dispute resolution data',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			)
		}

		const validatedData = validationResult.data as DisputeResolutionPayload

		// TODO: Improve this validation. Some fields are mixed with current logic.
		const {
			// Dispute ID is the ID of the AI conversation between the Kindler and the admin where the AI is the mediator
			disputeId,
			// Mediator ID is the signer kindler user ID (off-chain)
			mediatorId,
			resolution,
			resolutionNotes,
			approverAmount,
			serviceProviderAmount,
			signer,
			escrowContractAddress,
		} = validatedData

		// 2. Verify the dispute exists and is in PENDING or MEDIATION status
		const { data: dispute, error: disputeError } = await supabase
			.from('escrow_reviews')
			.select('*, escrow_milestones!inner(id, escrow_id)')
			.eq('id', disputeId)
			.in('status', ['PENDING', 'MEDIATION'])
			.eq('type', 'dispute')
			.single()

		if (disputeError || !dispute) {
			return NextResponse.json(
				{ error: 'Dispute not found or already resolved' },
				{ status: 404 },
			)
		}

		// 4. Resolve the dispute on-chain through the Trustless Work API
		// Create the payload with the correct types
		const resolvePayload = {
			signerAddress: signer, // Using mediator's blockchain address
			contractId: escrowContractAddress,
			approverAmount,
			serviceProviderAmount,
		}

		const escrowResponse = await createEscrowRequest({
			action: 'resolveDispute',
			method: 'POST',
			data: resolvePayload,
		})

		if (!escrowResponse.unsignedTransaction) {
			throw new Error('Failed to retrieve unsigned transaction XDR')
		}

		// 4. Return the unsigned transaction to the client for signing
		// The client will sign the transaction and send it to the /escrow/dispute/sign endpoint
		// to finalize the signature and update the database

		await auditLogger.log({
			correlationId,
			operation: 'escrow.dispute.resolve',
			resourceType: 'dispute',
			resourceId: disputeId,
			actorId: mediatorId,
			status: 'success',
			durationMs: Date.now() - startTime,
			metadata: {
				resolution,
				approverAmount,
				serviceProviderAmount,
				escrowContractAddress,
				signer: AuditLogger.maskAddress(signer),
			},
		})

		return NextResponse.json(
			{
				success: true,
				message: 'Unsigned transaction created successfully',
				data: {
					unsignedTransaction: escrowResponse.unsignedTransaction,
					disputeId,
					mediatorId,
					resolution,
					resolutionNotes,
					approverAmount,
					serviceProviderAmount,
					escrowContractAddress,
					// Access the milestone_id from the first item in the escrow_milestones array
					milestoneId: dispute.escrow_milestones?.[0]?.id,
				},
			},
			{ status: 200 },
		)

		// Note: Notifications will be handled by the /escrow/dispute/sign endpoint
		// after the transaction is signed and submitted
	} catch (error) {
		console.error('Dispute Resolution Error:', error)

		if (error instanceof AppError) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.dispute.resolve',
				resourceType: 'dispute',
				status: 'failure',
				errorCode: String(error.statusCode),
				durationMs: Date.now() - startTime,
				metadata: { error: error.message },
			})
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		await auditLogger.log({
			correlationId,
			operation: 'escrow.dispute.resolve',
			resourceType: 'dispute',
			status: 'failure',
			errorCode: '500',
			durationMs: Date.now() - startTime,
			metadata: { error: error instanceof Error ? error.message : String(error) },
		})
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

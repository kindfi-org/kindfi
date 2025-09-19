import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '~/lib'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import type { DisputeResolutionPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateDisputeResolution } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the dispute resolution data
		const resolutionData = await req.json()
		const validationResult = validateDisputeResolution(resolutionData)

		if (!validationResult.success) {
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
		logger.error({
			eventType: 'Dispute Resolution Error',
			error: error,
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

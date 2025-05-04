import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
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

		const {
			disputeId,
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
			.select('*, escrow_milestones!inner(escrow_id)')
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

		// Note: We're skipping mediator verification as per feedback
		// The frontend will validate the properties to send to our API
		// We'll directly proceed with the dispute resolution through the Trustless Work API

		// 3. Resolve the dispute on-chain through the Trustless Work API
		// Create the payload with the correct types
		const resolvePayload = {
			signerAddress: mediatorId, // Using mediator ID instead of signer secret
			contractId: escrowContractAddress,
			approverAmount,
			serviceProviderAmount,
		};

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
					milestoneId: dispute.milestone_id,
				}
			},
			{ status: 200 },
		)

		// Note: Notifications will be handled by the /escrow/dispute/sign endpoint
		// after the transaction is signed and submitted
	} catch (error) {
		console.error('Dispute Resolution Error:', error)

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

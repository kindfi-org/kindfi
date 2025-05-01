import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
import type { DisputeResolutionPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateDisputeResolution } from '~/lib/validators/escrow'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the dispute resolution data
		const resolutionData: DisputeResolutionPayload = await req.json()
		const validationResult = validateDisputeResolution(resolutionData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid dispute resolution data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const {
			disputeId,
			mediatorId,
			resolution,
			resolutionNotes,
			approverAmount,
			serviceProviderAmount,
			signer,
			escrowContractAddress,
		} = resolutionData

		// 2. Verify the dispute exists and is in PENDING status
		const { data: dispute, error: disputeError } = await supabase
			.from('escrow_disputes')
			.select('*, escrow_milestones!inner(escrow_id)')
			.eq('id', disputeId)
			.eq('status', 'PENDING')
			.single()

		if (disputeError || !dispute) {
			return NextResponse.json(
				{ error: 'Dispute not found or already resolved' },
				{ status: 404 },
			)
		}

		// 3. Verify the mediator is authorized to resolve this dispute
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

		// 4. Verify the mediator is assigned to this dispute
		const { data: assignment, error: assignmentError } = await supabase
			.from('escrow_dispute_assignments')
			.select('*')
			.eq('dispute_id', disputeId)
			.eq('mediator_id', mediatorId)
			.single()

		if (assignmentError || !assignment) {
			return NextResponse.json(
				{ error: 'Mediator not assigned to this dispute' },
				{ status: 403 },
			)
		}

		// 5. Resolve the dispute on-chain through the Trustless Work API
		const escrowResponse = await createEscrowRequest({
			action: 'resolveDispute',
			method: 'POST',
			data: {
				signer,
				contractId: escrowContractAddress,
				approverFunds: approverAmount,
				serviceProviderFunds: serviceProviderAmount,
			},
		})

		if (!escrowResponse.unsignedTransaction) {
			throw new Error('Failed to retrieve unsigned transaction XDR')
		}

		// 6. Sign the transaction
		const signedTxXdr = signTransaction(
			escrowResponse.unsignedTransaction,
			Networks.TESTNET, // Change to MAINNET if in production
			signer,
		)

		if (!signedTxXdr) {
			throw new Error('Transaction signing failed')
		}

		// 7. Send the signed transaction to the blockchain
		const txResponse = await sendTransaction(signedTxXdr)

		if (!txResponse || !txResponse.txHash) {
			throw new Error('Failed to resolve dispute on-chain')
		}

		// 8. Update the dispute status in the database
		const { error: updateError } = await supabase
			.from('escrow_disputes')
			.update({
				status: resolution,
				resolution_notes: resolutionNotes,
				resolved_by: mediatorId,
				resolved_at: new Date().toISOString(),
				resolution_tx_hash: txResponse.txHash,
				approver_amount: approverAmount,
				service_provider_amount: serviceProviderAmount,
			})
			.eq('id', disputeId)

		if (updateError) {
			throw new Error(`Failed to update dispute status: ${updateError.message}`)
		}

		// 9. Update the milestone status based on the resolution
		const milestoneStatus =
			resolution === 'APPROVED' ? 'completed' : 'rejected'

		await supabase
			.from('escrow_milestones')
			.update({ status: milestoneStatus })
			.eq('id', dispute.escrow_milestones.id)

		// 10. Create notifications for all parties involved
		const { data: escrow } = await supabase
			.from('escrow_contracts')
			.select('service_provider_id, approver_id')
			.eq('id', dispute.escrow_milestones.escrow_id)
			.single()

		if (escrow) {
			await supabase.from('notifications').insert([
				{
					user_id: escrow.service_provider_id,
					dispute_id: disputeId,
					message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
					type: 'DISPUTE_RESOLVED',
				},
				{
					user_id: escrow.approver_id,
					dispute_id: disputeId,
					message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
					type: 'DISPUTE_RESOLVED',
				},
			])
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Dispute resolved successfully',
				data: {
					disputeId,
					transactionHash: txResponse.txHash,
					status: resolution,
				},
			},
			{ status: 200 },
		)
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

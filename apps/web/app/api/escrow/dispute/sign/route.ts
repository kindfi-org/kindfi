import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
import type { DisputeSignPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateDisputeSign } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the dispute sign data
		const signData = await req.json()
		const validationResult = validateDisputeSign(signData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid dispute sign data',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			)
		}
		
		const validatedData = validationResult.data as DisputeSignPayload

		const {
			unsignedTransaction,
			signer,
			type, // 'file' or 'resolve'
			// For filing a dispute
			escrowId,
			milestoneId,
			filerAddress,
			disputeReason,
			evidenceUrls,
			escrowParticipantId,
			// For resolving a dispute
			disputeId,
			mediatorId,
			resolution,
			resolutionNotes,
			approverAmount,
			serviceProviderAmount,
		} = validatedData

		// 2. Sign the transaction
		const signedTxXdr = signTransaction(
			unsignedTransaction,
			Networks.TESTNET, // Change to MAINNET if in production
			signer,
		)

		if (!signedTxXdr) {
			throw new Error('Transaction signing failed')
		}

		// 3. Send the signed transaction to the blockchain
		const txResponse = await sendTransaction(signedTxXdr)

		if (!txResponse || !txResponse.txHash) {
			throw new Error('Failed to send transaction to the blockchain')
		}

		// 4. Update the database based on the transaction type
		if (type === 'file') {
			// Record the dispute in the database
			const { data: dispute, error: insertError } = await supabase
				.from('escrow_reviews')
				.insert({
					escrow_id: escrowId,
					milestone_id: milestoneId,
					reviewer_address: filerAddress,
					disputer_id: escrowParticipantId,
					review_notes: disputeReason,
					evidence_urls: evidenceUrls,
					transaction_hash: txResponse.txHash,
					status: 'PENDING',
					type: 'dispute',
					created_at: new Date().toISOString(),
				})
				.select('id')
				.single()

			if (insertError) {
				throw new Error(`Failed to record dispute: ${insertError.message}`)
			}

			// Update the milestone status to indicate a dispute is in progress
			await supabase
				.from('escrow_milestones')
				.update({ status: 'disputed' })
				.eq('id', milestoneId)

			// Get escrow contract details for notifications
			const { data: escrow } = await supabase
				.from('escrow_contracts')
				.select('service_provider_id, approver_id')
				.eq('id', escrowId)
				.single()

			// Get milestone details for notifications
			const { data: milestone } = await supabase
				.from('escrow_milestones')
				.select('title')
				.eq('id', milestoneId)
				.single()

			// Create notifications for all parties involved
			if (escrow && milestone) {
				await supabase.from('notifications').insert([
					{
						user_id: escrow.service_provider_id,
						milestone_id: milestoneId,
						message: `A dispute has been filed for milestone: ${milestone.title}`,
						type: 'DISPUTE_FILED',
					},
					{
						user_id: escrow.approver_id,
						milestone_id: milestoneId,
						message: `A dispute has been filed for milestone: ${milestone.title}`,
						type: 'DISPUTE_FILED',
					},
				])
			}

			return NextResponse.json(
				{
					success: true,
					message: 'Dispute filed successfully',
					data: {
						disputeId: dispute.id,
						transactionHash: txResponse.txHash,
						status: 'PENDING',
					},
				},
				{ status: 201 },
			)
		} else if (type === 'resolve') {
			// Update the dispute status in the database
			const { error: updateError } = await supabase
				.from('escrow_reviews')
				.update({
					status: resolution,
					resolution_text: resolutionNotes,
					reviewed_at: new Date().toISOString(),
					transaction_hash: txResponse.txHash,
					review_notes: JSON.stringify({
						approverAmount,
						serviceProviderAmount,
						mediatorId
					})
				})
				.eq('id', disputeId)

			if (updateError) {
				throw new Error(`Failed to update dispute status: ${updateError.message}`)
			}

			// Get the dispute details
			const { data: dispute } = await supabase
				.from('escrow_reviews')
				.select('*, escrow_milestones!inner(escrow_id, id)')
				.eq('id', disputeId)
				.single()

			if (dispute) {
				// Update the milestone status based on the resolution
				const milestoneStatus =
					resolution === 'APPROVED' ? 'completed' : 'rejected'

				await supabase
					.from('escrow_milestones')
					.update({ status: milestoneStatus })
					.eq('id', dispute.escrow_milestones.id)

				// Get escrow contract details for notifications
				const { data: escrow } = await supabase
					.from('escrow_contracts')
					.select('service_provider_id, approver_id')
					.eq('id', dispute.escrow_milestones.escrow_id)
					.single()

				// Create notifications for all parties involved
				if (escrow) {
					await supabase.from('notifications').insert([
						{
							user_id: escrow.service_provider_id,
							review_id: disputeId,
							message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
							type: 'DISPUTE_RESOLVED',
						},
						{
							user_id: escrow.approver_id,
							review_id: disputeId,
							message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
							type: 'DISPUTE_RESOLVED',
						},
					])
				}
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
		} else {
			return NextResponse.json(
				{ error: 'Invalid transaction type' },
				{ status: 400 },
			)
		}
	} catch (error) {
		console.error('Dispute Sign Error:', error)

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

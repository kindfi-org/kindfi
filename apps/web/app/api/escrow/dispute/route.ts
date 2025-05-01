import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
import type { DisputePayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateDispute } from '~/lib/validators/escrow'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the dispute data
		const disputeData: DisputePayload = await req.json()
		const validationResult = validateDispute(disputeData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid dispute data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const {
			escrowId,
			milestoneId,
			filerAddress,
			disputeReason,
			evidenceUrls,
			signer,
			escrowContractAddress,
		} = disputeData

		// 2. Verify the escrow contract and milestone exist
		const { data: escrow, error: escrowError } = await supabase
			.from('escrow_contracts')
			.select('*')
			.eq('id', escrowId)
			.single()

		if (escrowError || !escrow) {
			return NextResponse.json(
				{ error: 'Escrow contract not found' },
				{ status: 404 },
			)
		}

		const { data: milestone, error: milestoneError } = await supabase
			.from('escrow_milestones')
			.select('*')
			.eq('id', milestoneId)
			.single()

		if (milestoneError || !milestone) {
			return NextResponse.json(
				{ error: 'Milestone not found' },
				{ status: 404 },
			)
		}

		// 3. Verify the user is allowed to file a dispute
		// This could be either the service provider or the approver
		const { data: escrowParticipant, error: participantError } = await supabase
			.from('escrow_participants')
			.select('*')
			.eq('escrow_id', escrowId)
			.eq('participant_address', filerAddress)
			.single()

		if (participantError || !escrowParticipant) {
			return NextResponse.json(
				{ error: 'Not authorized to file a dispute for this escrow' },
				{ status: 403 },
			)
		}

		// 4. Check if a dispute already exists for this milestone
		const { data: existingDispute, error: disputeError } = await supabase
			.from('escrow_disputes')
			.select('*')
			.eq('milestone_id', milestoneId)
			.eq('status', 'PENDING')
			.maybeSingle()

		if (existingDispute) {
			return NextResponse.json(
				{ error: 'A dispute is already in progress for this milestone' },
				{ status: 409 },
			)
		}

		// 5. Initiate the dispute on-chain through the Trustless Work API
		const escrowResponse = await createEscrowRequest({
			action: 'startDispute',
			method: 'POST',
			data: { signer, contractId: escrowContractAddress },
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
			throw new Error('Failed to initiate dispute on-chain')
		}

		// 8. Record the dispute in the database
		const { data: dispute, error: insertError } = await supabase
			.from('escrow_disputes')
			.insert({
				escrow_id: escrowId,
				milestone_id: milestoneId,
				filer_address: filerAddress,
				dispute_reason: disputeReason,
				evidence_urls: evidenceUrls,
				transaction_hash: txResponse.txHash,
				status: 'PENDING',
				created_at: new Date().toISOString(),
			})
			.select('id')
			.single()

		if (insertError) {
			throw new Error(`Failed to record dispute: ${insertError.message}`)
		}

		// 9. Update the milestone status to indicate a dispute is in progress
		await supabase
			.from('escrow_milestones')
			.update({ status: 'disputed' })
			.eq('id', milestoneId)

		// 10. Create a notification for all parties involved
		await supabase.from('notifications').insert([
			{
				user_id: escrow.service_provider_id, // Service provider
				milestone_id: milestoneId,
				message: `A dispute has been filed for milestone: ${milestone.title}`,
				type: 'DISPUTE_FILED',
			},
			{
				user_id: escrow.approver_id, // Approver
				milestone_id: milestoneId,
				message: `A dispute has been filed for milestone: ${milestone.title}`,
				type: 'DISPUTE_FILED',
			},
		])

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
	} catch (error) {
		console.error('Dispute Filing Error:', error)

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
		const escrowId = url.searchParams.get('escrowId')
		const status = url.searchParams.get('status')

		if (!escrowId) {
			return NextResponse.json(
				{ error: 'Escrow ID is required' },
				{ status: 400 },
			)
		}

		let query = supabase
			.from('escrow_disputes')
			.select(
				`
				*,
				escrow_milestones!inner(title, description),
				escrow_mediators(id, mediator_address, name)
			`,
			)
			.eq('escrow_id', escrowId)

		if (status) {
			query = query.eq('status', status.toUpperCase())
		}

		const { data: disputes, error } = await query.order('created_at', {
			ascending: false,
		})

		if (error) {
			throw new Error(`Failed to fetch disputes: ${error.message}`)
		}

		return NextResponse.json(
			{
				success: true,
				data: disputes,
			},
			{ status: 200 },
		)
	} catch (error) {
		console.error('Fetch Disputes Error:', error)

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

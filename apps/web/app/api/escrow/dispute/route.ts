import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
import type { DisputePayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateDispute } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	try {
		// 1. Parse and validate the dispute data
		const disputeData = await req.json()
		const validationResult = validateDispute(disputeData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid dispute data',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			)
		}

		const validatedData = validationResult.data as DisputePayload

		const {
			escrowId,
			milestoneId,
			filerAddress,
			disputeReason,
			evidenceUrls,
			signer,
			escrowContractAddress,
		} = validatedData

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
			.from('escrow_reviews')
			.select('*')
			.eq('milestone_id', milestoneId)
			.eq('status', 'PENDING')
			.eq('type', 'dispute')
			.maybeSingle()

		if (existingDispute) {
			return NextResponse.json(
				{ error: 'A dispute is already in progress for this milestone' },
				{ status: 409 },
			)
		}

		// 5. Initiate the dispute on-chain through the Trustless Work API
		// Create the payload with the correct types
		const disputePayload = {
			signerAddress: filerAddress,
			contractId: escrowContractAddress,
		}

		const escrowResponse = await createEscrowRequest({
			action: 'startDispute',
			method: 'POST',
			data: disputePayload,
		})

		if (!escrowResponse.unsignedTransaction) {
			throw new Error('Failed to retrieve unsigned transaction XDR')
		}

		// 6. Return the unsigned transaction to the client for signing
		// The client will sign the transaction and send it to the /escrow/dispute/sign endpoint
		// to finalize the signature and update the database
		return NextResponse.json(
			{
				success: true,
				message: 'Unsigned transaction created successfully',
				data: {
					unsignedTransaction: escrowResponse.unsignedTransaction,
					escrowId,
					milestoneId,
					filerAddress,
					disputeReason,
					evidenceUrls,
					escrowContractAddress,
					escrowParticipantId: escrowParticipant.id,
				},
			},
			{ status: 200 },
		)
		// Note: The database updates and notifications will be handled by the /escrow/dispute/sign endpoint
		// after the transaction is signed and submitted
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
			.from('escrow_reviews')
			.select(
				`
				*,
				escrow_milestones!inner(title, description),
				escrow_mediators(id, mediator_address, name)
			`,
			)
			.eq('type', 'dispute')
			.eq('escrow_id', escrowId)

		if (status) {
			query = query.eq('status', status.toLowerCase())
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

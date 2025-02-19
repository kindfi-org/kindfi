import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import type { EscrowFundData } from '~/lib/types/escrow/escrow-payload.types'
import { validateEscrowFunding } from '~/lib/validators/escrow'
import { supabase } from '~/lib/supabase/config'

export async function POST(req: NextRequest) {
	try {
		const fundingData: EscrowFundData = await req.json()
		const validationResult = validateEscrowFunding(fundingData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid escrow fund data',
					details: validationResult.errors,
				},
				{ status: 400 }
			)
		}

		const {
			fundParams: { userId, stellarTransactionHash, amount, transactionType },
			metadata,
		} = fundingData

		// Insert transaction into the database
		const { data: dbResult, error: dbError } = await supabase
			.from('transactions')
			.insert({
				transaction_hash: stellarTransactionHash,
				user_id: userId,
				project_id: metadata.escrowId,
				amount: amount,
				transaction_type: transactionType,
				status: 'PENDING',
				metadata: metadata,
			})
			.select('id')
			.single()

		if (dbError) {
			return NextResponse.json(
				{
					error: 'Failed to add fund transaction',
					details: dbError.message,
				},
				{ status: 500 }
			)
		}

		return NextResponse.json(
			{
				transactionId: dbResult.id,
				status: 'INITIALIZED',
			},
			{ status: 201 }
		)
	} catch (error) {
		if (error instanceof AppError) {
			console.error('Escrow Fund error:', error)
			return NextResponse.json(
				{
					error: error.message,
					details: error.details,
				},
				{ status: error.statusCode }
			)
		}

		console.error('Internal server error during escrow fund:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Internal server error during escrow fund',
			},
			{ status: 500 }
		)
	}
}

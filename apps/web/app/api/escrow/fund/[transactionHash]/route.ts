import { supabase } from '@packages/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { escrowFundUpdateSchema } from '~/lib/schemas/escrow.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ transactionHash: string }> },
) {
	try {
		const transactionHash = (await params).transactionHash
		const body = await req.json()
		const validation = validateRequest(escrowFundUpdateSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { escrowId, status } = validation.data

		// Update transaction status
		const { data, error } = await supabase
			.from('transactions')
			.update({ status, confirmed_at: new Date().toISOString() })
			.eq('transaction_hash', transactionHash)
			.eq('project_id', escrowId) // Ensure escrowId matches

		if (error) throw new Error(error.message)

		return NextResponse.json(
			{ message: 'Transaction updated', data },
			{ status: 200 },
		)
	} catch (error) {
		if (error instanceof AppError) {
			console.error('Escrow Fund error:', error)
			return NextResponse.json(
				{
					error: error.message,
					details: error.details,
				},
				{ status: error.statusCode },
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
			{ status: 500 },
		)
	}
}

import { supabase } from '@packages/lib/src/supabase/service-role-client'
import { type NextRequest, NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import type { EscrowFundUpdateData } from '~/lib/types/escrow/escrow-payload.types'
import { validateEscrowFundUpdate } from '~/lib/validators/escrow'

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ transactionHash: string }> },
) {
	try {
		const transactionHash = (await params).transactionHash
		const updateData: EscrowFundUpdateData = await req.json()

		const validationResult = validateEscrowFundUpdate(updateData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid escrow fund update data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const { escrowId, status } = updateData

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

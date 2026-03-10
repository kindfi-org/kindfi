import { supabase } from '@packages/lib/supabase'
import { Networks } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { signTransaction } from '~/lib/stellar/utils/sign-transaction'
import { escrowFundSchema } from '~/lib/schemas/escrow.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const validation = validateRequest(escrowFundSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { signer, fundParams, metadata } = validation.data
		const { userId, amount, transactionType, escrowContract } = fundParams

		const { unsignedTransaction } = await createEscrowRequest({
			action: 'fund',
			method: 'POST',
			data: { signer, contractId: escrowContract },
		})

		if (!unsignedTransaction) {
			throw new Error('Failed to retrieve unsigned transaction XDR')
		}

		const signedTxXdr = signTransaction(
			unsignedTransaction,
			Networks.TESTNET,
			signer,
		)
		if (!signedTxXdr) {
			throw new Error('Transaction signing failed')
		}

		const txResponse = await sendTransaction(signedTxXdr)
		if (!txResponse) {
			throw new Error('Failed to fund escrow')
		}

		const { data: dbResult, error: dbError } = await supabase
			.from('transactions')
			.insert({
				transaction_hash: txResponse.txHash,
				user_id: userId,
				project_id: metadata.escrowId,
				amount,
				transaction_type: transactionType,
				status: 'PENDING',
				metadata,
			})
			.select('id')
			.single()

		if (dbError) {
			return NextResponse.json(
				{ error: 'Failed to add fund transaction', details: dbError.message },
				{ status: 500 },
			)
		}

		return NextResponse.json(
			{
				transactionId: dbResult.id,
				transactionHash: txResponse.txHash,
				status: 'INITIALIZED',
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Escrow Fund Error:', error)

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		console.error('Internal server error during escrow initialization:', error)

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

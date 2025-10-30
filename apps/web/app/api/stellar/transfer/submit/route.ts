import { TransactionBuilder } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SmartWalletTransactionService } from '~/lib/stellar/smart-wallet-transactions'

/**
 * POST /api/stellar/transfer/submit
 *
 * Submit a signed transaction to the network
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { transactionXDR, signature, smartWalletAddress } = body

		// Validate inputs
		if (!transactionXDR || !signature || !smartWalletAddress) {
			return NextResponse.json(
				{
					error: 'Missing required fields',
				},
				{ status: 400 },
			)
		}

		// Initialize service
		const txService = new SmartWalletTransactionService(
			process.env.STELLAR_NETWORK_PASSPHRASE,
			process.env.STELLAR_RPC_URL,
			process.env.STELLAR_FUNDING_SECRET_KEY,
		)

		// TODO: Assemble transaction with WebAuthn signature
		// For now, we'll parse the transaction directly
		// In production, implement proper signature verification and assembly
		const signedTx = TransactionBuilder.fromXDR(
			transactionXDR,
			process.env.STELLAR_NETWORK_PASSPHRASE ||
				'Test SDF Network ; September 2015',
		)

		// Submit to network
		const txHash = await txService.submitTransaction(signedTx)

		return NextResponse.json({
			success: true,
			data: {
				txHash,
				status: 'success',
			},
		})
	} catch (error) {
		console.error('Error submitting transfer:', error)
		return NextResponse.json(
			{
				error: 'Failed to submit transfer',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

import { appEnvConfig } from '@packages/lib/config'
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

		// Get configuration
		const config = appEnvConfig('web')

		// Initialize service with proper config
		const txService = new SmartWalletTransactionService(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		// TODO: Assemble transaction with WebAuthn signature
		// For now, we'll parse the transaction directly
		// In production, implement proper signature verification and assembly
		const parsedTx = TransactionBuilder.fromXDR(
			transactionXDR,
			config.stellar.networkPassphrase,
		)

		// Type guard: ensure we have a regular Transaction, not a FeeBumpTransaction
		if ('innerTransaction' in parsedTx) {
			return NextResponse.json(
				{
					error: 'FeeBumpTransaction is not supported',
				},
				{ status: 400 },
			)
		}

		// Submit to network
		const txHash = await txService.submitTransaction(parsedTx)

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

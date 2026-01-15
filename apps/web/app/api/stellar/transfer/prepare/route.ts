import { appEnvConfig } from '@packages/lib/config'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
	SmartWalletTransactionService,
	type TransactionChallenge,
} from '~/lib/stellar/smart-wallet-transactions'

/**
 * POST /api/stellar/transfer/prepare
 *
 * Build a transfer transaction for WebAuthn signing
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { from, to, amount, asset, sponsorFees } = body

		// Validate inputs
		if (!from || !to || !amount) {
			return NextResponse.json(
				{
					error: 'Missing required fields: from, to, amount',
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

		// Build transaction
		let result: TransactionChallenge
		if (asset === 'native' || !asset) {
			// Transfer XLM
			result = await txService.transferXLM({
				from,
				to,
				amount: Number(amount),
				sponsorFees: sponsorFees ?? false,
			})
		} else {
			// Transfer token
			result = await txService.transferToken({
				from,
				to,
				tokenAddress: asset,
				amount: Number(amount),
				sponsorFees: sponsorFees ?? false,
			})
		}

		return NextResponse.json({
			success: true,
			data: {
				challenge: result.challenge,
				transactionXDR: result.transactionXDR,
				hash: result.hash,
			},
		})
	} catch (error) {
		console.error('Error preparing transfer:', error)
		return NextResponse.json(
			{
				error: 'Failed to prepare transfer',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

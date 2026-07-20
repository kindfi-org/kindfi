import { appEnvConfig } from '@packages/lib/config'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createSmartAccountTransactionBuilder } from '@/lib/smart-account/adapters/transaction-builder.adapter'
import { requireSmartAccountFeature } from '@/lib/smart-account/guards/require-smart-account-feature'
import { transferPrepareSchema } from '~/lib/schemas/stellar.schemas'
import type { TransactionChallenge } from '~/lib/smart-account/transactions/smart-wallet-transactions'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/stellar/transfer/prepare
 *
 * Build a transfer transaction for WebAuthn signing
 */
export async function POST(req: NextRequest) {
	try {
		const featureGuard = requireSmartAccountFeature()
		if (featureGuard) return featureGuard

		const body = await req.json()
		const validation = validateRequest(transferPrepareSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { from, to, amount, asset, sponsorFees } = validation.data

		// Get configuration
		const config = appEnvConfig('web')

		const txService = createSmartAccountTransactionBuilder(
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
		logger.error('Error preparing transfer:', error)
		return NextResponse.json(
			{
				error: 'Failed to prepare transfer',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

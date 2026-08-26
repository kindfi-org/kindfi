import { appEnvConfig } from '@packages/lib/config'
import { isSmartAccountContractAddress } from '@packages/lib/utils/wallet-address'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { SmartWalletTransactionBuilderAdapter } from '@/lib/smart-account/adapters/transaction-builder.adapter'
import { requireSmartAccountFeature } from '@/lib/smart-account/guards/require-smart-account-feature'
import { addressParamSchema } from '~/lib/schemas/stellar.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * GET /api/stellar/balances/[address]
 *
 * Get balances for a smart wallet
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
	try {
		const featureGuard = requireSmartAccountFeature()
		if (featureGuard) return featureGuard

		const { address } = await params
		const validation = validateRequest(addressParamSchema, { address })
		if (!validation.success) return validation.response
		const { address: validatedAddress } = validation.data

		if (!isSmartAccountContractAddress(validatedAddress)) {
			return NextResponse.json(
				{ error: 'Balances endpoint requires a Smart Account C-address' },
				{ status: 400 },
			)
		}

		// Get configuration
		const config = appEnvConfig('web')

		const txService = new SmartWalletTransactionBuilderAdapter(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		const balances = await txService.getService().getBalances(validatedAddress)

		// Convert stroops to XLM for display
		const xlmBalance = (Number(balances.xlm) / 10_000_000).toFixed(7)

		return NextResponse.json({
			success: true,
			data: {
				xlm: {
					balance: xlmBalance,
					raw: balances.xlm,
					symbol: 'XLM',
				},
				tokens: balances.tokens,
			},
		})
	} catch (error) {
		logger.error('Error fetching balances:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch balances',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

import { appEnvConfig } from '@packages/lib/config'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { addressParamSchema } from '~/lib/schemas/stellar.schemas'
import { SmartWalletTransactionService } from '~/lib/stellar/smart-wallet-transactions'
import { validateRequest } from '~/lib/utils/validation'

/**
 * GET /api/stellar/balances/[address]
 *
 * Get balances for a smart wallet
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ address: string }> },
) {
	try {
		const { address } = await params
		const validation = validateRequest(addressParamSchema, { address })
		if (!validation.success) return validation.response
		const { address: validatedAddress } = validation.data

		// Get configuration
		const config = appEnvConfig('web')

		// Initialize service with proper config
		const txService = new SmartWalletTransactionService(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		const balances = await txService.getBalances(validatedAddress)

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
		console.error('Error fetching balances:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch balances',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

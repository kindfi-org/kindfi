import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SmartWalletTransactionService } from '~/lib/stellar/smart-wallet-transactions'

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

		if (!address) {
			return NextResponse.json(
				{
					error: 'Missing smart wallet address',
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

		const balances = await txService.getBalances(address)

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

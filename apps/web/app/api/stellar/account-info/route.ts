import { appEnvConfig } from '@packages/lib/config'
import { StellarPasskeyService } from '@packages/lib/stellar'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/stellar/account-info
 *
 * Get information about a Stellar smart wallet account
 * Replaces the KYC server endpoint
 */
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const address = searchParams.get('address')

		if (!address) {
			return NextResponse.json(
				{ error: 'Missing address parameter' },
				{ status: 400 },
			)
		}

		const config = appEnvConfig('web')

		// Initialize Stellar service
		const stellarService = new StellarPasskeyService(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		const accountInfo = await stellarService.getAccountInfo(address)

		return NextResponse.json({
			success: true,
			data: accountInfo,
		})
	} catch (error) {
		console.error('❌ Error getting account info:', error)
		return NextResponse.json(
			{
				error: 'Failed to get account information',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

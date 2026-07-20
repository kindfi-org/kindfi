import { appEnvConfig } from '@packages/lib/config'
import { createSmartAccountDeployer } from '@packages/lib/smart-account/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireSmartAccountFeature } from '@/lib/smart-account/guards/require-smart-account-feature'
import { accountInfoQuerySchema } from '~/lib/schemas/stellar.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * GET /api/stellar/account-info
 *
 * Get information about a Stellar smart wallet account
 * Replaces the KYC server endpoint
 */
export async function GET(req: NextRequest) {
	try {
		const featureGuard = requireSmartAccountFeature()
		if (featureGuard) return featureGuard

		const { searchParams } = new URL(req.url)
		const query = { address: searchParams.get('address') }
		const validation = validateRequest(accountInfoQuerySchema, query)
		if (!validation.success) return validation.response
		const { address } = validation.data

		const config = appEnvConfig('web')

		const deployer = createSmartAccountDeployer(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		const accountInfo = await deployer.getAccountInfo(address)

		return NextResponse.json({
			success: true,
			data: accountInfo,
		})
	} catch (error) {
		logger.error('❌ Error getting account info:', error)
		return NextResponse.json(
			{
				error: 'Failed to get account information',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

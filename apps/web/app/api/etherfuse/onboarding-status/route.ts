import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { AppError } from '~/lib/error'
import { getEtherfuseConfig } from '~/lib/etherfuse/get-etherfuse-config'
import { getEtherfuseOnboardingStatus } from '~/lib/etherfuse/resolve-order-context'
import { isExternalStellarWallet } from '~/lib/etherfuse/wallet'
import { withRateLimit } from '~/lib/middleware/rate-limit'

async function onboardingStatusHandler(req: NextRequest) {
	try {
		const session = await getAuthenticatedSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const customerId = req.nextUrl.searchParams.get('customerId')
		const bankAccountId = req.nextUrl.searchParams.get('bankAccountId')
		const walletAddress = req.nextUrl.searchParams.get('walletAddress')

		if (
			!customerId ||
			!bankAccountId ||
			!walletAddress ||
			!isExternalStellarWallet(walletAddress)
		) {
			return NextResponse.json(
				{
					error: 'customerId, bankAccountId, and a valid external wallet address are required',
				},
				{ status: 400 },
			)
		}

		const config = await getEtherfuseConfig()
		const status = await getEtherfuseOnboardingStatus(
			{ apiKey: config.apiKey, baseUrl: config.baseUrl },
			{ customerId, bankAccountId, walletAddress },
		)

		return NextResponse.json(status)
	} catch (error) {
		logger.error('Etherfuse onboarding status error:', error)

		if (error instanceof AppError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode })
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		)
	}
}

export const GET = withRateLimit(
	{
		preset: 'moderate',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	onboardingStatusHandler,
)

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { AppError } from '~/lib/error'
import type { EtherfuseApiAuth } from '~/lib/etherfuse/etherfuse-api'
import { persistEtherfuseWalletBinding } from '~/lib/etherfuse/etherfuse-wallet-binding'
import { getEtherfuseConfig } from '~/lib/etherfuse/get-etherfuse-config'
import {
	requestEtherfuseOnboardingUrl,
	resolveEtherfuseOnboardingIds,
} from '~/lib/etherfuse/resolve-etherfuse-onboarding'
import { isExternalStellarWallet } from '~/lib/etherfuse/wallet'
import { withRateLimit } from '~/lib/middleware/rate-limit'

type OnboardingUrlRequest = {
	walletAddress: string
	customerId?: string
	bankAccountId?: string
}

async function onboardingUrlHandler(req: NextRequest) {
	try {
		const session = await getAuthenticatedSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const body = (await req.json()) as OnboardingUrlRequest
		const { walletAddress, customerId, bankAccountId } = body

		if (!walletAddress || !isExternalStellarWallet(walletAddress)) {
			return NextResponse.json(
				{ error: 'A valid external Stellar wallet address (G-address) is required' },
				{ status: 400 },
			)
		}

		const config = await getEtherfuseConfig()
		const auth: EtherfuseApiAuth = { apiKey: config.apiKey, baseUrl: config.baseUrl }
		const onboardingIds = await resolveEtherfuseOnboardingIds(auth, walletAddress, {
			customerId,
			bankAccountId,
		})

		const result = await requestEtherfuseOnboardingUrl(auth, {
			walletAddress,
			onboardingIds,
			userInfo: {
				email: session.user.email ?? undefined,
				displayName: session.user.name ?? undefined,
			},
		})

		await persistEtherfuseWalletBinding(session.user.id, {
			walletAddress,
			customerId: result.customerId,
			bankAccountId: result.bankAccountId,
		})

		return NextResponse.json(result)
	} catch (error) {
		logger.error('Etherfuse onboarding URL error:', error)

		if (error instanceof AppError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode })
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		)
	}
}

export const POST = withRateLimit(
	{
		preset: 'moderate',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	onboardingUrlHandler,
)

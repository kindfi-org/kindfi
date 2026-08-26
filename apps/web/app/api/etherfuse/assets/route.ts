import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { AppError } from '~/lib/error'
import { listEtherfuseRampAssets } from '~/lib/etherfuse/etherfuse-api'
import { getEtherfuseConfig } from '~/lib/etherfuse/get-etherfuse-config'
import { withRateLimit } from '~/lib/middleware/rate-limit'

async function assetsHandler(req: NextRequest) {
	try {
		const session = await getAuthenticatedSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const currency = req.nextUrl.searchParams.get('currency') ?? 'mxn'
		const wallet = req.nextUrl.searchParams.get('wallet')

		if (!wallet) {
			return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
		}

		const config = await getEtherfuseConfig()
		const assets = await listEtherfuseRampAssets(
			{ apiKey: config.apiKey, baseUrl: config.baseUrl },
			{ blockchain: 'stellar', currency, wallet },
		)

		return NextResponse.json({ assets })
	} catch (error) {
		logger.error('Etherfuse assets error:', error)

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
		preset: 'lenient',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	assetsHandler,
)

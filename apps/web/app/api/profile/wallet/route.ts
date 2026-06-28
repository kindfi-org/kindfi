import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { linkExternalWalletSchema } from '~/lib/schemas/profile.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/profile/wallet
 * Link or unlink the user's external Stellar Wallet Kit G-address for gamification.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(linkExternalWalletSchema, body)
		if (!validation.success) {
			return validation.response
		}

		const { address } = validation.data
		const { supabase } = await import('@packages/lib/supabase')

		const { error } = await supabase
			.from('profiles')
			.update({
				external_wallet_address: address,
				updated_at: new Date().toISOString(),
			})
			.eq('id', session.user.id)

		if (error) {
			logger.error('[Profile Wallet] Failed to update external wallet address:', error)
			return NextResponse.json({ error: 'Failed to link wallet' }, { status: 500 })
		}

		return NextResponse.json({
			success: true,
			externalWalletAddress: address,
		})
	} catch (error) {
		logger.error('[Profile Wallet] Unexpected error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { activatePollarWalletForProfile } from '~/lib/pollar/bridge/link-pollar-user'

/**
 * POST /api/pollar/wallets/activate
 * Activates a deferred Pollar wallet after KYC or business trigger.
 */
export async function POST() {
	if (!isPollarOnboardingEnabled()) {
		return NextResponse.json({ error: 'Pollar onboarding is disabled' }, { status: 403 })
	}

	try {
		const session = await requireAuthenticatedSession('pollar-wallet-activate')
		await activatePollarWalletForProfile(session.user.id)

		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('[Pollar] wallet activation failed', error)
		const status = error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Wallet activation failed' },
			{ status },
		)
	}
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { activateReferralProfile } from '~/lib/referral/referral-service'

/**
 * POST /api/referrals/activate
 * Activate the authenticated user's referral profile (DB + on-chain readiness check).
 */
export async function POST() {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { supabase } = await import('@packages/lib/supabase')
		const result = await activateReferralProfile(supabase, session.user.id)

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: result.status })
		}

		return NextResponse.json({
			profile: result.profile,
			referral_code: result.profile.referral_code,
			on_chain_ready: result.profile.on_chain_ready,
		})
	} catch (error) {
		logger.error('Error in POST /api/referrals/activate:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

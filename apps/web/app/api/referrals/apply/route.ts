import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { applyReferralCode } from '~/lib/referral/referral-service'
import { applyReferralCodeSchema } from '~/lib/schemas/referral.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/referrals/apply
 * Apply a referral code for the authenticated user (DB + on-chain create_referral).
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(applyReferralCodeSchema, body)
		if (!validation.success) {
			return validation.response
		}

		const { supabase } = await import('@packages/lib/supabase')
		const result = await applyReferralCode(supabase, session.user.id, validation.data.code)

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: result.status })
		}

		return NextResponse.json(
			{
				referral: result.referral,
				onChain: result.onChain,
				onboarded: result.onboarded,
			},
			{ status: 201 },
		)
	} catch (error) {
		logger.error('Error in POST /api/referrals/apply:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

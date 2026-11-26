import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getKycEnforcedActions, getKycEnforcementMode } from '~/lib/kyc/enforcement-config'
import {
	findLatestDiditSessionForUser,
	getCanonicalKycStatusForUser,
} from '~/lib/kyc/session-service'
import { withRateLimit } from '~/lib/middleware/rate-limit'

/**
 * GET /api/kyc/status
 *
 * Returns the authenticated user's Didit-normalized KYC status plus a derived
 * enforcement hint for UI. The hint is never an authorization boundary.
 */
async function getKycStatusHandler(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const mode = getKycEnforcementMode()
		const [canonicalStatus, diditSession, kycRecordResult] = await Promise.all([
			getCanonicalKycStatusForUser(session.user.id),
			findLatestDiditSessionForUser(session.user.id),
			supabaseServiceRole
				.from('kyc_reviews')
				.select('status, updated_at')
				.eq('user_id', session.user.id)
				.order('created_at', { ascending: false })
				.limit(1)
				.maybeSingle(),
		])

		if (kycRecordResult.error) {
			logger.error('Error fetching KYC status:', { error: kycRecordResult.error.message })
			return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
		}

		return NextResponse.json({
			status: kycRecordResult.data?.status || null,
			canonicalStatus,
			updatedAt: kycRecordResult.data?.updated_at || null,
			hasActiveSession: Boolean(diditSession?.verificationUrl),
			enforcement: {
				mode,
				enforcedActions: mode === 'enforced' ? getKycEnforcedActions() : [],
			},
		})
	} catch (error) {
		logger.error('Error in KYC status API:', error)
		return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
	}
}

export const GET = withRateLimit(
	{
		preset: 'moderate',
		identifier: async (req) => {
			const ip = req.headers.get('x-forwarded-for')
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? ip ?? 'anonymous'
		},
	},
	getKycStatusHandler,
)

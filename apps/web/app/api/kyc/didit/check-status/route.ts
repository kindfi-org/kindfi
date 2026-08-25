import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { findLatestDiditSessionForUser } from '~/lib/kyc/session-service'
import { applyDiditStatusUpdate } from '~/lib/kyc/webhook-service'
import { getDiditSessionStatus } from '~/lib/services/didit'

/**
 * POST /api/kyc/didit/check-status
 *
 * Checks the current KYC status by querying Didit API directly.
 * Useful when webhooks are delayed or have not fired yet.
 */
export async function POST(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const diditSession = await findLatestDiditSessionForUser(session.user.id)

		if (!diditSession) {
			return NextResponse.json({
				success: false,
				status: null,
				canonicalStatus: 'not_started',
				message: 'No KYC session found',
			})
		}

		try {
			const diditStatus = await getDiditSessionStatus(diditSession.sessionId)
			const result = await applyDiditStatusUpdate({
				sessionId: diditSession.sessionId,
				diditStatus: diditStatus.status,
				userId: session.user.id,
				source: 'check_status',
				providerEventAt: diditStatus.updated_at ? new Date(diditStatus.updated_at) : new Date(),
			})

			const canonicalStatus = result.canonicalStatus ?? diditSession.canonicalStatus

			return NextResponse.json({
				success: true,
				status: canonicalStatus === 'approved' ? 'approved' : canonicalStatus,
				canonicalStatus,
				diditStatus: diditStatus.status,
			})
		} catch (providerError) {
			logger.error('Error checking KYC status from Didit:', {
				error: providerError instanceof Error ? providerError.message : 'provider_unavailable',
			})
			return NextResponse.json({
				success: false,
				status: diditSession.canonicalStatus,
				canonicalStatus: 'provider_unavailable',
				storedCanonicalStatus: diditSession.canonicalStatus,
				message: 'Didit status is temporarily unavailable',
			})
		}
	} catch (error) {
		logger.error('Error checking KYC status:', error)
		return NextResponse.json({ error: 'Failed to check KYC status' }, { status: 500 })
	}
}

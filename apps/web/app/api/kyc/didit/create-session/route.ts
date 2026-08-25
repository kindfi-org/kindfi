import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	findActiveDiditSessionForUser,
	getCanonicalKycStatusForUser,
	recordKycStatusTransition,
	saveDiditSession,
} from '~/lib/kyc/session-service'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { createDiditSessionSchema } from '~/lib/schemas/kyc.schemas'
import { createDiditSession } from '~/lib/services/didit'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/kyc/didit/create-session
 *
 * Creates a Didit verification session for the authenticated user.
 * Reuses an active session instead of opening a duplicate Didit flow.
 */
async function createSessionHandler(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id || !session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(createDiditSessionSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { redirectUrl, metadata } = validation.data

		const canonicalStatus = await getCanonicalKycStatusForUser(session.user.id)
		if (canonicalStatus === 'approved') {
			return NextResponse.json({
				success: true,
				alreadyVerified: true,
				canonicalStatus,
			})
		}

		const activeSession = await findActiveDiditSessionForUser(session.user.id)
		if (activeSession?.verificationUrl) {
			return NextResponse.json({
				success: true,
				sessionId: activeSession.sessionId,
				verificationUrl: activeSession.verificationUrl,
				resumed: true,
				canonicalStatus: activeSession.canonicalStatus,
			})
		}

		const diditSession = await createDiditSession(session.user.email, redirectUrl, {
			userId: session.user.id,
			...(metadata || {}),
		})

		const saved = await saveDiditSession({
			userId: session.user.id,
			sessionId: diditSession.session_id,
			sessionToken: diditSession.session_token,
			verificationUrl: diditSession.url,
			diditStatus: diditSession.status,
			canonicalStatus: 'pending',
		})

		if (!saved) {
			logger.error('[kyc] Didit session created but failed to persist session_id')
		} else {
			await recordKycStatusTransition({
				userId: session.user.id,
				sessionId: diditSession.session_id,
				toDiditStatus: diditSession.status,
				fromCanonicalStatus: canonicalStatus,
				toCanonicalStatus: 'pending',
				source: 'create_session',
			})
		}

		return NextResponse.json({
			success: true,
			sessionId: diditSession.session_id,
			verificationUrl: diditSession.url,
			canonicalStatus: 'pending',
		})
	} catch (error) {
		logger.error('Error creating Didit session:', error)
		return NextResponse.json({ error: 'Failed to create verification session' }, { status: 500 })
	}
}

export const POST = withRateLimit(
	{
		preset: 'strict',
		identifier: async (req) => {
			const ip = req.headers.get('x-forwarded-for')
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? ip ?? 'anonymous'
		},
	},
	createSessionHandler,
)

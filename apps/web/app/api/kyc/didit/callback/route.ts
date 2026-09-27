import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { findDiditSessionBySessionId } from '~/lib/kyc/session-service'
import { applyDiditStatusUpdate } from '~/lib/kyc/webhook-service'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { getDiditSessionStatus } from '~/lib/services/didit'

interface DiditCallbackBody {
	verificationSessionId: string
}

const isValidCallbackBody = (data: unknown): data is DiditCallbackBody =>
	typeof data === 'object' &&
	data !== null &&
	typeof (data as DiditCallbackBody).verificationSessionId === 'string' &&
	(data as DiditCallbackBody).verificationSessionId.length > 0

/**
 * POST /api/kyc/didit/callback
 *
 * Handles the browser return from Didit. The browser supplies only the
 * session identifier: status is fetched from Didit and never trusted from
 * query parameters or request JSON.
 */
async function diditCallbackHandler(req: NextRequest): Promise<NextResponse> {
	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
	}

	if (!isValidCallbackBody(body)) {
		return NextResponse.json({ error: 'Missing or invalid verificationSessionId' }, { status: 400 })
	}

	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { verificationSessionId } = body
		const storedSession = await findDiditSessionBySessionId(verificationSessionId)
		if (!storedSession || storedSession.userId !== session.user.id) {
			return NextResponse.json({ error: 'Verification session not found' }, { status: 404 })
		}
		const diditStatus = await getDiditSessionStatus(verificationSessionId)
		const result = await applyDiditStatusUpdate({
			sessionId: verificationSessionId,
			diditStatus: diditStatus.status,
			userId: session.user.id,
			source: 'callback',
			providerEventAt: diditStatus.updated_at ? new Date(diditStatus.updated_at) : new Date(),
		})

		const canonicalStatus = result.canonicalStatus ?? 'pending'

		return NextResponse.json({
			success: true,
			status: canonicalStatus === 'approved' ? 'approved' : canonicalStatus,
			canonicalStatus,
			diditStatus: diditStatus.status,
		})
	} catch (error) {
		logger.error('Error processing Didit callback:', error)
		return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
	}
}

export const POST = withRateLimit(
	{
		preset: 'moderate',
		identifier: async (req) => {
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? req.headers.get('x-forwarded-for') ?? 'anonymous'
		},
	},
	diditCallbackHandler,
)

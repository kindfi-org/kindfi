import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { applyDiditStatusUpdate } from '~/lib/kyc/webhook-service'

interface DiditCallbackBody {
	verificationSessionId: string
	status: string
}

const isValidCallbackBody = (data: unknown): data is DiditCallbackBody =>
	typeof data === 'object' &&
	data !== null &&
	typeof (data as DiditCallbackBody).verificationSessionId === 'string' &&
	(data as DiditCallbackBody).verificationSessionId.length > 0 &&
	typeof (data as DiditCallbackBody).status === 'string' &&
	(data as DiditCallbackBody).status.length > 0

/**
 * POST /api/kyc/didit/callback
 *
 * Handles callback from Didit with a status update after the user returns.
 * The browser-supplied status is stored only after the session is bound to
 * the authenticated user; Didit webhooks remain authoritative.
 */
async function diditCallbackHandler(req: NextRequest): Promise<NextResponse> {
	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
	}

	if (!isValidCallbackBody(body)) {
		return NextResponse.json(
			{ error: 'Missing or invalid verificationSessionId or status' },
			{ status: 400 },
		)
	}

	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { verificationSessionId, status } = body
		const result = await applyDiditStatusUpdate({
			sessionId: verificationSessionId,
			diditStatus: status,
			userId: session.user.id,
			source: 'callback',
			providerEventAt: new Date(),
		})

		const canonicalStatus = result.canonicalStatus ?? 'pending'

		return NextResponse.json({
			success: true,
			status: canonicalStatus === 'approved' ? 'approved' : canonicalStatus,
			canonicalStatus,
			diditStatus: status,
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
			return session?.user?.id ?? req.ip ?? 'anonymous'
		},
	},
	diditCallbackHandler,
)

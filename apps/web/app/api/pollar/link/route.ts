import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { requireAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { linkPollarUserToKindFi } from '~/lib/pollar/bridge/link-pollar-user'
import { verifyPollarAccessToken } from '~/lib/pollar/bridge/verify-pollar-token'

const linkSchema = z.object({
	accessToken: z.string().min(1),
	pollarUserId: z.string().min(1),
	walletAddress: z.string().min(1),
	email: z.string().email().nullable(),
	authProvider: z.string().nullable(),
	network: z.string().min(1),
	profile: z
		.object({
			firstName: z.string().nullable().optional(),
			lastName: z.string().nullable().optional(),
			avatar: z.string().nullable().optional(),
		})
		.optional(),
})

/**
 * POST /api/pollar/link
 * Link Pollar wallet to the currently authenticated legacy user.
 */
export async function POST(req: NextRequest) {
	if (!isPollarOnboardingEnabled()) {
		return NextResponse.json({ error: 'Pollar onboarding is disabled' }, { status: 403 })
	}

	try {
		const session = await requireAuthenticatedSession('pollar-link')
		const parsed = linkSchema.safeParse(await req.json())
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
		}

		const verified = await verifyPollarAccessToken(parsed.data)
		const linked = await linkPollarUserToKindFi(verified, {
			linkToExistingUserId: session.user.id,
		})

		return NextResponse.json({
			success: true,
			userId: linked.userId,
			walletAddress: linked.walletAddress,
		})
	} catch (error) {
		logger.error('[Pollar] link failed', error)
		const status = error instanceof Error && error.message.includes('Unauthorized') ? 401 : 400
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Pollar link failed' },
			{ status },
		)
	}
}

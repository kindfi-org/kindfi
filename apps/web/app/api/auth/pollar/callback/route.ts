import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { linkPollarUserToKindFi } from '~/lib/pollar/bridge/link-pollar-user'
import { verifyPollarAccessToken } from '~/lib/pollar/bridge/verify-pollar-token'

const callbackSchema = z.object({
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
	linkToExistingUserId: z.string().uuid().optional(),
})

/**
 * POST /api/auth/pollar/callback
 * Verifies Pollar SDK token and links/creates KindFi profile.
 */
export async function POST(req: NextRequest) {
	if (!isPollarOnboardingEnabled()) {
		return NextResponse.json({ error: 'Pollar onboarding is disabled' }, { status: 403 })
	}

	try {
		const body = await req.json()
		const parsed = callbackSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
		}

		const verified = await verifyPollarAccessToken(parsed.data)
		const linked = await linkPollarUserToKindFi(verified, {
			linkToExistingUserId: parsed.data.linkToExistingUserId,
		})

		return NextResponse.json({
			success: true,
			userId: linked.userId,
			email: linked.email,
			walletAddress: linked.walletAddress,
			isNewUser: linked.isNewUser,
			onboardingProvider: linked.onboardingProvider,
		})
	} catch (error) {
		logger.error('[Pollar] callback failed', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Pollar callback failed' },
			{ status: 401 },
		)
	}
}

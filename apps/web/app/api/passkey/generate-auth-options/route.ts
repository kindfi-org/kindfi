import { appEnvConfig } from '@packages/lib/config'
import { getUser, saveChallenge } from '@packages/lib/db'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getRpIdFromOrigin } from '@/lib/passkey/rp-id-helper'

/**
 * POST /api/passkey/generate-auth-options
 *
 * Generates WebAuthn authentication options for signing in
 * This replaces the KYC server endpoint
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { identifier, origin, userId } = body

		if (!identifier || !origin) {
			return NextResponse.json(
				{ error: 'Missing required fields: identifier, origin' },
				{ status: 400 },
			)
		}

		const config = appEnvConfig('web')
		const rpId = getRpIdFromOrigin(origin)

		// Get user from database
		const userResponse = await getUser({
			rpId,
			identifier,
			userId,
		})

		if (!userResponse) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const { credentials } = userResponse

		if (credentials.length === 0) {
			return NextResponse.json(
				{ error: 'No passkeys registered for this user' },
				{ status: 404 },
			)
		}

		// Generate authentication options
		const options = await generateAuthenticationOptions({
			userVerification: 'preferred',
			rpID: rpId,
			timeout: config.passkey.challengeTtlMs,
			allowCredentials: credentials.map((cred) => ({
				id: cred.id,
				type: 'public-key' as const,
				transports: cred.transports,
			})),
		})

		// Save challenge for verification
		await saveChallenge({
			identifier,
			rpId,
			challenge: options.challenge,
			userId,
		})

		return NextResponse.json(options)
	} catch (error) {
		console.error('❌ Error generating authentication options:', error)
		return NextResponse.json(
			{
				error: 'Failed to generate authentication options',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

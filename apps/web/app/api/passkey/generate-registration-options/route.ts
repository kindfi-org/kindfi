import { appEnvConfig } from '@packages/lib/config'
import { getUser, saveChallenge } from '@packages/lib/db'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
	getRpIdFromOrigin,
	getRpNameFromOrigin,
} from '@/lib/passkey/rp-id-helper'

/**
 * POST /api/passkey/generate-registration-options
 *
 * Generates WebAuthn registration options for creating a new passkey
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
		const rpName = getRpNameFromOrigin(origin)

		console.log('🔐 Generating registration options:', {
			origin,
			rpId,
			rpName,
			identifier,
		})

		// Get user from database (or create empty credentials array if new user)
		const userResponse = await getUser({
			rpId,
			identifier,
			userId,
		})

		const credentials = userResponse?.credentials || []

		// Generate registration options
		const options = await generateRegistrationOptions({
			rpName,
			rpID: rpId,
			userName: identifier,
			timeout: config.passkey.challengeTtlMs,
			attestationType: 'none',
			excludeCredentials: credentials.map((cred) => ({
				id: cred.id,
				type: 'public-key',
				transports: cred.transports,
			})),
			authenticatorSelection: {
				residentKey: 'discouraged',
				userVerification: 'preferred',
			},
			supportedAlgorithmIDs: [-7], // ES256 (secp256r1) for WebAuthn
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
		console.error('❌ Error generating registration options:', error)
		return NextResponse.json(
			{
				error: 'Failed to generate registration options',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

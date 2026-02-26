import {
	deleteChallenge,
	getChallenge,
	getUser,
	saveUser,
} from '@packages/lib/db'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getRpIdFromOrigin } from '@/lib/passkey/rp-id-helper'

/**
 * POST /api/passkey/verify-auth
 *
 * Verifies WebAuthn authentication
 * This replaces the KYC server endpoint
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const {
			identifier,
			authenticationResponse,
			origin,
			userId,
		}: {
			identifier: string
			authenticationResponse: AuthenticationResponseJSON
			origin: string
			userId?: string
		} = body

		if (!identifier || !authenticationResponse || !origin) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			)
		}

		const rpId = getRpIdFromOrigin(origin)
		// Use the origin as expectedOrigin (it's already validated by getRpIdFromOrigin)
		const expectedOrigin = origin

		// Get challenge
		const expectedChallenge = await getChallenge({
			identifier,
			rpId,
			userId,
		})

		if (!expectedChallenge) {
			return NextResponse.json(
				{ error: 'Challenge not found' },
				{ status: 400 },
			)
		}

		// Get user
		const userResponse = await getUser({
			rpId,
			identifier,
			userId,
		})

		if (!userResponse) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const { credentials } = userResponse

		// Find credential
		const credentialIndex = credentials.findIndex(
			(cred) => cred.id === authenticationResponse.id,
		)

		if (credentialIndex === -1) {
			return NextResponse.json(
				{ error: 'Credential not found' },
				{ status: 404 },
			)
		}

		const credential = credentials[credentialIndex]

		// Verify authentication
		const verification = await verifyAuthenticationResponse({
			response: authenticationResponse,
			expectedChallenge,
			expectedOrigin,
			expectedRPID: rpId,
			credential,
			requireUserVerification: false,
		})

		if (verification.verified && verification.authenticationInfo) {
			// Update credential counter
			credentials[credentialIndex].counter =
				verification.authenticationInfo.newCounter

			await saveUser({
				rpId,
				identifier,
				user: {
					credentials,
				},
				userId,
			})
		}

		await deleteChallenge({ identifier, rpId, userId })

		// Return userId from userResponse if not provided
		const finalUserId = userId || userResponse.userId

		// Convert public key to base64 for JSON serialization
		const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64')

		return NextResponse.json({
			verified: verification.verified,
			smartAccountAddress: credential.address,
			credentialId: credential.id,
			userId: finalUserId,
			publicKey: publicKeyBase64, // Base64 encoded public key for session creation
		})
	} catch (error) {
		console.error('❌ Error verifying authentication:', error)
		return NextResponse.json(
			{
				error: 'Failed to verify authentication',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

import { appEnvConfig } from '@packages/lib/config'
import {
	deleteChallenge,
	getChallenge,
	getUser,
	saveUser,
} from '@packages/lib/db'
import { StellarPasskeyService } from '@packages/lib/stellar'
import {
	type RegistrationResponseJSON,
	verifyRegistrationResponse,
} from '@simplewebauthn/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getRpIdFromOrigin } from '@/lib/passkey/rp-id-helper'
import { verifyRegistrationSchema } from '~/lib/schemas/passkey.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/passkey/verify-registration
 *
 * Verifies WebAuthn registration and creates a Smart Account
 * This replaces the KYC server endpoint and integrates with OpenZeppelin Smart Accounts
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const validation = validateRequest(verifyRegistrationSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { registrationResponse, identifier, origin, userId } =
			validation.data

		const config = appEnvConfig('web')
		const rpId = getRpIdFromOrigin(origin)
		// Use the origin as expectedOrigin (it's already validated by getRpIdFromOrigin)
		const expectedOrigin = origin


		// Get challenge and user in parallel
		const [expectedChallenge, userResponse] = await Promise.all([
			getChallenge({ identifier, rpId, userId }),
			getUser({ rpId, identifier, userId }),
		])

		if (!expectedChallenge) {
			return NextResponse.json(
				{ error: 'Challenge not found' },
				{ status: 400 },
			)
		}

		// Use existing credentials or create empty array if new user
		const credentials = userResponse?.credentials || []

		// Verify registration
		const verification = await verifyRegistrationResponse({
			response: registrationResponse as RegistrationResponseJSON,
			expectedChallenge,
			expectedOrigin,
			expectedRPID: rpId,
			requireUserVerification: false,
		})

		let smartAccountAddress: string | undefined

		if (verification.verified && verification.registrationInfo) {
			const { credential } = verification.registrationInfo

			// Check if credential already exists
			const existingCredential = credentials.find(
				(cred) => cred.id === credential.id,
			)

			if (!existingCredential) {
				// Create Smart Account
				// NOTE: Smart Account Kit SDK requires browser WebAuthn APIs and cannot be used server-side
				// We use custom contracts (StellarPasskeyService) for server-side deployment
				// Smart Account Kit SDK should be used client-side for wallet management after deployment
				try {
					if (
						!config.stellar.fundingAccount ||
						config.stellar.fundingAccount === 'SB...4756'
					) {
						const errorMsg =
							'Funding account not configured. Set STELLAR_FUNDING_SECRET_KEY environment variable.'
						console.error('❌', errorMsg)
						throw new Error(errorMsg)
					}

					if (!config.stellar.factoryContractId) {
						const errorMsg =
							'Factory contract not configured. Set FACTORY_CONTRACT_ID environment variable.'
						console.error('❌', errorMsg)
						throw new Error(errorMsg)
					}


					const stellarService = new StellarPasskeyService(
						config.stellar.networkPassphrase,
						config.stellar.rpcUrl,
						config.stellar.fundingAccount,
					)

					// Convert Uint8Array publicKey to base64 (same as verify-auth route)
					const publicKeyBase64 = Buffer.from(credential.publicKey).toString(
						'base64',
					)

					const deploymentResult = await stellarService.deployPasskeyAccount({
						credentialId: credential.id,
						publicKey: publicKeyBase64,
						userId,
					})

					smartAccountAddress = deploymentResult.address
				} catch (deploymentError) {
					// Smart Account deployment failed
					const errorMessage =
						deploymentError instanceof Error
							? deploymentError.message
							: String(deploymentError)

					console.error('❌ Smart Account deployment failed:', { error: errorMessage })

					// Log detailed error for debugging
					console.error('Smart Account deployment error details:', {
						fundingAccount: config.stellar.fundingAccount ? 'set' : 'missing',
						factoryContractId: config.stellar.factoryContractId ? 'set' : 'missing',
					})

					// For now, we'll continue without Smart Account creation
					// In production, you may want to fail the registration
					console.warn(
						'⚠️ Continuing registration without Smart Account creation. ' +
							'Check server logs for deployment errors. ' +
							'The passkey can still be used for authentication.',
					)

					// Don't throw - allow registration to continue
					// The credential will be saved without address
				}

				// Save credential with Smart Account address
				const newCredential = {
					id: credential.id,
					address: smartAccountAddress, // Store Smart Account address
					publicKey: credential.publicKey,
					counter: credential.counter,
					transports: registrationResponse.response.transports,
				}

				await saveUser({
					rpId,
					identifier,
					user: {
						credentials: [
							...credentials,
							newCredential as (typeof credentials)[number],
						],
					},
					userId,
				})
			}
		}

		await deleteChallenge({ identifier, rpId, userId })

		// Return response with verification status and Smart Account address
		const response: {
			verified: boolean
			smartAccountAddress?: string
			warning?: string
			error?: string
		} = {
			verified: verification.verified,
		}

		if (smartAccountAddress) {
			response.smartAccountAddress = smartAccountAddress
		} else if (verification.verified) {
			// Registration verified but Smart Account creation failed
			const warningMessage =
				'Passkey registered successfully, but Smart Account creation failed. ' +
				'Check server logs for details. The passkey can still be used for authentication.'
			response.warning = warningMessage
			console.warn('⚠️', warningMessage)
			console.warn('⚠️ Configuration check:', {
				hasAccountWasmHash: !!process.env.NEXT_PUBLIC_ACCOUNT_WASM_HASH,
				hasWebAuthnVerifier:
					!!process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS,
				hasFundingAccount:
					!!config.stellar.fundingAccount &&
					config.stellar.fundingAccount !== 'SB...4756',
				hasFactoryContract: !!config.stellar.factoryContractId,
			})
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error('❌ Error verifying registration:', error instanceof Error ? error.message : String(error))
		return NextResponse.json(
			{
				error: 'Failed to verify registration',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

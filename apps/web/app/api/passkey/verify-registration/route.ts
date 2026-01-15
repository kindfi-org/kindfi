import { appEnvConfig } from '@packages/lib/config'
import {
	deleteChallenge,
	getChallenge,
	getUser,
	saveUser,
} from '@packages/lib/db'
import { StellarPasskeyService } from '@packages/lib/stellar'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/passkey/verify-registration
 *
 * Verifies WebAuthn registration and creates a Smart Account
 * This replaces the KYC server endpoint and integrates with OpenZeppelin Smart Accounts
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const {
			registrationResponse,
			identifier,
			origin,
			userId,
		}: {
			registrationResponse: RegistrationResponseJSON
			identifier: string
			origin: string
			userId?: string
		} = body

		if (!registrationResponse || !identifier || !origin) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			)
		}

		const config = appEnvConfig('web')
		const rpId = config.passkey.rpId[0] || 'localhost'
		const expectedOrigin = config.passkey.expectedOrigin.find(
			(o) => o === origin,
		)

		if (!expectedOrigin) {
			return NextResponse.json({ error: 'Invalid origin' }, { status: 400 })
		}

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

		// Get user (or create empty credentials array if new user)
		const userResponse = await getUser({
			rpId,
			identifier,
			userId,
		})

		const credentials = userResponse?.credentials || []

		// Verify registration
		const verification = await verifyRegistrationResponse({
			response: registrationResponse,
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

					console.log('📋 Deployment configuration:', {
						hasFundingAccount: !!config.stellar.fundingAccount,
						factoryContractId: config.stellar.factoryContractId,
						rpcUrl: config.stellar.rpcUrl,
						networkPassphrase:
							config.stellar.networkPassphrase.substring(0, 20) + '...',
					})

					const stellarService = new StellarPasskeyService(
						config.stellar.networkPassphrase,
						config.stellar.rpcUrl,
						config.stellar.fundingAccount,
					)

					// Convert Uint8Array publicKey to base64 (same as verify-auth route)
					const publicKeyBase64 = Buffer.from(credential.publicKey).toString(
						'base64',
					)
					console.log(
						'🚀 Deploying Smart Account with StellarPasskeyService...',
					)
					console.log(
						'   Credential ID:',
						credential.id.substring(0, 20) + '...',
					)
					console.log('   Public key length:', publicKeyBase64.length)

					const deploymentResult = await stellarService.deployPasskeyAccount({
						credentialId: credential.id,
						publicKey: publicKeyBase64,
						userId,
					})

					smartAccountAddress = deploymentResult.address
					console.log(
						'✅ Smart Account created with custom contracts:',
						smartAccountAddress,
					)
				} catch (deploymentError) {
					// Smart Account deployment failed
					const errorMessage =
						deploymentError instanceof Error
							? deploymentError.message
							: String(deploymentError)
					const errorStack =
						deploymentError instanceof Error ? deploymentError.stack : undefined

					console.error('❌ Smart Account deployment failed:', {
						error: errorMessage,
						stack: errorStack,
						credentialId: credential.id,
					})

					// Log detailed error for debugging
					console.error('Smart Account deployment error details:', {
						fundingAccount: config.stellar.fundingAccount ? 'set' : 'missing',
						factoryContractId: config.stellar.factoryContractId
							? 'set'
							: 'missing',
						rpcUrl: config.stellar.rpcUrl,
						networkPassphrase:
							config.stellar.networkPassphrase.substring(0, 20) + '...',
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
						credentials: [...credentials, newCredential],
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
			console.log(
				'✅ Registration complete with Smart Account:',
				smartAccountAddress,
			)
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
		console.error('❌ Error verifying registration:', error)
		return NextResponse.json(
			{
				error: 'Failed to verify registration',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

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
import { SmartAccountKitService } from '~/lib/stellar/smart-account-kit.service'

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
				// Create Smart Account - try Smart Account Kit SDK first, fallback to custom contracts
				try {
					// Try Smart Account Kit SDK (OpenZeppelin Smart Accounts)
					const kitService = new SmartAccountKitService()

					// Try to create wallet - this will initialize the SDK if available
					console.log(
						'🚀 Attempting to create Smart Account with Smart Account Kit SDK...',
					)
					const result = await kitService.createWallet(
						config.deployment.appUrl || 'KindFi',
						identifier,
						{ autoSubmit: true },
					)
					smartAccountAddress = result.contractId
					console.log('✅ Smart Account created with SDK:', smartAccountAddress)
				} catch (kitError) {
					// Fallback to StellarPasskeyService (custom contracts)
					if (
						kitError instanceof Error &&
						kitError.message.includes('not configured')
					) {
						console.log(
							'⚠️ Falling back to StellarPasskeyService (custom contracts)',
						)
					} else {
						console.warn('⚠️ Smart Account Kit failed, falling back:', kitError)
					}

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

						const publicKeyBase64 = credential.publicKey.toBase64()
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
					} catch (fallbackError) {
						// Both methods failed
						const errorMessage =
							fallbackError instanceof Error
								? fallbackError.message
								: String(fallbackError)
						const errorStack =
							fallbackError instanceof Error ? fallbackError.stack : undefined

						console.error('❌ Both Smart Account creation methods failed:', {
							error: errorMessage,
							stack: errorStack,
							credentialId: credential.id,
						})

						// Log detailed error for debugging
						console.error('Smart Account creation error details:', {
							hasSmartAccountKit: typeof SmartAccountKitService !== 'undefined',
							envVars: {
								accountWasmHash: process.env.NEXT_PUBLIC_ACCOUNT_WASM_HASH
									? 'set'
									: 'missing',
								webauthnVerifier: process.env
									.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS
									? 'set'
									: 'missing',
								fundingAccount: config.stellar.fundingAccount
									? 'set'
									: 'missing',
								factoryContractId: config.stellar.factoryContractId
									? 'set'
									: 'missing',
							},
						})

						// For now, we'll continue without Smart Account creation
						// In production, you may want to fail the registration
						console.warn(
							'⚠️ Continuing registration without Smart Account creation. ' +
								'To enable Smart Account creation:\n' +
								'1. Install: bun add smart-account-kit\n' +
								'2. Set NEXT_PUBLIC_ACCOUNT_WASM_HASH\n' +
								'3. Set NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS\n' +
								'Or configure custom contracts:\n' +
								'1. Set STELLAR_FUNDING_SECRET_KEY\n' +
								'2. Set FACTORY_CONTRACT_ID',
						)

						// Don't throw - allow registration to continue
						// The credential will be saved without address
					}
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
		} = {
			verified: verification.verified,
		}

		if (smartAccountAddress) {
			response.smartAccountAddress = smartAccountAddress
		} else if (verification.verified) {
			// Registration verified but Smart Account creation failed
			response.warning =
				'Passkey registered successfully, but Smart Account creation failed. ' +
				'Check server logs for details. The passkey can still be used for authentication.'
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

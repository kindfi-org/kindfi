import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	type PasskeyAccountResult,
	StellarPasskeyService,
} from '~/lib/stellar/stellar-passkey-service'
import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'
import { handleError } from '../utils/error-handler'

const appConfig: AppEnvInterface = appEnvConfig()

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Initialize Stellar service (V2 - simplified)
const stellarService = new StellarPasskeyService(
	appConfig.stellar.networkPassphrase,
	appConfig.stellar.rpcUrl,
	appConfig.stellar.fundingAccount,
)

export const stellarRoutes = {
	'/api/stellar/create-passkey-account': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const {
						credentialId,
						publicKey,
						userId,
						deployOnly = false,
					} = await req.json()

					if (!credentialId || !publicKey) {
						return Response.json(
							{
								error:
									'Missing required parameters: credentialId and publicKey',
							},
							{ status: 400 },
						)
					}

					// Use the new simplified service
					let result: PasskeyAccountResult

					if (deployOnly) {
						// This is the approval phase - actually deploy the contract
						console.log(
							'🚀 Deployment request for approved user:',
							credentialId,
						)
						result = await stellarService.deployPasskeyAccount({
							credentialId,
							publicKey,
							userId,
						})
					} else {
						// This is the preparation phase - just calculate address
						console.log(
							'📋 Preparation request for registration:',
							credentialId,
						)
						result = await stellarService.preparePasskeyAccount({
							credentialId,
							publicKey,
							userId,
						})
					}

					return Response.json({
						success: true,
						data: result,
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/stellar/verify-signature': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { contractId, signature, transactionHash } = await req.json()

					if (!contractId || !signature || !transactionHash) {
						return Response.json(
							{ error: 'Missing required parameters' },
							{ status: 400 },
						)
					}

					const isValid = await stellarService.verifyPasskeySignature(
						contractId,
						signature,
						transactionHash,
					)

					return Response.json({
						success: true,
						valid: isValid,
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/stellar/execute-transaction': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { contractId, operation, signature } = await req.json()

					if (!contractId || !operation || !signature) {
						return Response.json(
							{ error: 'Missing required parameters' },
							{ status: 400 },
						)
					}

					const transactionHash =
						await stellarService.executePasskeyTransaction(
							contractId,
							operation,
							signature,
						)

					return Response.json({
						success: true,
						transactionHash,
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/stellar/account-info': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const contractId = url.searchParams.get('contractId')

					if (!contractId) {
						return Response.json(
							{ error: 'Missing contractId parameter' },
							{ status: 400 },
						)
					}

					const accountInfo = await stellarService.getAccountInfo(contractId)

					return Response.json({
						success: true,
						data: accountInfo,
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},
}

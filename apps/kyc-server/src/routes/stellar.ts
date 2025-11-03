import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import { registerAccountOnChain } from '~/lib/stellar/auth-controller-service'
import { StellarPasskeyService } from '~/lib/stellar/stellar-passkey-service'
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
					const { contractAddress, contexts } = await req.json()

					if (!contractAddress) {
						return Response.json(
							{
								error:
									'Missing required parameter: contractAddress (smart wallet C... address)',
							},
							{ status: 400 },
						)
					}

					console.log('✅ Approving account for KYC:', contractAddress)

					// Add account to auth-controller for KYC approval
					// This registers the smart wallet as an authorized account
					// contexts should be an array of contract addresses (stringified)
					const contextArray = Array.isArray(contexts)
						? contexts
						: [contractAddress]
					const result = await registerAccountOnChain(
						contractAddress,
						contextArray,
					)

					return Response.json({
						success: true,
						message: 'Account approved and registered in auth-controller',
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
					const { address, signature, transactionHash } = await req.json()

					if (!address || !signature || !transactionHash) {
						return Response.json(
							{ error: 'Missing required parameters' },
							{ status: 400 },
						)
					}

					const isValid = await stellarService.verifyPasskeySignature(
						address,
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
					const { address, operation, signature } = await req.json()

					if (!address || !operation || !signature) {
						return Response.json(
							{ error: 'Missing required parameters' },
							{ status: 400 },
						)
					}

					const transactionHash =
						await stellarService.executePasskeyTransaction(
							address,
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
					const address = url.searchParams.get('address')

					if (!address) {
						return Response.json(
							{ error: 'Missing address parameter' },
							{ status: 400 },
						)
					}

					const accountInfo = await stellarService.getAccountInfo(address)

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

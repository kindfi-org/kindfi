import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import { corsConfig } from '../config/cors'
import { StellarPasskeyAccountService } from '../lib/stellar/stellar-passkey-service'
import { withCORS } from '../middleware/cors'
import { handleError } from '../utils/error-handler'

const appConfig: AppEnvInterface = appEnvConfig()

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Initialize Stellar service
const stellarService = new StellarPasskeyAccountService(
	appConfig.stellar.networkPassphrase,
	appConfig.stellar.rpcUrl,
	appConfig.stellar.accountSecp256r1ContractWasm, // process.env.STELLAR_FUNDING_SECRET_KEY,
)

export const stellarRoutes = {
	'/api/stellar/create-passkey-account': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { credentialId, publicKey, userId } = await req.json()

					if (!credentialId || !publicKey || !userId) {
						return Response.json(
							{ error: 'Missing required parameters' },
							{ status: 400 },
						)
					}

					const result = await stellarService.createPasskeyAccount({
						credentialId,
						publicKey,
					})

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

					const accountInfo =
						await stellarService.getPasskeyAccountInfo(contractId)

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

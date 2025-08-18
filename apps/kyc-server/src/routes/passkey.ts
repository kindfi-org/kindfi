import { corsConfig } from '../config/cors'
import {
	getAuthenticationOptions,
	getRegistrationOptions,
	verifyAuthentication,
	verifyRegistration,
} from '../lib/passkey/passkey-service'
import { withCORS } from '../middleware/cors'
import { handleError } from '../utils/error-handler'

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

export const passkeyRoutes = {
	'/api/passkey/generate-registration-options': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { identifier, origin, userId } = await req.json()
					const options = await getRegistrationOptions({
						identifier,
						origin,
						userId,
					})
					return Response.json(options)
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/passkey/verify-registration': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { identifier, origin, registrationResponse, userId } =
						await req.json()
					const result = await verifyRegistration({
						identifier,
						registrationResponse,
						origin,
						userId,
					})
					return Response.json(result)
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/passkey/generate-authentication-options': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { identifier, challenge, origin, userId } = await req.json()
					const options = await getAuthenticationOptions({
						identifier,
						origin,
						challenge,
						userId,
					})

					return Response.json(options)
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/passkey/verify-authentication': {
		async POST(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const { identifier, origin, authenticationResponse, userId } =
						await req.json()
					const result = await verifyAuthentication({
						identifier,
						authenticationResponse,
						origin,
						userId,
					})

					return Response.json(result)
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},
}

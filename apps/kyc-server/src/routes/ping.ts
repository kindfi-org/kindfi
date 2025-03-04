import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

export const pingRoutes = {
	'/api/ping': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				return Response.json({
					message: 'pong',
					method: 'GET',
				})
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},
}

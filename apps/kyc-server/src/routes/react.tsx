import type { ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { routes } from '../components/Navigation'
import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'
import Home from '../pages/Home'
import { contentMap } from '../utils/contentMap'

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Helper function to create a route with standard configuration
const createRoute = (message: string | ReactNode, path: string) => ({
	async GET(req: Request) {
		return withConfiguredCORS(async () => {
			const stream = await renderToReadableStream(
				<Home message={message} currentPath={path} />,
			)

			return new Response(stream, {
				headers: { 'Content-Type': 'text/html' },
			})
		})(req)
	},
	OPTIONS: withConfiguredCORS(() => new Response(null)),
})

// Create routes object from the routes array
const routesObject = routes.reduce(
	(acc, route) => {
		acc[route.path] = createRoute(
			contentMap[route.path] || `Welcome to ${route.label}`,
			route.path,
		)
		return acc
	},
	{} as Record<string, ReturnType<typeof createRoute>>,
)

export const reactRoutes = routesObject

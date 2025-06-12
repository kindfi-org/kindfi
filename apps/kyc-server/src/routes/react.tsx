import React from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { About } from '../components/About'
import { Home } from '../components/Home'
import { routes } from '../components/Navigation'
import { WebSocketDemo } from '../components/WebSocketDemo'
import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'
import { contentMap } from '../utils/contentMap'

// Create a configured CORS handler
const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Helper function to create a route with standard configuration
const createRoute = (message: string | ReactNode, path: string) => ({
	async GET(req: Request) {
		return withConfiguredCORS(async () => {
			const html = renderToString(
				<Home message={message} currentPath={path} />,
			)

			return new Response(`<!DOCTYPE html>${html}`, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' },
			})
		})(req)
	},
	OPTIONS: withConfiguredCORS(() => new Response(null)),
})

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

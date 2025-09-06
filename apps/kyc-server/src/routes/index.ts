import { passkeyRoutes } from './passkey'
import { pingRoutes } from './ping'
import { reactRoutes } from './react'
import { stellarRoutes } from './stellar'

// Combine all routes
export const routes = {
	...pingRoutes,
	...passkeyRoutes,
	...stellarRoutes,
	...reactRoutes,
}

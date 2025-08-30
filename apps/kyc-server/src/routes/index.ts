import { passkeyRoutes } from './passkey'
import { pingRoutes } from './ping'
import { reactRoutes } from './react'
import { userRoutes } from './users'

// Combine all routes
export const routes = {
	...pingRoutes,
	...passkeyRoutes,
	...reactRoutes,
	...userRoutes,
}

import { passkeyRoutes } from './passkey'
import { pingRoutes } from './ping'
import { reactRoutes } from './react'
import { stellarRoutes } from './stellar'
import { usersRoutes } from './users'

// Combine all routes
export const routes = {
	...pingRoutes,
	...passkeyRoutes,
	...stellarRoutes,
	...usersRoutes,
	...reactRoutes,
}

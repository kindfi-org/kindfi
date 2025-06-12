import { dashboardRoutes } from '../components/dashboard-routes'
import { passkeyRoutes } from './passkey'
import { pingRoutes } from './ping'
import { reactRoutes } from './react'

// Combine all routes
export const routes = {
	...pingRoutes,
	...passkeyRoutes,
	...reactRoutes,
	...dashboardRoutes,
}

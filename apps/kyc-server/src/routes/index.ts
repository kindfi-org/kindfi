import { pingRoutes } from './ping'
import { reactRoutes } from './react'

export const routes = {
	...pingRoutes,
	...reactRoutes,
}

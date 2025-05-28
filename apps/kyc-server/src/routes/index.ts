import { passkeyRoutes } from './passkey'
import { pingRoutes } from './ping'
import { reactRoutes } from './react'
import { kycReviewRoutes } from './kyc-reviews'

// Combine all routes
export const routes = {
	...pingRoutes,
	...passkeyRoutes,
	...reactRoutes,
	...kycReviewRoutes,
}

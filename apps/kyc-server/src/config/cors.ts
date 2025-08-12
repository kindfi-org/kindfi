import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import type { CorsOptions } from '../middleware/cors'

const appConfig: AppEnvInterface = appEnvConfig('kyc-server')

/**
 * CORS configuration for the application
 *
 * This can be modified to restrict access to specific domains
 * Examples:
 * - ['https://example.com', 'https://api.example.com'] - Allow only these domains
 * - ['*.example.com'] - Allow all subdomains of example.com
 * - '*' - Allow all origins (not recommended for production)
 */
export const corsConfig: CorsOptions = {
	// Set allowed origins based on environment
	allowedOrigins:
		appConfig.env.nodeEnv === 'production'
			? appConfig.kycServer.allowedOrigins
				? appConfig.kycServer.allowedOrigins.split(',')
				: ['https://app.kindfi.com']
			: '*',

	// HTTP methods allowed
	allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

	// HTTP headers allowed
	allowedHeaders: ['Content-Type', 'Authorization'],

	// Cache duration for preflight requests in seconds (24 hours)
	maxAge: 86400,
}

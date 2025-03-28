/**
 * CORS middleware to handle preflight requests and add CORS headers
 *
 * @param options Configuration options for CORS
 * @param options.allowedOrigins Array of allowed origins or '*' for wildcard
 * @param options.allowedMethods HTTP methods to allow
 * @param options.allowedHeaders HTTP headers to allow
 * @param options.maxAge Cache duration for preflight requests in seconds
 */
export type CorsOptions = {
	allowedOrigins: string[] | '*'
	allowedMethods?: string[]
	allowedHeaders?: string[]
	maxAge?: number
}

// Default CORS configuration
const defaultCorsOptions: CorsOptions = {
	allowedOrigins: '*',
	allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	maxAge: 86400, // 24 hours
}

/**
 * Check if the origin is allowed based on the CORS configuration
 */
const isOriginAllowed = (
	origin: string | null,
	allowedOrigins: string[] | '*',
): boolean => {
	if (!origin) return false
	if (allowedOrigins === '*') return true

	return allowedOrigins.some((allowedOrigin) => {
		// Exact match
		if (allowedOrigin === origin) return true

		// Wildcard subdomain match (e.g., *.example.com)
		if (allowedOrigin.startsWith('*.')) {
			const domain = allowedOrigin.substring(2)
			return origin.endsWith(domain) && origin.includes('.')
		}

		return false
	})
}

/**
 * CORS middleware to handle preflight requests and add CORS headers
 */
export const withCORS = (
	handler: (req: Request) => Response | Promise<Response>,
	options: Partial<CorsOptions> = {},
) => {
	// Merge default options with provided options
	const corsOptions: CorsOptions = {
		...defaultCorsOptions,
		...options,
	}

	return async (req: Request) => {
		const origin = req.headers.get('origin')
		const allowOrigin = isOriginAllowed(origin, corsOptions.allowedOrigins)
			? origin
			: corsOptions.allowedOrigins === '*'
			  ? '*'
			  : null

		// If origin is not allowed, return 403 Forbidden
		if (!allowOrigin) {
			return new Response('CORS origin not allowed', { status: 403 })
		}

		// Handle preflight requests
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': allowOrigin,
					'Access-Control-Allow-Methods':
						corsOptions.allowedMethods?.join(', ') || '',
					'Access-Control-Allow-Headers':
						corsOptions.allowedHeaders?.join(', ') || '',
					'Access-Control-Max-Age': corsOptions.maxAge?.toString() || '',
				},
			})
		}

		// Process the actual request
		const response = await handler(req)

		// Add CORS headers to the response
		const headers = new Headers(response.headers)
		headers.set('Access-Control-Allow-Origin', allowOrigin)
		headers.set(
			'Access-Control-Allow-Methods',
			corsOptions.allowedMethods?.join(', ') || '',
		)
		headers.set(
			'Access-Control-Allow-Headers',
			corsOptions.allowedHeaders?.join(', ') || '',
		)

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	}
}

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import winston from 'winston'

// Create a logger instance
const logger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.Console({ format: winston.format.simple() }),
	],
})

// Initialize Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a rate limiter
const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(5, '15 m'),
})

// Utility function for allowlist validation
function isValidRedirectUrl(url: string): boolean {
	const trustedDomains = [
		'kindfi.org',
		'www.kindfi.org',
		'kind-fi.com',
		'www.kind-fi.com',
		'kindfi.vercel.app',
		'localhost',
	]
	// Tighter subdomain pattern: allows only alphanumeric characters after 'kindfi-'
	const subdomainPattern = /^kindfi-[a-zA-Z0-9]+\.vercel\.app$/

	try {
		// Ensure the URL is a valid string and sanitize
		if (typeof url !== 'string') {
			logger.warn('Invalid redirect_url type, expected a string:', { url })
			return false
		}

		const sanitizedUrl = new URL(url) // This will throw an error if the URL is malformed
		const { hostname, protocol } = sanitizedUrl

		// Ensure the URL uses HTTPS for secure redirection (except for localhost)
		if (hostname !== 'localhost' && protocol !== 'https:') {
			logger.warn('Redirect URL must use HTTPS, but received:', { url })
			return false
		}

		// Check if hostname matches trusted domains or subdomain pattern
		if (trustedDomains.includes(hostname) || subdomainPattern.test(hostname)) {
			logger.info('Valid redirect URL:', { hostname })
			return true
		}

		logger.warn('Untrusted domain in redirect URL:', { hostname })
		return false
	} catch (error) {
		logger.error('Invalid or malformed redirect URL:', { error })
		return false
	}
}

export async function GET(request: NextRequest) {
	// Extract IP address from 'x-forwarded-for' header (for proxy support)
	const ip =
		request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

	// Rate limiting check
	const { success, limit, reset, remaining } = await ratelimit.limit(ip)

	if (!success) {
		logger.warn('Rate limit exceeded:', { ip })
		return new NextResponse('Too Many Requests', {
			status: 429,
			headers: {
				'X-RateLimit-Limit': limit.toString(),
				'X-RateLimit-Remaining': remaining.toString(),
				'X-RateLimit-Reset': reset.toString(),
			},
		})
	}

	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const redirectUrl = requestUrl.searchParams.get('redirect_url')

	// Validate if redirectUrl is a valid string before passing it for validation
	if (
		redirectUrl &&
		typeof redirectUrl === 'string' &&
		isValidRedirectUrl(redirectUrl)
	) {
		logger.info('Redirecting to valid URL:', { redirectUrl })
		return NextResponse.redirect(redirectUrl)
	}

	// Default to the root of the main domain (kindfi.org) if no valid redirect URL is provided
	const defaultRedirectUrl = 'https://kindfi.org'
	logger.warn('Invalid or missing redirect URL, redirecting to root domain:', {
		defaultRedirectUrl,
	})
	return NextResponse.redirect(defaultRedirectUrl)
}

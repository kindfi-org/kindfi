import { RateLimiter } from '~/lib/auth/rate-limiter'
import { Logger } from '~/lib/logger'

export class RateLimitExceededError extends Error {
	constructor() {
		super('Too many requests. Please try again later.')
		this.name = 'RateLimitExceededError'
	}
}

const logger = new Logger()
const rateLimiter = new RateLimiter()

const REDIS_TIMEOUT_MS = 3_000

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	const timeout = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error('Rate limit check timed out')), ms)
	})
	try {
		return await Promise.race([promise, timeout])
	} finally {
		if (timeoutId) clearTimeout(timeoutId)
	}
}

/**
 * Apply a rate limit keyed by `identifier` for `action`. Throws RATE_LIMITED
 * when the caller has exceeded the configured budget. When Redis is unavailable
 * or slow, logs a warning and allows the request so auth flows keep working.
 */
export async function enforceRateLimit(identifier: string, action: string): Promise<void> {
	try {
		const result = await withTimeout(rateLimiter.increment(identifier, action), REDIS_TIMEOUT_MS)

		if (result.isBlocked) {
			logger.warn({
				eventType: 'SERVER_ACTION_RATE_LIMITED',
				action,
				identifier,
			})
			throw new RateLimitExceededError()
		}

		if (result.error) {
			logger.warn({
				eventType: 'SERVER_ACTION_RATE_LIMIT_UNAVAILABLE',
				action,
				identifier,
				error: result.error,
			})
		}
	} catch (error) {
		if (error instanceof RateLimitExceededError) throw error

		logger.warn({
			eventType: 'SERVER_ACTION_RATE_LIMIT_UNAVAILABLE',
			action,
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

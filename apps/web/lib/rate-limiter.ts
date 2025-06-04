import { Redis } from '@upstash/redis'

interface RateLimiterOptions {
	windowMs: number
	max: number
}

interface RateLimitResult {
	success: boolean
	retryAfter: number
}

export class RateLimiter {
	private redis: Redis
	private windowMs: number
	private max: number

	constructor(options: RateLimiterOptions) {
		// Validate windowMs and max are positive integers
		if (!Number.isInteger(options.windowMs) || options.windowMs <= 0) {
			throw new Error('windowMs must be a positive integer')
		}
		if (!Number.isInteger(options.max) || options.max <= 0) {
			throw new Error('max must be a positive integer')
		}

		const url = process.env.UPSTASH_REDIS_REST_URL
		const token = process.env.UPSTASH_REDIS_REST_TOKEN

		if (!url || !token) {
			throw new Error(
				'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set',
			)
		}

		try {
			this.redis = new Redis({
				url,
				token,
			})
		} catch (error) {
			throw new Error(
				`Failed to initialize Redis client: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}

		this.windowMs = options.windowMs
		this.max = options.max
	}

	async check(key: string): Promise<RateLimitResult> {
		try {
			const now = Date.now()
			const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`

			// The windowKey pattern is: ratelimit:<userKey>:<timeWindowBucket>
			// Combines prefix, user key, and current time window for rate limiting.

			// Get current count
			const count = await this.redis.incr(windowKey)

			// Set expiry if this is the first request in the window
			if (count === 1) {
				await this.redis.expire(windowKey, Math.ceil(this.windowMs / 1000))
			}

			const success = count <= this.max
			// Calculate retry after time - if at limit, wait for next window
			const retryAfter = success
				? 0
				: Math.ceil((this.windowMs - (now % this.windowMs)) / 1000)

			return {
				success,
				retryAfter,
			}
		} catch (error) {
			throw new Error(
				`Rate limiter check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}
}

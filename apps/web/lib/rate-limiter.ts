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
		const now = Date.now()
		const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`

		// Get current count
		const count = await this.redis.incr(windowKey)

		// Set expiry if this is the first request in the window
		if (count === 1) {
			await this.redis.expire(windowKey, Math.ceil(this.windowMs / 1000))
		}

		// Calculate retry after time
		const retryAfter = Math.ceil((this.windowMs - (now % this.windowMs)) / 1000)

		return {
			success: count <= this.max,
			retryAfter,
		}
	}
}

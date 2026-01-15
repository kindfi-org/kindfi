import { Redis } from '@upstash/redis'

export interface RateLimitConfig {
	maxAttempts: number
	windowMs: number
	redisUrl?: string
	redisToken?: string
}

export interface RateLimitResult {
	allowed: boolean
	remaining: number
	resetAt: number
}

/**
 * Rate limiter for signature verification with Upstash Redis backend and in-memory fallback
 */
export class SignatureRateLimiter {
	private redis: Redis | null = null
	private inMemoryStore: Map<string, { count: number; resetAt: number }> =
		new Map()
	private config: RateLimitConfig
	private cleanupInterval: NodeJS.Timeout | null = null

	constructor(config: RateLimitConfig) {
		this.config = config

		// Try to connect to Upstash Redis if credentials provided
		if (config.redisUrl && config.redisToken) {
			try {
				this.redis = new Redis({
					url: config.redisUrl,
					token: config.redisToken,
				})
				console.log('✅ Connected to Upstash Redis for rate limiting')
			} catch (error) {
				console.warn(
					'⚠️ Failed to initialize Upstash Redis, using in-memory store:',
					error,
				)
			}
		} else {
			console.log('⚠️ Redis credentials not provided, using in-memory store')
		}

		// Start cleanup interval for in-memory store
		this.startCleanupInterval()
	}

	/**
	 * Check if the request should be rate limited
	 */
	async checkLimit(key: string): Promise<RateLimitResult> {
		try {
			if (this.redis) {
				return await this.checkRedisLimit(key)
			}
		} catch (error) {
			console.warn('⚠️ Redis rate limit check failed, using in-memory:', error)
		}

		// Fallback to in-memory
		return this.checkInMemoryLimit(key)
	}

	/**
	 * Reset the rate limit counter for a key (e.g., on successful verification)
	 */
	async reset(key: string): Promise<void> {
		try {
			if (this.redis) {
				await this.redis.del(this.getRedisKey(key))
			}
		} catch (error) {
			console.warn('⚠️ Redis reset failed:', error)
		}

		// Always reset in-memory as well
		this.inMemoryStore.delete(key)
	}

	/**
	 * Check rate limit using Upstash Redis
	 */
	private async checkRedisLimit(key: string): Promise<RateLimitResult> {
		if (!this.redis) {
			throw new Error('Redis not initialized')
		}

		const redisKey = this.getRedisKey(key)
		const now = Date.now()
		const windowStart = now - this.config.windowMs
		const resetAt = now + this.config.windowMs

		// Use Redis sorted set for sliding window
		const pipeline = this.redis.pipeline()

		// Remove old entries outside the window
		pipeline.zremrangebyscore(redisKey, 0, windowStart)

		// Count current entries
		pipeline.zcard(redisKey)

		// Add current attempt
		pipeline.zadd(redisKey, { score: now, member: `${now}` })

		// Set expiry (in seconds for Upstash)
		pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000))

		const results = await pipeline.exec()

		if (!results) {
			throw new Error('Redis pipeline failed')
		}

		// Extract count from pipeline results (zcard result is at index 1)
		const count = (results[1] as number) || 0
		const allowed = count < this.config.maxAttempts
		const remaining = Math.max(0, this.config.maxAttempts - count - 1)

		return {
			allowed,
			remaining,
			resetAt,
		}
	}

	/**
	 * Check rate limit using in-memory store
	 */
	private checkInMemoryLimit(key: string): RateLimitResult {
		const now = Date.now()
		const entry = this.inMemoryStore.get(key)

		if (!entry || entry.resetAt < now) {
			// New window
			const resetAt = now + this.config.windowMs
			this.inMemoryStore.set(key, { count: 1, resetAt })

			return {
				allowed: true,
				remaining: this.config.maxAttempts - 1,
				resetAt,
			}
		}

		// Increment counter
		entry.count++
		const allowed = entry.count <= this.config.maxAttempts
		const remaining = Math.max(0, this.config.maxAttempts - entry.count)

		return {
			allowed,
			remaining,
			resetAt: entry.resetAt,
		}
	}

	/**
	 * Get Redis key with prefix
	 */
	private getRedisKey(key: string): string {
		return `ratelimit:signature:${key}`
	}

	/**
	 * Start periodic cleanup of expired in-memory entries
	 */
	private startCleanupInterval(): void {
		this.cleanupInterval = setInterval(
			() => {
				const now = Date.now()
				for (const [key, entry] of this.inMemoryStore.entries()) {
					if (entry.resetAt < now) {
						this.inMemoryStore.delete(key)
					}
				}
			},
			60000, // Cleanup every minute
		)
	}

	/**
	 * Cleanup resources
	 */
	async disconnect(): Promise<void> {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
		}

		// Upstash Redis doesn't need explicit disconnection
		this.redis = null
		this.inMemoryStore.clear()
	}
}

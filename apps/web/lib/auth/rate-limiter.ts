import { Redis } from '@upstash/redis'
import { AuthErrorType } from '../types/auth'

const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 60 * 15 // 15 minutes in seconds
const RATE_LIMIT_BLOCK_DURATION = 60 * 60 // 1 hour in seconds

let redis: Redis | null = null

function getRedis(): Redis | null {
	if (redis) return redis
	try {
		redis = Redis.fromEnv()
		return redis
	} catch (err) {
		console.warn(
			'[RateLimiter] Failed to initialize Redis — rate limiting disabled:',
			err,
		)
		return null
	}
}

export class RateLimiter {
	private maxAttempts: number
	private windowSecs: number
	private blockSecs: number
	private configId: string

	constructor(config?: {
		maxAttempts?: number
		windowSecs?: number
		blockSecs?: number
		configId?: string
	}) {
		this.maxAttempts = config?.maxAttempts ?? RATE_LIMIT_ATTEMPTS
		this.windowSecs = config?.windowSecs ?? RATE_LIMIT_WINDOW
		this.blockSecs = config?.blockSecs ?? RATE_LIMIT_BLOCK_DURATION
		this.configId = config?.configId ?? 'default'
	}

	private getKey(identifier: string, action: string): string {
		return `rate_limit:${action}:${this.configId}:${identifier}`
	}

	private getBlockKey(identifier: string, action: string): string {
		return `rate_limit_block:${action}:${this.configId}:${identifier}`
	}

	async isBlocked(identifier: string, action: string): Promise<boolean> {
		const client = getRedis()
		if (!client) return false

		try {
			const blockKey = this.getBlockKey(identifier, action)
			const isBlocked = await client.exists(blockKey)
			return isBlocked === 1
		} catch (err) {
			console.warn(
				'[RateLimiter] Redis error in isBlocked — failing open:',
				err,
			)
			return false
		}
	}

	async increment(
		identifier: string,
		action: string,
	): Promise<{
		isBlocked: boolean
		attemptsRemaining: number
		error?: AuthErrorType
	}> {
		const client = getRedis()
		if (!client) {
			return {
				isBlocked: false,
				attemptsRemaining: this.maxAttempts,
				error: AuthErrorType.SERVER_ERROR,
			}
		}

		try {
			const key = this.getKey(identifier, action)
			const blockKey = this.getBlockKey(identifier, action)

			if (await this.isBlocked(identifier, action)) {
				return {
					isBlocked: true,
					attemptsRemaining: 0,
					error: AuthErrorType.RATE_LIMIT_EXCEEDED,
				}
			}

			const attempts = await client.incr(key)

			if (attempts === 1) {
				await client.expire(key, this.windowSecs)
			}

			if (attempts > this.maxAttempts) {
				await client.setex(blockKey, this.blockSecs, '1')
				await client.del(key)

				return {
					isBlocked: true,
					attemptsRemaining: 0,
					error: AuthErrorType.RATE_LIMIT_EXCEEDED,
				}
			}

			return {
				isBlocked: false,
				attemptsRemaining: this.maxAttempts - attempts,
			}
		} catch (err) {
			console.warn(
				'[RateLimiter] Redis error in increment — failing open:',
				err,
			)
			return {
				isBlocked: false,
				attemptsRemaining: this.maxAttempts,
				error: AuthErrorType.SERVER_ERROR,
			}
		}
	}

	async reset(identifier: string, action: string): Promise<void> {
		const client = getRedis()
		if (!client) return

		try {
			const key = this.getKey(identifier, action)
			const blockKey = this.getBlockKey(identifier, action)
			await Promise.all([client.del(key), client.del(blockKey)])
		} catch (err) {
			console.warn('[RateLimiter] Redis error in reset — failing open:', err)
		}
	}
}

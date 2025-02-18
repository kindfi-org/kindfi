import { Redis } from '@upstash/redis'
import { AuthErrorType } from '../types/auth'

const redis = Redis.fromEnv()

const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 60 * 15 // 15 minutes in seconds
const RATE_LIMIT_BLOCK_DURATION = 60 * 60 // 1 hour in seconds

export class RateLimiter {
	private getKey(identifier: string, action: string): string {
		return `rate_limit:${action}:${identifier}`
	}

	private getBlockKey(identifier: string, action: string): string {
		return `rate_limit_block:${action}:${identifier}`
	}

	async isBlocked(identifier: string, action: string): Promise<boolean> {
		const blockKey = this.getBlockKey(identifier, action)
		const isBlocked = await redis.exists(blockKey)
		return isBlocked === 1
	}

	async increment(
		identifier: string,
		action: string,
	): Promise<{
		isBlocked: boolean
		attemptsRemaining: number
		error?: AuthErrorType
	}> {
		const key = this.getKey(identifier, action)
		const blockKey = this.getBlockKey(identifier, action)

		// Check if already blocked
		if (await this.isBlocked(identifier, action)) {
			return {
				isBlocked: true,
				attemptsRemaining: 0,
				error: AuthErrorType.RATE_LIMIT_EXCEEDED,
			}
		}

		// Increment attempts
		const attempts = await redis.incr(key)

		// Set expiry for first attempt
		if (attempts === 1) {
			await redis.expire(key, RATE_LIMIT_WINDOW)
		}

		// Check if exceeded
		if (attempts > RATE_LIMIT_ATTEMPTS) {
			// Block the identifier
			await redis.setex(blockKey, RATE_LIMIT_BLOCK_DURATION, '1')
			await redis.del(key)

			return {
				isBlocked: true,
				attemptsRemaining: 0,
				error: AuthErrorType.RATE_LIMIT_EXCEEDED,
			}
		}

		return {
			isBlocked: false,
			attemptsRemaining: RATE_LIMIT_ATTEMPTS - attempts,
		}
	}

	async reset(identifier: string, action: string): Promise<void> {
		const key = this.getKey(identifier, action)
		const blockKey = this.getBlockKey(identifier, action)

		await Promise.all([redis.del(key), redis.del(blockKey)])
	}
}

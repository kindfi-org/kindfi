import { describe, expect, test } from 'bun:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Redis } from '@upstash/redis'
import * as dotenv from 'dotenv'

// Load environment variables from .env
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

// Test client for rate limiting
const testClient = '10.0.0.1'
const TEST_ACTION = 'verifyOtp'

describe('Redis rate limiting infrastructure', () => {
	let redis

	test('should establish Redis connection with proper credentials', async () => {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		})

		expect(process.env.UPSTASH_REDIS_REST_URL).toBeDefined()
		expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeDefined()

		// Verify connection by setting and getting a test value
		const testKey = 'test:connection'
		await redis.set(testKey, 'ok')
		const value = await redis.get(testKey)
		expect(value).toBe('ok')
		await redis.del(testKey)
	})

	test('should properly handle rate limit counters', async () => {
		const counterKey = `rate_limit:${TEST_ACTION}:${testClient}`

		// Clean start
		await redis.del(counterKey)

		// Set and verify counter
		await redis.setex(counterKey, 900, 3) // 15 minutes = 900 seconds
		const count = await redis.get(counterKey)
		const ttl = await redis.ttl(counterKey)

		expect(typeof count).toBe('number')
		expect(count).toBe(3)
		expect(ttl).toBeGreaterThan(0)
		expect(ttl).toBeLessThanOrEqual(900)

		// Clean up
		await redis.del(counterKey)
	})

	test('should properly handle rate limit blocks', async () => {
		const blockKey = `rate_limit_block:${TEST_ACTION}:${testClient}`

		// Clean start
		await redis.del(blockKey)

		// Set and verify block
		await redis.setex(blockKey, 3600, 1) // 1 hour = 3600 seconds
		const isBlocked = await redis.exists(blockKey)
		const ttl = await redis.ttl(blockKey)

		expect(isBlocked).toBe(1)
		expect(ttl).toBeGreaterThan(0)
		expect(ttl).toBeLessThanOrEqual(3600)

		// Clean up
		await redis.del(blockKey)
	})

	test('should handle key expiration correctly', async () => {
		const shortKey = `rate_limit:${TEST_ACTION}:${testClient}`

		// Set a key with 1 second expiration
		await redis.setex(shortKey, 1, 1)

		// Verify it exists
		let exists = await redis.exists(shortKey)
		expect(exists).toBe(1)

		// Wait for expiration
		await new Promise((resolve) => setTimeout(resolve, 1100))

		// Verify it's gone
		exists = await redis.exists(shortKey)
		expect(exists).toBe(0)
	})

	test('should maintain separate counters for different clients', async () => {
		const client1Key = `rate_limit:${TEST_ACTION}:client1`
		const client2Key = `rate_limit:${TEST_ACTION}:client2`

		// Clean start
		await Promise.all([redis.del(client1Key), redis.del(client2Key)])

		// Set different values for each client
		await Promise.all([
			redis.setex(client1Key, 900, 3),
			redis.setex(client2Key, 900, 1),
		])

		// Verify values are independent
		const [client1Count, client2Count] = await Promise.all([
			redis.get(client1Key),
			redis.get(client2Key),
		])

		expect(client1Count).toBe(3)
		expect(client2Count).toBe(1)

		// Clean up
		await Promise.all([redis.del(client1Key), redis.del(client2Key)])
	})
})

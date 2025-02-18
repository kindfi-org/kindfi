import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Redis } from '@upstash/redis'
import * as dotenv from 'dotenv'

// Load environment variables from .env
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

async function checkRateLimitKeys() {
	const redis = new Redis({
		url: process.env.UPSTASH_REDIS_REST_URL,
		token: process.env.UPSTASH_REDIS_REST_TOKEN,
	})

	// Get all keys
	const keys = await redis.keys('*')

	// Separate keys by type
	const blockKeys = keys.filter((key) => key.includes('rate_limit_block'))
	const attemptKeys = keys.filter((key) => key.startsWith('rate_limit:'))
	const upstashKeys = keys.filter((key) => key.includes('@upstash/ratelimit'))

	console.log('\nRate Limit Status:')
	console.log('=================')

	if (blockKeys.length > 0) {
		console.log('\nActive Blocks:')
		console.log('-------------')
		for (const key of blockKeys) {
			const value = await redis.get(key)
			const ttl = await redis.ttl(key)
			const [, action, identifier] = key.split(':')

			console.log(`Action: ${action}`)
			console.log(`Identifier: ${identifier}`)
			console.log(`Block Status: ${value === '1' ? 'Blocked' : 'Not Blocked'}`)
			console.log(`Time Remaining: ${ttl} seconds`)
			console.log('-------------')
		}
	}

	if (attemptKeys.length > 0) {
		console.log('\nAttempt Counters:')
		console.log('----------------')
		for (const key of attemptKeys) {
			const value = await redis.get(key)
			const ttl = await redis.ttl(key)
			const [, action, identifier] = key.split(':')

			console.log(`Action: ${action}`)
			console.log(`Identifier: ${identifier}`)
			console.log(`Attempts: ${value}`)
			console.log(`Window Expires: ${ttl} seconds`)
			console.log('----------------')
		}
	}

	if (upstashKeys.length > 0) {
		console.log('\nUpstash Internal Keys:')
		console.log('--------------------')
		for (const key of upstashKeys) {
			const value = await redis.get(key)
			const ttl = await redis.ttl(key)
			console.log(`Key: ${key}`)
			console.log(`Value: ${value}`)
			console.log(`TTL: ${ttl} seconds`)
			console.log('--------------------')
		}
	}

	if (keys.length === 0) {
		console.log('No rate limit keys found')
	}
}

// Run the check
checkRateLimitKeys().catch(console.error)

import { describe, expect, test } from 'bun:test'
import { Redis } from '@upstash/redis'
import fetch from 'node-fetch'

const baseUrl = 'http://localhost:3000/auth/confirm'
const testParams = {
	// Using a more realistic token hash format
	token_hash: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
	type: 'email',
}

// Initialize Redis for cleanup
const redis = Redis.fromEnv()

async function makeRequest(clientId = 'unknown') {
	const url = `${baseUrl}?token_hash=${testParams.token_hash}&type=${testParams.type}`
	try {
		const response = await fetch(url, {
			headers: {
				'x-forwarded-for': clientId,
			},
		})
		return {
			status: response.status,
			redirectUrl: response.url,
		}
	} catch (error) {
		console.error(`Request failed for client ${clientId}:`, error.message)
		return null
	}
}

async function cleanupRateLimitKeys(clientId) {
	const keys = [
		`rate_limit:verifyOtp:${clientId}`,
		`rate_limit_block:verifyOtp:${clientId}`,
	]
	await Promise.all(keys.map((key) => redis.del(key)))
}

describe('OTP verification rate limiting', () => {
	test('should allow requests under the limit', async () => {
		const clientId = '10.0.0.1'
		await cleanupRateLimitKeys(clientId)

		// All 5 attempts should be allowed
		for (let i = 1; i <= 5; i++) {
			const result = await makeRequest(clientId)
			expect(result).not.toBeNull()

			const url = new URL(result.redirectUrl)
			expect(url.searchParams.get('reason')).not.toBe('rate_limit_exceeded')
		}
	})

	test('should block requests after exceeding limit', async () => {
		const clientId = '10.0.0.2'
		await cleanupRateLimitKeys(clientId)

		// Make requests up to the limit
		for (let i = 0; i < 5; i++) {
			await makeRequest(clientId)
		}

		// This request should be blocked
		const blockedResult = await makeRequest(clientId)
		const url = new URL(blockedResult.redirectUrl)

		expect(url.searchParams.get('reason')).toBe('rate_limit_exceeded')
		expect(url.searchParams.get('error')).toContain('Too many attempts')
	})

	test('should handle rate limits independently per client', async () => {
		const clientA = '10.0.0.3'
		const clientB = '10.0.0.4'
		await Promise.all([
			cleanupRateLimitKeys(clientA),
			cleanupRateLimitKeys(clientB),
		])

		// Block client A
		for (let i = 0; i < 6; i++) {
			await makeRequest(clientA)
		}

		// Wait a bit to ensure rate limit states are properly set
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Client B should still be allowed all 5 attempts
		for (let i = 1; i <= 5; i++) {
			const result = await makeRequest(clientB)
			expect(result).not.toBeNull()
			const url = new URL(result.redirectUrl)
			expect(url.searchParams.get('reason')).not.toBe('rate_limit_exceeded')
		}
	}, 10000) // Increased timeout for this specific test
})

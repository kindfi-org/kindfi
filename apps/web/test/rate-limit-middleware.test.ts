import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'

// ─── Mutable mock handles ────────────────────────────────────────────────────

const mockIncrement = mock(async (_id: string, _action: string) => ({
	isBlocked: false,
	attemptsRemaining: 9,
}))

// ─── Module mocks ────────────────────────────────────────────────────────────

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: ResponseInit) => ({
			status: init?.status ?? 200,
			headers: init?.headers ?? {},
			json: async () => JSON.parse(JSON.stringify(body)),
		}),
	},
}))

mock.module('~/lib/auth/rate-limiter', () => ({
	RateLimiter: class {
		increment = mockIncrement
	},
}))

// Dynamic import ensures mocks are registered before module loads
const { withRateLimit, RATE_LIMIT_PRESETS } = await import(
	'../lib/middleware/rate-limit'
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(path = '/api/test'): NextRequest {
	return {
		nextUrl: { pathname: path },
		ip: '127.0.0.1',
	} as unknown as NextRequest
}

function makeHandler(status = 200) {
	return mock(async (_req: NextRequest) => ({
		status,
		json: async () => ({ ok: true }),
	}))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('withRateLimit', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))
	})

	describe('RATE_LIMIT_PRESETS', () => {
		test('exports strict, moderate, lenient presets', () => {
			expect(RATE_LIMIT_PRESETS.strict).toBeDefined()
			expect(RATE_LIMIT_PRESETS.moderate).toBeDefined()
			expect(RATE_LIMIT_PRESETS.lenient).toBeDefined()
		})

		test('strict preset has smallest attempt count', () => {
			expect(RATE_LIMIT_PRESETS.strict.attempts).toBeLessThan(
				RATE_LIMIT_PRESETS.moderate.attempts,
			)
			expect(RATE_LIMIT_PRESETS.moderate.attempts).toBeLessThan(
				RATE_LIMIT_PRESETS.lenient.attempts,
			)
		})
	})

	describe('normal flow', () => {
		test('calls the handler when not blocked', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'moderate', identifier: async () => 'user-1' },
				handler,
			)

			const req = makeRequest()
			const res = await wrapped(req)

			expect(handler).toHaveBeenCalledTimes(1)
			expect(res.status).toBe(200)
		})

		test('calls increment with the resolved identifier and pathname', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'lenient', identifier: async () => 'user-abc' },
				handler,
			)

			await wrapped(makeRequest('/api/nfts/evolve'))

			expect(mockIncrement).toHaveBeenCalledWith('user-abc', '/api/nfts/evolve')
		})

		test('uses moderate preset when none specified', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ identifier: async () => 'user-1' },
				handler,
			)

			const res = await wrapped(makeRequest())
			expect(res.status).toBe(200)
			expect(handler).toHaveBeenCalledTimes(1)
		})
	})

	describe('rate limit exceeded', () => {
		beforeEach(() => {
			mockIncrement.mockImplementation(async () => ({
				isBlocked: true,
				attemptsRemaining: 0,
			}))
		})

		test('returns HTTP 429 when isBlocked is true', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'strict', identifier: async () => 'user-1' },
				handler,
			)

			const res = await wrapped(makeRequest())

			expect(res.status).toBe(429)
			expect(handler).not.toHaveBeenCalled()
		})

		test('includes Retry-After header matching the preset window', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'strict', identifier: async () => 'user-1' },
				handler,
			)

			const res = await wrapped(makeRequest())

			expect((res.headers as Record<string, string>)['Retry-After']).toBe(
				RATE_LIMIT_PRESETS.strict.window.toString(),
			)
		})

		test('response body contains error message', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'strict', identifier: async () => 'user-1' },
				handler,
			)

			const res = await wrapped(makeRequest())
			const body = await res.json()

			expect(body.error).toContain('Too many requests')
		})
	})

	describe('Redis failure — fail open', () => {
		beforeEach(() => {
			mockIncrement.mockImplementation(async () => {
				throw new Error('Redis connection refused')
			})
		})

		test('calls the handler when increment throws', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'moderate', identifier: async () => 'user-1' },
				handler,
			)

			const res = await wrapped(makeRequest())

			expect(handler).toHaveBeenCalledTimes(1)
			expect(res.status).toBe(200)
		})

		test('does not propagate the Redis error to the caller', async () => {
			const handler = makeHandler()
			const wrapped = withRateLimit(
				{ preset: 'moderate', identifier: async () => 'user-1' },
				handler,
			)

			await expect(wrapped(makeRequest())).resolves.toBeDefined()
		})
	})
})

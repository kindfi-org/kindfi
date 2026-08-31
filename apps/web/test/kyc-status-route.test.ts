/**
 * GET /api/kyc/status rate limiting.
 *
 * The limiter must run before KYC database work and return the repository
 * 429 body. Auth and KYC query behavior stay the same when the request is allowed.
 */

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'

const mockIncrement = mock(async (_id: string, _action: string) => ({
	isBlocked: false,
	attemptsRemaining: 9,
}))

const mockGetCanonicalKycStatusForUser = mock(async () => 'not_started')
const mockFindLatestDiditSessionForUser = mock(async () => null)
const mockMaybeSingle = mock(async () => ({
	data: { status: 'pending', updated_at: '2026-08-25T00:00:00.000Z' },
	error: null,
}))

let mockSession: { user: { id: string } } | null = { user: { id: 'user-1' } }

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: ResponseInit) => {
			const headersMap = new Map<string, string>(
				Object.entries((init?.headers as Record<string, string>) ?? {}),
			)
			return {
				status: init?.status ?? 200,
				headers: {
					set: (k: string, v: string) => headersMap.set(k, v),
					get: (k: string) => headersMap.get(k) ?? null,
				},
				json: async () => JSON.parse(JSON.stringify(body)),
			}
		},
	},
}))

mock.module('~/lib/auth/rate-limiter', () => ({
	RateLimiter: class {
		increment = mockIncrement
	},
}))

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

mock.module('next-auth', () => ({
	getServerSession: async () => mockSession,
}))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))

mock.module('~/lib/kyc/enforcement-config', () => ({
	getKycEnforcementMode: () => 'disabled',
	getKycEnforcedActions: () => [],
}))

mock.module('~/lib/kyc/session-service', () => ({
	getCanonicalKycStatusForUser: mockGetCanonicalKycStatusForUser,
	findLatestDiditSessionForUser: mockFindLatestDiditSessionForUser,
}))

mock.module('@packages/lib/supabase', () => ({
	supabase: {
		from: () => ({
			select: () => ({
				eq: () => ({
					order: () => ({
						limit: () => ({
							maybeSingle: mockMaybeSingle,
						}),
					}),
				}),
			}),
		}),
	},
}))

const { GET } = await import('../app/api/kyc/status/route')

const makeRequest = (path = '/api/kyc/status'): NextRequest =>
	({
		nextUrl: { pathname: path },
		headers: {
			get: (key: string) => (key === 'x-forwarded-for' ? '127.0.0.1' : null),
		},
	}) as unknown as NextRequest

describe('GET /api/kyc/status', () => {
	beforeEach(() => {
		mockSession = { user: { id: 'user-1' } }
		mockIncrement.mockReset()
		mockGetCanonicalKycStatusForUser.mockReset()
		mockFindLatestDiditSessionForUser.mockReset()
		mockMaybeSingle.mockReset()
		mockGetCanonicalKycStatusForUser.mockImplementation(async () => 'not_started')
		mockFindLatestDiditSessionForUser.mockImplementation(async () => null)
		mockMaybeSingle.mockImplementation(async () => ({
			data: { status: 'pending', updated_at: '2026-08-25T00:00:00.000Z' },
			error: null,
		}))
	})

	test('returns 429 with the standard rate-limit body and skips KYC queries', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: true,
			attemptsRemaining: 0,
		}))

		const res = await GET(makeRequest())
		const body = await res.json()

		expect(res.status).toBe(429)
		expect(body).toEqual({ error: 'Too many requests. Please try again later.' })
		expect(res.headers.get('Retry-After')).toBe('1800')
		expect(mockGetCanonicalKycStatusForUser).not.toHaveBeenCalled()
		expect(mockFindLatestDiditSessionForUser).not.toHaveBeenCalled()
		expect(mockMaybeSingle).not.toHaveBeenCalled()
	})

	test('keys the limiter to the authenticated user', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))

		await GET(makeRequest())

		expect(mockIncrement).toHaveBeenCalledWith('user-1', '/api/kyc/status')
	})

	test('keys the limiter to the request IP when unauthenticated', async () => {
		mockSession = null
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))

		await GET(makeRequest())

		expect(mockIncrement).toHaveBeenCalledWith('127.0.0.1', '/api/kyc/status')
	})

	test('still returns 401 when not authenticated', async () => {
		mockSession = null
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))

		const res = await GET(makeRequest())
		const body = await res.json()

		expect(res.status).toBe(401)
		expect(body).toEqual({ error: 'Unauthorized' })
		expect(mockGetCanonicalKycStatusForUser).not.toHaveBeenCalled()
		expect(mockMaybeSingle).not.toHaveBeenCalled()
	})

	test('returns KYC status when the limiter allows the request', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))

		const res = await GET(makeRequest())
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body).toEqual({
			status: 'pending',
			canonicalStatus: 'not_started',
			updatedAt: '2026-08-25T00:00:00.000Z',
			hasActiveSession: false,
			enforcement: { mode: 'disabled', enforcedActions: [] },
		})
		expect(mockGetCanonicalKycStatusForUser).toHaveBeenCalledWith('user-1')
		expect(mockFindLatestDiditSessionForUser).toHaveBeenCalledWith('user-1')
		expect(mockMaybeSingle).toHaveBeenCalled()
	})
})

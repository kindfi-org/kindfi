import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockGetServerSession = mock()
const mockRateLimiterIncrement = mock()

mock.module('next/server', () => ({
	NextResponse: {
		json: (
			body: unknown,
			init?: {
				status?: number
			},
		) => ({
			status: init?.status ?? 200,
			headers: new Headers(),
			json: async () => body,
		}),
	},
}))

mock.module('next-auth', () => ({
	getServerSession: mockGetServerSession,
}))

mock.module('~/lib/auth/rate-limiter', () => ({
	RateLimiter: class {
		increment = mockRateLimiterIncrement
		reset = mock()
	},
}))

import { POST } from '../app/api/quests/progress/route'

describe('/api/quests/progress', () => {
	beforeEach(() => {
		mockGetServerSession.mockReset()
		mockRateLimiterIncrement.mockReset()
	})

	test('returns 401 when user is not authenticated', async () => {
		mockGetServerSession.mockResolvedValueOnce(null)

		const req = new Request('http://localhost/api/quests/progress', {
			method: 'POST',
			body: JSON.stringify({
				quest_id: 'quest-1',
				progress_value: 10,
			}),
		}) as any

		const response = await POST(req)
		const body = await response.json()

		expect(response.status).toBe(401)
		expect(body).toEqual({ error: 'Unauthorized' })
	})

	test('returns 429 when rate limit is exceeded', async () => {
		mockGetServerSession.mockResolvedValueOnce({
			user: {
				id: 'user-1',
				role: 'service',
			},
		})

		mockRateLimiterIncrement.mockResolvedValueOnce({
			isBlocked: true,
			attemptsRemaining: 0,
		})

		const req = new Request('http://localhost/api/quests/progress', {
			method: 'POST',
			body: JSON.stringify({
				quest_id: 'quest-1',
				progress_value: 10,
			}),
		}) as any

		const response = await POST(req)
		const body = await response.json()

		expect(mockRateLimiterIncrement).toHaveBeenCalledWith(
			'user-1',
			'quest_progress',
		)
		expect(response.status).toBe(429)
		expect(body).toEqual({ error: 'Too many requests' })
	})

	test('returns 403 when user role is not service or recorder', async () => {
		mockGetServerSession.mockResolvedValueOnce({
			user: {
				id: 'user-2',
				role: 'kinder',
			},
		})

		mockRateLimiterIncrement.mockResolvedValueOnce({
			isBlocked: false,
			attemptsRemaining: 5,
		})

		const req = new Request('http://localhost/api/quests/progress', {
			method: 'POST',
			body: JSON.stringify({
				quest_id: 'quest-1',
				progress_value: 10,
			}),
		}) as any

		const response = await POST(req)
		const body = await response.json()

		expect(response.status).toBe(403)
		expect(body).toEqual({ error: 'Forbidden' })
	})
})

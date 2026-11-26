import { describe, expect, mock, test } from 'bun:test'
import { normalizeUserId, resolveAuthenticatedUserId } from '../lib/kyc/resolved-user-id'

interface FetchUserResponse {
	ok: boolean
	status: number
	json: () => Promise<unknown>
}

function jsonResponse(body: unknown, status = 200): FetchUserResponse {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	}
}

function unparsableResponse(status = 200): FetchUserResponse {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => {
			throw new SyntaxError('Unexpected token < in JSON at position 0')
		},
	}
}

describe('normalizeUserId', () => {
	test('returns null for null, undefined and the empty string', () => {
		expect(normalizeUserId(null)).toBeNull()
		expect(normalizeUserId(undefined)).toBeNull()
		expect(normalizeUserId('')).toBeNull()
	})

	test('returns null for whitespace-only input', () => {
		expect(normalizeUserId('   ')).toBeNull()
		expect(normalizeUserId('\t\n')).toBeNull()
	})

	test('trims surrounding whitespace from a real id', () => {
		expect(normalizeUserId('  user-1  ')).toBe('user-1')
	})

	test('keeps an already-normalized id untouched', () => {
		expect(normalizeUserId('user-1')).toBe('user-1')
	})
})

describe('resolveAuthenticatedUserId', () => {
	test('returns a provided prop as provided and never fetches', async () => {
		const fetchUser = mock(async (_input: string) => jsonResponse({ user: { id: 'fetched' } }))

		const result = await resolveAuthenticatedUserId({ userId: 'prop-user', fetchUser })

		expect(result).toEqual({ status: 'provided', userId: 'prop-user' })
		expect(fetchUser).not.toHaveBeenCalled()
	})

	test('normalizes a provided prop before returning it', async () => {
		const fetchUser = mock(async (_input: string) => jsonResponse({ user: { id: 'fetched' } }))

		const result = await resolveAuthenticatedUserId({ userId: '  prop-user  ', fetchUser })

		expect(result).toEqual({ status: 'provided', userId: 'prop-user' })
		expect(fetchUser).not.toHaveBeenCalled()
	})

	test('never fetches when a provided prop is used across repeated calls', async () => {
		const fetchUser = mock(async (_input: string) => jsonResponse({ user: { id: 'fetched' } }))

		await resolveAuthenticatedUserId({ userId: 'prop-user', fetchUser })
		await resolveAuthenticatedUserId({ userId: 'prop-user', fetchUser })

		expect(fetchUser).not.toHaveBeenCalled()
	})

	test('resolves the authenticated id from user.id with a single fetch', async () => {
		const fetchUser = mock(async (input: string) => {
			expect(input).toBe('/api/auth/user')
			return jsonResponse({ user: { id: 'user-9' } })
		})

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'resolved', userId: 'user-9' })
		expect(fetchUser).toHaveBeenCalledTimes(1)
	})

	test('trims the resolved id', async () => {
		const fetchUser = mock(async () => jsonResponse({ user: { id: '  user-9  ' } }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'resolved', userId: 'user-9' })
	})

	test('defensively resolves a top-level id', async () => {
		const fetchUser = mock(async () => jsonResponse({ id: 'user-10' }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'resolved', userId: 'user-10' })
	})

	test('prefers user.id over a top-level id', async () => {
		const fetchUser = mock(async () => jsonResponse({ user: { id: 'nested' }, id: 'top' }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'resolved', userId: 'nested' })
	})

	test('reports http_500 when the endpoint fails', async () => {
		const fetchUser = mock(async () => jsonResponse({}, 500))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'http_500' })
	})

	test('reports http_401 when the caller is unauthenticated', async () => {
		const fetchUser = mock(async () => jsonResponse({}, 401))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'http_401' })
	})

	test('reports network_error when the fetchUser call rejects', async () => {
		const fetchUser = mock(async () => {
			throw new Error('connection refused')
		})

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'network_error' })
	})

	test('reports invalid_payload when the body is not JSON', async () => {
		const fetchUser = mock(async () => unparsableResponse(200))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'invalid_payload' })
	})

	test('reports missing_id when the user object is absent', async () => {
		const fetchUser = mock(async () => jsonResponse({}))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'missing_id' })
	})

	test('reports missing_id when user.id is an empty string', async () => {
		const fetchUser = mock(async () => jsonResponse({ user: { id: '' } }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'missing_id' })
	})

	test('reports missing_id when user.id is whitespace only', async () => {
		const fetchUser = mock(async () => jsonResponse({ user: { id: '   ' } }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'missing_id' })
	})

	test('reports missing_id when user.id is not a string', async () => {
		const fetchUser = mock(async () => jsonResponse({ user: { id: 42 } }))

		const result = await resolveAuthenticatedUserId({ fetchUser })

		expect(result).toEqual({ status: 'unavailable', reason: 'missing_id' })
	})

	test('never throws for any failure shape', async () => {
		const cases: Array<() => Promise<{ status: string }>> = [
			() => resolveAuthenticatedUserId({ fetchUser: async () => jsonResponse({}, 500) }),
			() => resolveAuthenticatedUserId({ fetchUser: async () => jsonResponse({}, 401) }),
			() =>
				resolveAuthenticatedUserId({
					fetchUser: async () => {
						throw new Error('boom')
					},
				}),
			() => resolveAuthenticatedUserId({ fetchUser: async () => unparsableResponse(200) }),
			() => resolveAuthenticatedUserId({ fetchUser: async () => jsonResponse({}) }),
			() =>
				resolveAuthenticatedUserId({
					fetchUser: async () => jsonResponse({ user: { id: '' } }),
				}),
			() =>
				resolveAuthenticatedUserId({
					fetchUser: async () => jsonResponse({ user: { id: 7 } }),
				}),
		]

		for (const run of cases) {
			const result = await run()
			expect(result.status).toBe('unavailable')
		}
	})
})

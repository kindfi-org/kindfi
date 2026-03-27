import { beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'

// ────────────────────────────────────────────────────────────────────────────
// Mutable mock handles — defined before mock.module so factories can close
// over them, and resettable in beforeEach
// ────────────────────────────────────────────────────────────────────────────

const mockGetUser = mock(async () => ({
	data: { user: { id: 'user-123', email: 'test@example.com' } },
	error: null,
}))

const mockSupabase = { auth: { getUser: mockGetUser } }
const mockCreateSupabaseServerClient = mock(async () => mockSupabase)

const mockGetServerSession = mock(async () => null as unknown)

// ────────────────────────────────────────────────────────────────────────────
// Module mocks — must be registered before the module under test is loaded.
// We use await import() below so these registrations are in place first.
// ────────────────────────────────────────────────────────────────────────────

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: ResponseInit) => ({
			status: init?.status ?? 200,
			json: async () => JSON.parse(JSON.stringify(body)),
		}),
	},
}))

mock.module('@packages/lib/supabase-server', () => ({
	createSupabaseServerClient: mockCreateSupabaseServerClient,
}))

mock.module('next-auth', () => ({
	getServerSession: mockGetServerSession,
}))

mock.module('~/lib/auth/auth-options', () => ({
	nextAuthOption: {},
}))

// Dynamic import ensures mocks are fully registered before the module loads
const { requireSession, respond, error } = await import('../lib/api-helpers')

// ────────────────────────────────────────────────────────────────────────────
// requireSession
// ────────────────────────────────────────────────────────────────────────────

describe('requireSession', () => {
	describe('supabase provider (default)', () => {
		beforeEach(() => {
			mockGetUser.mockReset()
			mockGetUser.mockResolvedValue({
				data: { user: { id: 'user-123', email: 'test@example.com' } },
				error: null,
			})
		})

		test('returns user when authenticated', async () => {
			const result = await requireSession()

			expect(result.error).toBeNull()
			expect(result.user).toMatchObject({
				id: 'user-123',
				email: 'test@example.com',
			})
		})

		test('returns 401 NextResponse when user is null', async () => {
			mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

			const result = await requireSession()

			expect(result.user).toBeNull()
			expect(result.error).not.toBeNull()

			const json = await result.error!.json()
			expect(result.error!.status).toBe(401)
			expect(json.success).toBe(false)
			expect(json.error.code).toBe('UNAUTHORIZED')
			expect(json.error.message).toBe('Unauthorized')
		})

		test('returns 401 when getUser returns an auth error', async () => {
			mockGetUser.mockResolvedValueOnce({
				data: { user: null },
				error: { message: 'JWT expired' },
			})

			const result = await requireSession()

			expect(result.user).toBeNull()
			const json = await result.error!.json()
			expect(result.error!.status).toBe(401)
			expect(json.error.code).toBe('UNAUTHORIZED')
		})

		test('explicit provider: "supabase" behaves identically to default', async () => {
			const result = await requireSession({ provider: 'supabase' })

			expect(result.error).toBeNull()
			expect(result.user?.id).toBe('user-123')
		})
	})

	describe('nextauth provider', () => {
		beforeEach(() => {
			mockGetServerSession.mockReset()
			mockGetServerSession.mockResolvedValue(null)
		})

		test('returns user when session exists', async () => {
			mockGetServerSession.mockResolvedValueOnce({
				user: { id: 'nextauth-user-456', email: 'nextauth@example.com' },
			})

			const result = await requireSession({ provider: 'nextauth' })

			expect(result.error).toBeNull()
			expect(result.user).toMatchObject({
				id: 'nextauth-user-456',
				email: 'nextauth@example.com',
			})
		})

		test('returns 401 when session is null', async () => {
			mockGetServerSession.mockResolvedValueOnce(null)

			const result = await requireSession({ provider: 'nextauth' })

			expect(result.user).toBeNull()
			const json = await result.error!.json()
			expect(result.error!.status).toBe(401)
			expect(json.success).toBe(false)
			expect(json.error.code).toBe('UNAUTHORIZED')
		})

		test('returns 401 when session has no user id', async () => {
			mockGetServerSession.mockResolvedValueOnce({
				user: { email: 'no-id@example.com' },
			})

			const result = await requireSession({ provider: 'nextauth' })

			expect(result.user).toBeNull()
			expect(result.error!.status).toBe(401)
		})
	})
})

// ────────────────────────────────────────────────────────────────────────────
// respond
// ────────────────────────────────────────────────────────────────────────────

describe('respond', () => {
	test('returns 200 with success shape by default', async () => {
		const res = respond({ id: 'abc' })
		const json = await res.json()

		expect(res.status).toBe(200)
		expect(json.success).toBe(true)
		expect(json.data).toEqual({ id: 'abc' })
		expect(json.pagination).toBeUndefined()
	})

	test('respects custom status code', async () => {
		const res = respond({ id: 'new' }, { status: 201 })

		expect(res.status).toBe(201)
		const json = await res.json()
		expect(json.success).toBe(true)
	})

	test('includes pagination when provided', async () => {
		const pagination = { limit: 10, offset: 20, total: 100 }
		const res = respond(['item1', 'item2'], { pagination })
		const json = await res.json()

		expect(json.pagination).toEqual(pagination)
		expect(json.data).toEqual(['item1', 'item2'])
	})

	test('handles null data', async () => {
		const res = respond(null)
		const json = await res.json()

		expect(json.success).toBe(true)
		expect(json.data).toBeNull()
	})

	test('handles array data', async () => {
		const items = [{ id: 1 }, { id: 2 }]
		const res = respond(items)
		const json = await res.json()

		expect(json.data).toEqual(items)
	})
})

// ────────────────────────────────────────────────────────────────────────────
// error
// ────────────────────────────────────────────────────────────────────────────

describe('error', () => {
	test('returns 500 with INTERNAL_ERROR code by default', async () => {
		const res = error('Something went wrong')
		const json = await res.json()

		expect(res.status).toBe(500)
		expect(json.success).toBe(false)
		expect(json.error.code).toBe('INTERNAL_ERROR')
		expect(json.error.message).toBe('Something went wrong')
	})

	test('respects custom status and code', async () => {
		const res = error('Bad input', { status: 400, code: 'VALIDATION_ERROR' })
		const json = await res.json()

		expect(res.status).toBe(400)
		expect(json.error.code).toBe('VALIDATION_ERROR')
		expect(json.error.message).toBe('Bad input')
	})

	test('includes details when provided', async () => {
		const details = { field: 'email', issue: 'required' }
		const res = error('Validation failed', { status: 400, details })
		const json = await res.json()

		expect(json.error.details).toEqual(details)
	})

	test('omits details key when not provided', async () => {
		const res = error('Oops', { status: 500 })
		const json = await res.json()

		expect(Object.hasOwn(json.error, 'details')).toBe(false)
	})

	test('logs when log: true', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		error('DB failed', { status: 500, code: 'DB_ERROR', log: true })

		expect(errorSpy).toHaveBeenCalledTimes(1)
		const [logData] = errorSpy.mock.calls[0]
		expect(logData.eventType).toBe('DB_ERROR')
		expect(logData.message).toBe('DB failed')

		errorSpy.mockRestore()
	})

	test('logs Error instance with message and stack', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		const err = new Error('Connection refused')
		error('DB failed', { status: 500, code: 'DB_ERROR', log: err })

		expect(errorSpy).toHaveBeenCalledTimes(1)
		const [logData] = errorSpy.mock.calls[0]
		expect(logData.errorMessage).toBe('Connection refused')
		expect(logData.stack).toBeDefined()

		errorSpy.mockRestore()
	})

	test('logs arbitrary objects (e.g. Supabase errors)', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		const supabaseError = { message: 'duplicate key', code: '23505' }
		error('Insert failed', {
			status: 500,
			code: 'INSERT_FAILED',
			log: supabaseError,
		})

		expect(errorSpy).toHaveBeenCalledTimes(1)
		const [logData] = errorSpy.mock.calls[0]
		expect(logData.errorDetail).toEqual(supabaseError)

		errorSpy.mockRestore()
	})

	test('does not log when log is not set', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		error('Silent error', { status: 400 })

		expect(errorSpy).not.toHaveBeenCalled()
		errorSpy.mockRestore()
	})

	test('does not log when log: false', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		error('Silent error', { status: 400, log: false })

		expect(errorSpy).not.toHaveBeenCalled()
		errorSpy.mockRestore()
	})

	test('uses code as log eventType', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		error('Not found', { status: 404, code: 'NOT_FOUND', log: true })

		const [logData] = errorSpy.mock.calls[0]
		expect(logData.eventType).toBe('NOT_FOUND')

		errorSpy.mockRestore()
	})

	test('falls back to API_ERROR eventType when no code given', async () => {
		const { Logger } = await import('../lib/logger')
		const errorSpy = spyOn(Logger.prototype, 'error').mockImplementation(
			() => {},
		)

		error('Unknown', { log: true })

		const [logData] = errorSpy.mock.calls[0]
		expect(logData.eventType).toBe('API_ERROR')

		errorSpy.mockRestore()
	})
})

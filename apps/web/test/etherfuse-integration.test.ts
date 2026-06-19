import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'

// ===== Environment =====
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.ETHERFUSE_API_KEY = 'test-api-key'
process.env.ETHERFUSE_BASE_URL = 'https://api.sand.etherfuse.com'
process.env.ETHERFUSE_CUSTOMER_ID = 'test-customer-id'

// ===== Mutable mock state (configured per test in beforeEach) =====
let mockDbResults: Record<string, any> = {}
let mockEtherfuseQuoteResponse: any = null
let mockEtherfuseOrderResponse: any = null
let mockFetchCalls: Array<{ url: string; options: RequestInit }> = []

// ===== Module mocks =====

// Main Supabase client — chainable mock driven by mockDbResults
function createChain(result: any) {
	const chain: any = {}
	for (const m of [
		'select',
		'insert',
		'update',
		'delete',
		'eq',
		'neq',
		'in',
		'not',
		'order',
		'limit',
		'range',
		'is',
		'maybeSingle',
	]) {
		chain[m] = () => createChain(result)
	}
	chain.single = () => Promise.resolve(result)
	chain.then = (res: any, rej?: any) => Promise.resolve(result).then(res, rej)
	chain.catch = (fn: any) => Promise.resolve(result).catch(fn)
	return chain
}

mock.module('@packages/lib/supabase', () => ({
	supabase: {
		from: (table: string) => createChain(mockDbResults[table] ?? { data: null, error: null }),
		auth: {
			getUser: () =>
				Promise.resolve({
					data: { user: { id: 'test-user' } },
					error: null,
				}),
		},
	},
}))

// next/server — minimal mock providing NextResponse.json and no-op after()
mock.module('next/server', () => ({
	NextResponse: {
		json: (body: any, init?: any) =>
			new Response(JSON.stringify(body), {
				status: init?.status ?? 200,
				headers: { 'Content-Type': 'application/json' },
			}),
	},
	after: () => {},
}))

// next-auth
mock.module('next-auth', () => ({
	getServerSession: () => Promise.resolve(null),
}))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))

// Validation
const mockValidateReq = mock(() => ({ success: true, data: {} }))
mock.module('~/lib/utils/validation', () => ({
	validateRequest: mockValidateReq,
}))

// Audit logger
const mockAuditLog = mock(() => Promise.resolve())
mock.module('~/lib/services/audit-logger', () => ({
	AuditLogger: class {
		static maskAddress = (addr: string) => `${addr.slice(0, 4)}***${addr.slice(-4)}`
		log = mockAuditLog
	},
}))

// Schemas - import actual schemas to preserve methods for validation tests
import {
	etherfuseDepositRequestSchema,
	etherfuseWithdrawalRequestSchema,
} from '../lib/schemas/etherfuse.schemas'

mock.module('~/lib/schemas/etherfuse.schemas', () => ({
	etherfuseDepositRequestSchema,
	etherfuseWithdrawalRequestSchema,
}))

// Global fetch mock
const mockFetch = mock((url: string, options?: RequestInit) => {
	mockFetchCalls.push({ url, options: options || {} })

	if (url.includes('/ramp/quote')) {
		if (mockEtherfuseQuoteResponse) {
			return Promise.resolve(
				new Response(JSON.stringify(mockEtherfuseQuoteResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			)
		}
		return Promise.resolve(new Response(JSON.stringify({ error: 'Quote failed' }), { status: 400 }))
	}

	if (url.includes('/ramp/order')) {
		if (mockEtherfuseOrderResponse) {
			return Promise.resolve(
				new Response(JSON.stringify(mockEtherfuseOrderResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			)
		}
		return Promise.resolve(new Response(JSON.stringify({ error: 'Order failed' }), { status: 400 }))
	}

	return Promise.resolve(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }))
})

// Add required fetch properties
Object.assign(mockFetch, {
	preconnect: () => {},
})

// @ts-expect-error - Mock fetch doesn't need all properties
global.fetch = mockFetch

// ===== Helpers =====

function createRequest(body: any) {
	const request = new Request('http://localhost/api/test', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' },
	})
	// Add nextUrl property to satisfy rate limiting middleware
	;(request as any).nextUrl = { pathname: '/api/etherfuse/on-ramp' }
	return request
}

// =============================================================================
// POST /api/etherfuse/on-ramp
// =============================================================================

describe('Etherfuse on-ramp integration', () => {
	let infoSpy: ReturnType<typeof spyOn>
	let errorSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditLog.mockClear()
		mockFetchCalls = []
		mockValidateReq.mockImplementation(() => ({
			success: true,
			data: {
				userId: 'test-user',
				amount: '100',
				currency: 'MXN',
				targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
				walletAddress: 'GABCD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
			},
		}))
		mockEtherfuseQuoteResponse = {
			quoteId: '123e4567-e89b-12d3-a456-426614174000',
			sourceAmount: '100',
			targetAmount: '95.50',
			sourceAsset: 'MXN',
			targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
		}
		mockEtherfuseOrderResponse = {
			orderId: '223e4567-e89b-12d3-a456-426614174001',
			quoteId: '123e4567-e89b-12d3-a456-426614174000',
			status: 'created',
			statusPage: 'https://sandbox.etherfuse.com/ramp/order/223e4567-e89b-12d3-a456-426614174001',
		}
		mockDbResults = {
			transactions: { data: { id: 'tx-123' }, error: null },
		}
	})

	afterEach(() => {
		infoSpy.mockRestore()
		errorSpy.mockRestore()
	})

	test('successfully creates on-ramp order', async () => {
		const { POST } = await import('../app/api/etherfuse/on-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(201)
		const body = await res.json()
		expect(body.success).toBe(true)
		expect(body.quoteId).toBe('123e4567-e89b-12d3-a456-426614174000')
		expect(body.orderId).toBe('223e4567-e89b-12d3-a456-426614174001')
		expect(body.statusPage).toContain('sandbox.etherfuse.com')

		// Verify fetch calls (may be more than 2 due to rate limiting checks)
		expect(mockFetchCalls.length).toBeGreaterThanOrEqual(2)
		expect(mockFetchCalls.some((call) => call.url.includes('/ramp/quote'))).toBe(true)
		expect(mockFetchCalls.some((call) => call.url.includes('/ramp/order'))).toBe(true)

		// Verify audit logging
		expect(mockAuditLog).toHaveBeenCalled()
	})

	test('emits validation_error audit log on invalid input', async () => {
		mockValidateReq.mockReturnValueOnce({
			success: false,
			response: new Response(JSON.stringify({ error: 'Invalid' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}),
		} as any)

		const { POST } = await import('../app/api/etherfuse/on-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(400)
		expect(mockAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'etherfuse.on_ramp',
				status: 'validation_error',
			}),
		)
	})

	test('handles Etherfuse quote API failure', async () => {
		mockEtherfuseQuoteResponse = null

		const { POST } = await import('../app/api/etherfuse/on-ramp/route')
		const res = await POST(createRequest({}) as any)

		// The API returns 400 when Etherfuse quote fails
		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body.error).toContain('Failed to create quote')
	})

	test('handles unauthorized user', async () => {
		mock.module('@packages/lib/supabase', () => ({
			supabase: {
				from: () => createChain({ data: null, error: null }),
				auth: {
					getUser: () =>
						Promise.resolve({
							data: { user: null },
							error: { message: 'Unauthorized' },
						}),
				},
			},
		}))

		const { POST } = await import('../app/api/etherfuse/on-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(403)
	})
})

// =============================================================================
// POST /api/etherfuse/off-ramp
// =============================================================================

describe('Etherfuse off-ramp integration', () => {
	let infoSpy: ReturnType<typeof spyOn>
	let errorSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditLog.mockClear()
		mockFetchCalls = []
		mockValidateReq.mockImplementation(() => ({
			success: true,
			data: {
				userId: 'test-user',
				amount: '50',
				sourceAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
				currency: 'MXN',
				bankAccountId: 'bank-acc-123',
			},
		}))
		mockEtherfuseQuoteResponse = {
			quoteId: '323e4567-e89b-12d3-a456-426614174002',
			sourceAmount: '50',
			targetAmount: '47.75',
			sourceAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
			targetAsset: 'MXN',
		}
		mockEtherfuseOrderResponse = {
			orderId: '423e4567-e89b-12d3-a456-426614174003',
			quoteId: '323e4567-e89b-12d3-a456-426614174002',
			status: 'created',
			burnTransaction: 'mock-burn-tx-xdr',
			statusPage: 'https://sandbox.etherfuse.com/ramp/order/423e4567-e89b-12d3-a456-426614174003',
		}
		mockDbResults = {
			transactions: { data: { id: 'tx-456' }, error: null },
		}
		// Reset auth mock for off-ramp tests
		mock.module('@packages/lib/supabase', () => ({
			supabase: {
				from: (table: string) => createChain(mockDbResults[table] ?? { data: null, error: null }),
				auth: {
					getUser: () =>
						Promise.resolve({
							data: { user: { id: 'test-user' } },
							error: null,
						}),
				},
			},
		}))
	})

	afterEach(() => {
		infoSpy.mockRestore()
		errorSpy.mockRestore()
	})

	test('successfully creates off-ramp order', async () => {
		const { POST } = await import('../app/api/etherfuse/off-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(201)
		const body = await res.json()
		expect(body.success).toBe(true)
		expect(body.quoteId).toBe('323e4567-e89b-12d3-a456-426614174002')
		expect(body.orderId).toBe('423e4567-e89b-12d3-a456-426614174003')
		expect(body.burnTransaction).toBe('mock-burn-tx-xdr')
		expect(body.statusPage).toContain('sandbox.etherfuse.com')

		// Verify fetch calls (may be more than 2 due to rate limiting checks)
		expect(mockFetchCalls.length).toBeGreaterThanOrEqual(2)
		expect(mockFetchCalls.some((call) => call.url.includes('/ramp/quote'))).toBe(true)
		expect(mockFetchCalls.some((call) => call.url.includes('/ramp/order'))).toBe(true)

		// Verify audit logging
		expect(mockAuditLog).toHaveBeenCalled()
	})

	test('emits validation_error audit log on invalid input', async () => {
		mockValidateReq.mockReturnValueOnce({
			success: false,
			response: new Response(JSON.stringify({ error: 'Invalid' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}),
		} as any)

		const { POST } = await import('../app/api/etherfuse/off-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(400)
		expect(mockAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				operation: 'etherfuse.off_ramp',
				status: 'validation_error',
			}),
		)
	})

	test('handles Etherfuse order API failure', async () => {
		mockEtherfuseOrderResponse = null

		const { POST } = await import('../app/api/etherfuse/off-ramp/route')
		const res = await POST(createRequest({}) as any)

		// The API returns 400 when Etherfuse order fails
		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body.error).toContain('Failed to create order')
	})

	test('includes burn transaction in response', async () => {
		const { POST } = await import('../app/api/etherfuse/off-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(201)
		const body = await res.json()
		expect(body.burnTransaction).toBe('mock-burn-tx-xdr')
	})
})

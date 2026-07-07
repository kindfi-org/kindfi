import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'

// ===== Environment =====
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.ETHERFUSE_API_KEY = 'test-api-key'
process.env.ETHERFUSE_BASE_URL = 'https://api.sand.etherfuse.com'
process.env.ETHERFUSE_CUSTOMER_ID = 'test-customer-id'
process.env.ETHERFUSE_BANK_ACCOUNT_ID = 'test-bank-account-id'
process.env.ETHERFUSE_CRYPTO_WALLET_ID = 'test-crypto-wallet-id'

const VALID_G_ADDRESS = 'GDUKMGUGD3V6VXTU2RLAUM7A2FABLMHCPWTMDHKP7HHJ6FCZKEY4PVWL'
const VALID_BANK_ACCOUNT_ID = 'd86c8445-359c-421d-a66d-4e08f916fcc9'
const VALID_CUSTOMER_ID = '935c6992-90f1-4ec3-99d2-e049de3b4ed5'
const VALID_WALLET_ID = '5915dfc1-8995-4465-9c04-76470298b8b3'

// ===== Mutable mock state (configured per test in beforeEach) =====
let mockDbResults: Record<string, any> = {}
let mockEtherfuseQuoteResponse: any = null
let mockEtherfuseOrderResponse: any = null
let mockFetchCalls: Array<{ url: string; options: RequestInit }> = []
let mockSession: { user: { id: string } } | null = { user: { id: 'test-user' } }

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
	getServerSession: () => Promise.resolve(mockSession),
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

	if (url.includes('/ramp/bank-accounts')) {
		return Promise.resolve(
			new Response(
				JSON.stringify({
					items: [{ bankAccountId: VALID_BANK_ACCOUNT_ID, status: 'active', compliant: true }],
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		)
	}

	if (url.includes('/ramp/customer/') && url.includes('/bank-accounts')) {
		return Promise.resolve(
			new Response(
				JSON.stringify({
					items: [
						{
							bankAccountId: VALID_BANK_ACCOUNT_ID,
							status: 'active',
							compliant: true,
							customerId: VALID_CUSTOMER_ID,
						},
					],
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		)
	}

	if (url.includes('/ramp/customer/') && url.includes('/kyc')) {
		return Promise.resolve(
			new Response(JSON.stringify({ status: 'approved' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		)
	}

	if (url.includes('/ramp/customer/') && url.includes('/wallets')) {
		return Promise.resolve(
			new Response(
				JSON.stringify({
					items: [
						{
							walletId: VALID_WALLET_ID,
							publicKey: VALID_G_ADDRESS,
							customerId: VALID_CUSTOMER_ID,
							blockchain: 'stellar',
						},
					],
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		)
	}

	if (url.includes('/ramp/wallets')) {
		return Promise.resolve(
			new Response(
				JSON.stringify({
					items: [
						{
							walletId: VALID_WALLET_ID,
							publicKey: VALID_G_ADDRESS,
							customerId: VALID_CUSTOMER_ID,
							blockchain: 'stellar',
						},
					],
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		)
	}

	if (url.includes('/ramp/wallet/')) {
		return Promise.resolve(
			new Response(
				JSON.stringify({
					walletId: VALID_WALLET_ID,
					publicKey: VALID_G_ADDRESS,
					customerId: VALID_CUSTOMER_ID,
					kycStatus: 'approved',
					blockchain: 'stellar',
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		)
	}

	if (url.includes('/ramp/wallet')) {
		return Promise.resolve(
			new Response(JSON.stringify({ walletId: VALID_WALLET_ID }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		)
	}

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
		mockSession = { user: { id: 'test-user' } }
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
				targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
				walletAddress: VALID_G_ADDRESS,
				etherfuseCustomerId: VALID_CUSTOMER_ID,
				etherfuseBankAccountId: VALID_BANK_ACCOUNT_ID,
			},
		}))
		mockEtherfuseQuoteResponse = {
			quoteId: '123e4567-e89b-12d3-a456-426614174000',
			sourceAmount: '100',
			targetAmount: '95.50',
			sourceAsset: 'MXN',
			targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
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
		expect(body.error).toContain('Failed to create on-ramp quote')
	})

	test('handles unauthorized user', async () => {
		mockSession = null

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
		mockSession = { user: { id: 'test-user' } }
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditLog.mockClear()
		mockFetchCalls = []
		mockValidateReq.mockImplementation(() => ({
			success: true,
			data: {
				userId: 'test-user',
				amount: '50',
				sourceAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
				currency: 'MXN',
				bankAccountId: VALID_BANK_ACCOUNT_ID,
				walletAddress: VALID_G_ADDRESS,
				etherfuseCustomerId: VALID_CUSTOMER_ID,
			},
		}))
		mockEtherfuseQuoteResponse = {
			quoteId: '323e4567-e89b-12d3-a456-426614174002',
			sourceAmount: '50',
			targetAmount: '47.75',
			sourceAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
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
		expect(body.error).toContain('Failed to create off-ramp order')
	})

	test('includes burn transaction in response', async () => {
		const { POST } = await import('../app/api/etherfuse/off-ramp/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(201)
		const body = await res.json()
		expect(body.burnTransaction).toBe('mock-burn-tx-xdr')
	})
})

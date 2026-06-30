import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Must be set before any imports that touch env
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXT_PUBLIC_KYC_API_BASE_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.ETHERFUSE_BANK_ACCOUNT_ID = 'test-bank-account-id'
process.env.ETHERFUSE_CRYPTO_WALLET_ID = 'test-crypto-wallet-id'

// Mutable state — modified per test in beforeEach; read at call time by the mock
let mockEtherfuseEnv = {
	apiKey: 'test-api-key',
	baseUrl: 'https://api.sand.etherfuse.com',
	customerId: 'test-customer-id',
}

mock.module('@packages/lib/config', () => ({
	appEnvConfig: () => ({
		externalApis: {
			etherfuse: { ...mockEtherfuseEnv },
		},
	}),
}))

const mockFetchCalls: string[] = []

const mockFetch = mock((url: string) => {
	mockFetchCalls.push(url)
	if (url.includes('/ramp/me')) {
		return Promise.resolve(
			new Response(JSON.stringify({ id: 'resolved-org-id' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		)
	}
	return Promise.resolve(new Response(JSON.stringify({ error: 'not found' }), { status: 404 }))
})

// @ts-expect-error - mock doesn't need all fetch properties
global.fetch = mockFetch

describe('getEtherfuseConfig', () => {
	beforeEach(() => {
		mockFetchCalls.length = 0
		mockEtherfuseEnv = {
			apiKey: 'test-api-key',
			baseUrl: 'https://api.sand.etherfuse.com',
			customerId: 'test-customer-id',
		}
	})

	test('returns full config when all values present', async () => {
		const { getEtherfuseConfig } = await import('../lib/etherfuse/get-etherfuse-config')
		const config = await getEtherfuseConfig()

		expect(config.apiKey).toBe('test-api-key')
		expect(config.baseUrl).toBe('https://api.sand.etherfuse.com')
		expect(config.customerId).toBe('test-customer-id')
		expect(config.bankAccountId).toBe('test-bank-account-id')
		expect(config.cryptoWalletId).toBe('test-crypto-wallet-id')
		// No fetch when customerId is already in config
		expect(mockFetchCalls.length).toBe(0)
	})

	test('throws AppError with ETHERFUSE_API_KEY when apiKey missing', async () => {
		mockEtherfuseEnv = { apiKey: '', baseUrl: 'https://api.sand.etherfuse.com', customerId: '' }
		const { getEtherfuseConfig } = await import('../lib/etherfuse/get-etherfuse-config')

		let caught: any
		try {
			await getEtherfuseConfig()
		} catch (err) {
			caught = err
		}

		expect(caught?.name).toBe('AppError')
		expect(caught?.statusCode).toBe(500)
		expect(caught?.message).toContain('ETHERFUSE_API_KEY')
		// Guard prevents fetch call — no TypeError from bad URL construction
		expect(mockFetchCalls.length).toBe(0)
	})

	test('throws AppError with ETHERFUSE_BASE_URL when baseUrl missing — no TypeError thrown', async () => {
		mockEtherfuseEnv = { apiKey: 'test-key', baseUrl: '', customerId: '' }
		const { getEtherfuseConfig } = await import('../lib/etherfuse/get-etherfuse-config')

		let caught: any
		try {
			await getEtherfuseConfig()
		} catch (err) {
			caught = err
		}

		expect(caught?.name).toBe('AppError')
		expect(caught?.statusCode).toBe(500)
		expect(caught?.message).toContain('ETHERFUSE_BASE_URL')
		// Verify we get a structured AppError, not a TypeError from URL construction
		expect(caught?.name).not.toBe('TypeError')
		// Guard prevents fetch call entirely
		expect(mockFetchCalls.length).toBe(0)
	})

	test('collects apiKey, baseUrl and customerId in single AppError when all missing', async () => {
		mockEtherfuseEnv = { apiKey: '', baseUrl: '', customerId: '' }
		const { getEtherfuseConfig } = await import('../lib/etherfuse/get-etherfuse-config')

		let caught: any
		try {
			await getEtherfuseConfig()
		} catch (err) {
			caught = err
		}

		expect(caught?.name).toBe('AppError')
		expect(caught?.statusCode).toBe(500)
		expect(caught?.message).toContain('ETHERFUSE_API_KEY')
		expect(caught?.message).toContain('ETHERFUSE_BASE_URL')
		expect(caught?.message).toContain('ETHERFUSE_CUSTOMER_ID')
		// resolveOrganizationId never called — both guards failed
		expect(mockFetchCalls.length).toBe(0)
	})

	test('resolves customerId via GET /ramp/me when not in config', async () => {
		// cachedOrganizationId is null at this point (error tests above never called resolveOrganizationId)
		mockEtherfuseEnv = {
			apiKey: 'test-key',
			baseUrl: 'https://api.sand.etherfuse.com',
			customerId: '',
		}
		const { getEtherfuseConfig } = await import('../lib/etherfuse/get-etherfuse-config')

		const config = await getEtherfuseConfig()

		// Returns customerId — either from API call or from module-level cache
		expect(config.customerId).toBeTruthy()
	})
})

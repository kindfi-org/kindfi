import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'
import type {
	PulseQuoteResult,
	PulseQuoteSuccess,
	ReadPulseQuoteParams,
} from '~/lib/stellar/reflector-pulse'

// ─── Mutable mock handles ────────────────────────────────────────────────────

const mockIncrement = mock(async (_id: string, _action: string) => ({
	isBlocked: false,
	attemptsRemaining: 29,
}))

const mockRouteReadPulseQuote = mock(
	async (_params: ReadPulseQuoteParams): Promise<PulseQuoteResult> => ({
		status: 'missing',
	}),
)

// ─── Module mocks (registered before dynamic imports) ────────────────────────

mock.module('server-only', () => ({}))

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: ResponseInit) => ({
			status: init?.status ?? 200,
			headers: new Headers(init?.headers),
			json: async () => JSON.parse(JSON.stringify(body)),
		}),
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

mock.module('~/lib/stellar/reflector-pulse', () => ({
	readPulseQuote: mockRouteReadPulseQuote,
}))

const { createPricesGetHandler, PRICE_CACHE_CONTROL_HEADER, PRICE_CACHE_TTL_MS } = await import(
	'../lib/prices/prices-route-handler'
)
const { GET } = await import('../app/api/prices/route')

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FRESH_XLM_QUOTE: PulseQuoteSuccess = {
	price: 0.1234,
	decimals: 14,
	timestamp: 1_763_700_000,
	source: 'reflector-pulse',
	feedContractId: 'CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP',
}

const FRESH_USDC_QUOTE: PulseQuoteSuccess = {
	price: 1,
	decimals: 14,
	timestamp: 1_763_700_000,
	source: 'reflector-pulse',
	feedContractId: 'CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP',
}

function makeRequest(query = 'asset=XLM', ip = '203.0.113.10'): NextRequest {
	const url = new URL(`http://localhost:3000/api/prices${query ? `?${query}` : ''}`)
	return {
		nextUrl: url,
		headers: new Headers(ip ? { 'x-forwarded-for': ip } : {}),
	} as unknown as NextRequest
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/prices handler', () => {
	test('returns 200 with quote payload and 60s CDN Cache-Control for a fresh XLM quote', async () => {
		const readQuote = mock(async (_params: ReadPulseQuoteParams) => FRESH_XLM_QUOTE)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const res = await handler(makeRequest('asset=XLM'))
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body).toEqual(FRESH_XLM_QUOTE)
		expect(body.status).toBeUndefined()
		expect(res.headers.get('Cache-Control')).toBe(PRICE_CACHE_CONTROL_HEADER)
		expect(readQuote).toHaveBeenCalledTimes(1)
		expect(readQuote).toHaveBeenCalledWith({ network: 'testnet', asset: 'XLM' })
	})

	test('returns 200 for a fresh USDC quote using the server-configured network', async () => {
		const readQuote = mock(async (_params: ReadPulseQuoteParams) => FRESH_USDC_QUOTE)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'mainnet',
		})

		const res = await handler(makeRequest('asset=USDC'))
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body).toEqual(FRESH_USDC_QUOTE)
		expect(readQuote).toHaveBeenCalledWith({ network: 'mainnet', asset: 'USDC' })
	})

	test('fails closed with 503 { status: "unavailable" } when quote is stale', async () => {
		const readQuote = mock(async (): Promise<PulseQuoteResult> => ({ status: 'stale' }))
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const res = await handler(makeRequest('asset=XLM'))
		const body = await res.json()

		expect(res.status).toBe(503)
		expect(body).toEqual({ status: 'unavailable' })
		expect(body.price).toBeUndefined()
		expect(res.headers.get('Cache-Control')).toBe('no-store')
	})

	test('fails closed with 503 { status: "unavailable" } when quote is missing', async () => {
		const readQuote = mock(async (): Promise<PulseQuoteResult> => ({ status: 'missing' }))
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const res = await handler(makeRequest('asset=XLM'))
		const body = await res.json()

		expect(res.status).toBe(503)
		expect(body).toEqual({ status: 'unavailable' })
		expect(body.price).toBeUndefined()
		expect(res.headers.get('Cache-Control')).toBe('no-store')
	})

	test('fails closed with 503 when readPulseQuote throws an RPC error', async () => {
		const readQuote = mock(async (): Promise<PulseQuoteResult> => {
			throw new Error('Soroban RPC timeout')
		})
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const res = await handler(makeRequest('asset=XLM'))
		const body = await res.json()

		expect(res.status).toBe(503)
		expect(body).toEqual({ status: 'unavailable' })
		expect(res.headers.get('Cache-Control')).toBe('no-store')
	})

	test('recovers on retry after a synchronous throw from readPulseQuote', async () => {
		let callCount = 0
		const readQuote = mock((_params: ReadPulseQuoteParams): Promise<PulseQuoteResult> => {
			callCount += 1
			if (callCount === 1) {
				throw new Error('Synchronous client initialization error')
			}
			return Promise.resolve(FRESH_XLM_QUOTE)
		})
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const first = await handler(makeRequest('asset=XLM'))
		const second = await handler(makeRequest('asset=XLM'))

		expect(first.status).toBe(503)
		expect(await first.json()).toEqual({ status: 'unavailable' })
		expect(second.status).toBe(200)
		expect(await second.json()).toEqual(FRESH_XLM_QUOTE)
		expect(readQuote).toHaveBeenCalledTimes(2)
	})

	test('fails closed with 503 if the oracle returns a zero price', async () => {
		const readQuote = mock(
			async (): Promise<PulseQuoteResult> => ({
				...FRESH_XLM_QUOTE,
				price: 0,
			}),
		)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const res = await handler(makeRequest('asset=XLM'))
		const body = await res.json()

		expect(res.status).toBe(503)
		expect(body).toEqual({ status: 'unavailable' })
	})

	test('serves cached quote within the 60s window without calling the client again', async () => {
		let currentTime = 1_700_000_000_000
		const readQuote = mock(async () => FRESH_XLM_QUOTE)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
			now: () => currentTime,
		})

		const first = await handler(makeRequest('asset=XLM'))
		currentTime += 30_000
		const second = await handler(makeRequest('asset=XLM'))

		expect(first.status).toBe(200)
		expect(second.status).toBe(200)
		expect(await second.json()).toEqual(FRESH_XLM_QUOTE)
		expect(readQuote).toHaveBeenCalledTimes(1)
	})

	test('refreshes quote after the 60s cache window expires', async () => {
		let currentTime = 1_700_000_000_000
		const updatedQuote: PulseQuoteSuccess = {
			...FRESH_XLM_QUOTE,
			price: 0.13,
			timestamp: FRESH_XLM_QUOTE.timestamp + 300,
		}
		const readQuote = mock(async () =>
			readQuote.mock.calls.length === 1 ? FRESH_XLM_QUOTE : updatedQuote,
		)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
			now: () => currentTime,
		})

		const first = await handler(makeRequest('asset=XLM'))
		currentTime += PRICE_CACHE_TTL_MS
		const second = await handler(makeRequest('asset=XLM'))

		expect(await first.json()).toEqual(FRESH_XLM_QUOTE)
		expect(await second.json()).toEqual(updatedQuote)
		expect(readQuote).toHaveBeenCalledTimes(2)
	})

	test('coalesces a burst of concurrent requests into a single client call', async () => {
		let resolveQuote!: (value: PulseQuoteResult) => void
		let markStarted!: () => void
		const started = new Promise<void>((resolve) => {
			markStarted = resolve
		})
		const readQuote = mock(() => {
			markStarted()
			return new Promise<PulseQuoteResult>((resolve) => {
				resolveQuote = resolve
			})
		})
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const requests = [
			handler(makeRequest('asset=XLM')),
			handler(makeRequest('asset=XLM')),
			handler(makeRequest('asset=XLM')),
			handler(makeRequest('asset=XLM')),
		]

		await started
		resolveQuote(FRESH_XLM_QUOTE)
		const responses = await Promise.all(requests)

		for (const res of responses) {
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual(FRESH_XLM_QUOTE)
		}
		expect(readQuote).toHaveBeenCalledTimes(1)
	})

	test('does not cache 503 unavailable responses so recovery is immediate', async () => {
		let callCount = 0
		const readQuote = mock(async (): Promise<PulseQuoteResult> => {
			callCount += 1
			return callCount === 1 ? { status: 'stale' } : FRESH_XLM_QUOTE
		})
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const first = await handler(makeRequest('asset=XLM'))
		const second = await handler(makeRequest('asset=XLM'))

		expect(first.status).toBe(503)
		expect(second.status).toBe(200)
		expect(await second.json()).toEqual(FRESH_XLM_QUOTE)
		expect(readQuote).toHaveBeenCalledTimes(2)
	})

	test('rejects arbitrary contractId or extra query params with 400 and never calls the oracle', async () => {
		const readQuote = mock(async () => FRESH_XLM_QUOTE)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const withContractId = await handler(
			makeRequest('asset=XLM&contractId=CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
		)
		const withNetworkParam = await handler(makeRequest('asset=XLM&network=mainnet'))

		expect(withContractId.status).toBe(400)
		expect(withNetworkParam.status).toBe(400)
		expect(readQuote).not.toHaveBeenCalled()
	})

	test('rejects missing or unsupported asset query params with 400', async () => {
		const readQuote = mock(async () => FRESH_XLM_QUOTE)
		const handler = createPricesGetHandler({
			readQuote,
			getNetwork: () => 'testnet',
		})

		const missing = await handler(makeRequest(''))
		const unsupported = await handler(makeRequest('asset=BTC'))

		expect(missing.status).toBe(400)
		expect(unsupported.status).toBe(400)
		expect(readQuote).not.toHaveBeenCalled()
	})
})

describe('GET /api/prices exported route (rate limiting, caching & fail-closed)', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockRouteReadPulseQuote.mockReset()
	})

	test('returns 429 and skips oracle read when per-IP rate limit is exceeded', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: true,
			attemptsRemaining: 0,
		}))

		const res = await GET(makeRequest('asset=XLM', '198.51.100.7, 10.0.0.1'))
		const body = await res.json()

		expect(res.status).toBe(429)
		expect(body).toEqual({ error: 'Too many requests. Please try again later.' })
		expect(res.headers.get('Retry-After')).toBe('900')
		expect(mockIncrement).toHaveBeenCalledWith('198.51.100.7', '/api/prices')
		expect(mockRouteReadPulseQuote).not.toHaveBeenCalled()
	})

	test('returns 503 { status: "unavailable" } when exported route receives a stale quote', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 29,
		}))
		mockRouteReadPulseQuote.mockImplementation(async () => ({ status: 'stale' }))

		const res = await GET(makeRequest('asset=XLM', '198.51.100.9'))
		const body = await res.json()

		expect(res.status).toBe(503)
		expect(body).toEqual({ status: 'unavailable' })
		expect(res.headers.get('Cache-Control')).toBe('no-store')
		expect(mockRouteReadPulseQuote).toHaveBeenCalledTimes(1)
	})

	test('caches fresh quotes across consecutive calls to exported GET and sets rate-limit headers', async () => {
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 29,
		}))
		mockRouteReadPulseQuote.mockImplementation(async () => FRESH_USDC_QUOTE)

		const first = await GET(makeRequest('asset=USDC', '198.51.100.8'))
		const second = await GET(makeRequest('asset=USDC', '198.51.100.8'))

		expect(first.status).toBe(200)
		expect(second.status).toBe(200)
		expect(await first.json()).toEqual(FRESH_USDC_QUOTE)
		expect(await second.json()).toEqual(FRESH_USDC_QUOTE)
		expect(first.headers.get('Cache-Control')).toBe(PRICE_CACHE_CONTROL_HEADER)
		expect(first.headers.get('X-RateLimit-Remaining')).toBe('29')
		expect(mockIncrement).toHaveBeenCalledWith('198.51.100.8', '/api/prices')
		expect(mockRouteReadPulseQuote).toHaveBeenCalledTimes(1)
	})
})

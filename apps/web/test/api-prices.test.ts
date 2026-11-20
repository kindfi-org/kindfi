import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { PulseQuoteResult, ReflectorQuotedAsset } from '../lib/stellar/reflector-pulse.server'

mock.module('server-only', () => ({}))
mock.module('@reflector/contract-client', () => ({
	PulseClient: class FakePulseClient {},
}))
mock.module('next/server', () => ({
	NextResponse: {
		json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
			return new Response(JSON.stringify(body), {
				status: init?.status ?? 200,
				headers: {
					'content-type': 'application/json',
					...(init?.headers ?? {}),
				},
			})
		},
	},
}))
mock.module('~/lib/middleware/rate-limit', () => ({
	withRateLimit: (_config: unknown, handler: (req: unknown) => Promise<Response>) => handler,
}))

const { PRICE_CACHE_TTL_MS, clearPriceQuoteCache, handleGetPrice } = await import(
	'../app/api/prices/route'
)

function makeRequest(query: string) {
	return { nextUrl: new URL(`http://localhost:3000/api/prices${query}`) }
}

const FRESH_QUOTE: PulseQuoteResult = {
	price: 0.12782496280771,
	decimals: 14,
	timestamp: 1_795_193_700,
	source: 'reflector-pulse',
	feedContractId: 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M',
}

describe('GET /api/prices route handler', () => {
	beforeEach(() => {
		clearPriceQuoteCache()
	})

	test('returns 200 with CDN cache header on a fresh quote', async () => {
		let calls = 0
		const res = await handleGetPrice(makeRequest('?asset=XLM'), {
			getNetwork: () => 'mainnet',
			nowMs: () => 100_000,
			readQuote: async () => {
				calls += 1
				return FRESH_QUOTE
			},
		})

		expect(res.status).toBe(200)
		expect(res.headers.get('cache-control')).toContain('s-maxage=60')
		expect(await res.json()).toEqual(FRESH_QUOTE)
		expect(calls).toBe(1)
	})

	test('caches fresh quotes for 60s so a second call inside the window does not call the client again', async () => {
		let calls = 0
		let currentMs = 1_000_000
		const deps = {
			getNetwork: () => 'mainnet' as const,
			nowMs: () => currentMs,
			readQuote: async () => {
				calls += 1
				return FRESH_QUOTE
			},
		}

		const first = await handleGetPrice(makeRequest('?asset=XLM'), deps)
		expect(first.status).toBe(200)
		expect(calls).toBe(1)

		currentMs += PRICE_CACHE_TTL_MS - 1_000
		const second = await handleGetPrice(makeRequest('?asset=XLM'), deps)
		expect(second.status).toBe(200)
		expect(await second.json()).toEqual(FRESH_QUOTE)
		expect(calls).toBe(1)

		currentMs += 2_000
		const third = await handleGetPrice(makeRequest('?asset=XLM'), deps)
		expect(third.status).toBe(200)
		expect(calls).toBe(2)
	})

	test('returns 503 unavailable on stale quotes and never returns price 0', async () => {
		const res = await handleGetPrice(makeRequest('?asset=XLM'), {
			getNetwork: () => 'testnet',
			nowMs: () => 100_000,
			readQuote: async () => ({ status: 'stale' }),
		})

		expect(res.status).toBe(503)
		expect(res.headers.get('cache-control')).toBe('no-store')
		const body = await res.json()
		expect(body).toEqual({ status: 'unavailable' })
		expect('price' in body).toBe(false)
	})

	test('returns 503 unavailable on missing quotes or upstream RPC errors', async () => {
		const missingRes = await handleGetPrice(makeRequest('?asset=USDC'), {
			getNetwork: () => 'testnet',
			nowMs: () => 100_000,
			readQuote: async () => ({ status: 'missing' }),
		})
		expect(missingRes.status).toBe(503)
		expect(await missingRes.json()).toEqual({ status: 'unavailable' })

		const errorRes = await handleGetPrice(makeRequest('?asset=USDC'), {
			getNetwork: () => 'testnet',
			nowMs: () => 100_000,
			readQuote: async () => {
				throw new Error('Soroban RPC unavailable')
			},
		})
		expect(errorRes.status).toBe(503)
		expect(await errorRes.json()).toEqual({ status: 'unavailable' })
	})

	test('rejects unsupported assets with 400 and ignores arbitrary contractId query params', async () => {
		const badRes = await handleGetPrice(makeRequest('?asset=DOGE'), {
			getNetwork: () => 'testnet',
		})
		expect(badRes.status).toBe(400)

		let capturedParams: { network: string; asset: ReflectorQuotedAsset } | undefined
		const okRes = await handleGetPrice(
			makeRequest('?asset=xlm&contractId=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
			{
				getNetwork: () => 'testnet',
				nowMs: () => 100_000,
				readQuote: async (params) => {
					capturedParams = params
					return FRESH_QUOTE
				},
			},
		)

		expect(okRes.status).toBe(200)
		expect(capturedParams).toEqual({ network: 'testnet', asset: 'XLM' })
		expect('contractId' in (capturedParams ?? {})).toBe(false)
	})
})

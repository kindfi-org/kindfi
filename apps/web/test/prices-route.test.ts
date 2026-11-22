import { describe, expect, test } from 'bun:test'
import type { NextRequest } from 'next/server'
import { GET } from '~/app/api/prices/route'

function createRequest(url: string): NextRequest {
	const parsedUrl = new URL(url)
	return {
		nextUrl: parsedUrl,
		url: parsedUrl.toString(),
	} as unknown as NextRequest
}

describe('GET /api/prices', () => {
	test('returns Reflector Pulse price for XLM with 200 and no status field', async () => {
		const req = createRequest('http://localhost:3000/api/prices?asset=XLM')
		const res = await GET(req)
		expect(res.status).toBe(200)

		const body = await res.json()
		expect(body.asset).toBe('XLM')
		expect(typeof body.price).toBe('number')
		expect(body.price).toBeGreaterThan(0)
		expect(body.timestamp).toBeDefined()
		// Crucial requirement: status field MUST be absent when successful
		expect(body.status).toBeUndefined()
	})

	test('case-insensitively parses asset parameter', async () => {
		const req = createRequest('http://localhost:3000/api/prices?asset=xlm')
		const res = await GET(req)
		expect(res.status).toBe(200)

		const body = await res.json()
		expect(body.asset).toBe('XLM')
		expect(body.status).toBeUndefined()
	})

	test('returns 400 when asset parameter is missing', async () => {
		const req = createRequest('http://localhost:3000/api/prices')
		const res = await GET(req)
		expect(res.status).toBe(400)

		const body = await res.json()
		expect(body.status).toBe('invalid_request')
		expect(body.price).toBeUndefined()
	})

	test('returns 400 for unsupported assets', async () => {
		const req = createRequest('http://localhost:3000/api/prices?asset=BTC')
		const res = await GET(req)
		expect(res.status).toBe(400)

		const body = await res.json()
		expect(body.status).toBe('unsupported_asset')
	})

	test('returns 503 when oracle is down / unavailable', async () => {
		const req = createRequest('http://localhost:3000/api/prices?asset=XLM&simulate_down=true')
		const res = await GET(req)
		expect(res.status).toBe(503)

		const body = await res.json()
		expect(body.status).toBe('service_unavailable')
		expect(body.price).toBeUndefined()
	})
})

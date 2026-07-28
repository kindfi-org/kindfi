import { beforeEach, describe, expect, mock, test } from 'bun:test'

// ── Environment (must be set before any module that touches Supabase loads) ──
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXTAUTH_SECRET = 'test-secret'

// ── Mutable mock state (reset per test) ─────────────────────────────────────

let mockRoundsResult: { data: unknown; error: unknown; count: number } = {
	data: [],
	error: null,
	count: 0,
}
let mockVotesResult: { data: unknown; error: unknown } = { data: [], error: null }

// ── Module mocks (must precede route import) ─────────────────────────────────

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: { status?: number }) =>
			new Response(JSON.stringify(body), {
				status: init?.status ?? 200,
				headers: { 'Content-Type': 'application/json' },
			}),
	},
}))

mock.module('next-auth', () => ({ getServerSession: mock(async () => null) }))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))
mock.module('@/lib/logger', () => ({
	logger: { error: mock(() => {}), warn: mock(() => {}), info: mock(() => {}) },
}))
mock.module('~/lib/stellar/governance-contract', () => ({ GovernanceContractService: class {} }))

mock.module('@packages/lib/supabase', () => {
	function createChain(result: unknown): unknown {
		const chain: Record<string, unknown> = {
			then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
				Promise.resolve(result).then(res, rej),
			catch: (fn: (e: unknown) => unknown) => Promise.resolve(result).catch(fn),
		}
		for (const m of [
			'select',
			'order',
			'eq',
			'in',
			'range',
			'single',
			'maybeSingle',
			'insert',
			'update',
		]) {
			chain[m] = () => createChain(result)
		}
		return chain
	}

	return {
		supabase: {
			rpc: mock(async () => ({ data: null, error: null })),
			from: (table: string) => {
				if (table === 'governance_rounds') return createChain(mockRoundsResult)
				if (table === 'governance_votes') return createChain(mockVotesResult)
				return createChain({ data: null, error: null })
			},
		},
	}
})

// Dynamic import AFTER all mocks are registered (static imports are hoisted and
// would run before mock.module calls, preventing the mocks from taking effect)
const { GET } = await import('../app/api/governance/rounds/route')

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(params: Record<string, string> = {}): unknown {
	const defaults = { limit: '10', offset: '0' }
	const merged = { ...defaults, ...params }
	const url = new URL('http://localhost/api/governance/rounds')
	for (const [k, v] of Object.entries(merged)) url.searchParams.set(k, v)
	return { nextUrl: url }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/governance/rounds', () => {
	beforeEach(() => {
		mockRoundsResult = { data: [], error: null, count: 0 }
		mockVotesResult = { data: [], error: null }
	})

	test('returns 200 with enriched options for multiple rounds and options', async () => {
		mockRoundsResult = {
			data: [
				{
					id: 'round-1',
					title: 'Round 1',
					status: 'active',
					options: [
						{ id: 'opt-a', title: 'Option A' },
						{ id: 'opt-b', title: 'Option B' },
					],
				},
				{
					id: 'round-2',
					title: 'Round 2',
					status: 'active',
					options: [{ id: 'opt-c', title: 'Option C' }],
				},
			],
			error: null,
			count: 2,
		}
		mockVotesResult = {
			data: [
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'up', vote_weight: 5 },
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'down', vote_weight: 2 },
				{ round_id: 'round-1', option_id: 'opt-b', vote_type: 'up', vote_weight: 3 },
				{ round_id: 'round-2', option_id: 'opt-c', vote_type: 'up', vote_weight: 10 },
			],
			error: null,
		}

		const res = await GET(makeReq() as any)
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body.success).toBe(true)
		expect(body.pagination).toEqual({ limit: 10, offset: 0, total: 2 })

		const [r1, r2] = body.data
		const optA = r1.options.find((o: { id: string }) => o.id === 'opt-a')
		const optB = r1.options.find((o: { id: string }) => o.id === 'opt-b')
		const optC = r2.options.find((o: { id: string }) => o.id === 'opt-c')

		expect(optA).toMatchObject({ weighted_upvotes: 5, weighted_downvotes: 2 })
		expect(optB).toMatchObject({ weighted_upvotes: 3, weighted_downvotes: 0 })
		expect(optC).toMatchObject({ weighted_upvotes: 10, weighted_downvotes: 0 })
	})

	test('returns zero weights when a round has no votes', async () => {
		mockRoundsResult = {
			data: [
				{
					id: 'round-1',
					title: 'Round 1',
					status: 'active',
					options: [
						{ id: 'opt-a', title: 'Option A' },
						{ id: 'opt-b', title: 'Option B' },
					],
				},
			],
			error: null,
			count: 1,
		}
		mockVotesResult = { data: [], error: null }

		const res = await GET(makeReq() as any)
		const body = await res.json()

		expect(res.status).toBe(200)
		for (const opt of body.data[0].options) {
			expect(opt.weighted_upvotes).toBe(0)
			expect(opt.weighted_downvotes).toBe(0)
		}
	})

	test('separates up and down vote weights on the same option', async () => {
		mockRoundsResult = {
			data: [
				{
					id: 'round-1',
					title: 'Round 1',
					status: 'active',
					options: [{ id: 'opt-a', title: 'Option A' }],
				},
			],
			error: null,
			count: 1,
		}
		mockVotesResult = {
			data: [
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'up', vote_weight: 7 },
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'down', vote_weight: 4 },
			],
			error: null,
		}

		const res = await GET(makeReq() as any)
		const body = await res.json()
		const opt = body.data[0].options[0]

		expect(opt.weighted_upvotes).toBe(7)
		expect(opt.weighted_downvotes).toBe(4)
	})

	test('returns 200 with empty data when no rounds exist', async () => {
		mockRoundsResult = { data: [], error: null, count: 0 }
		mockVotesResult = { data: [], error: null }

		const res = await GET(makeReq() as any)
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body.success).toBe(true)
		expect(body.data).toEqual([])
		expect(body.pagination.total).toBe(0)
	})

	test('respects pagination parameters in the response', async () => {
		mockRoundsResult = { data: [], error: null, count: 42 }

		const res = await GET(makeReq({ limit: '5', offset: '15' }) as any)
		const body = await res.json()

		expect(res.status).toBe(200)
		expect(body.pagination).toEqual({ limit: 5, offset: 15, total: 42 })
	})

	test('returns 500 when the database returns an error', async () => {
		mockRoundsResult = { data: null, error: { message: 'connection refused' }, count: 0 }

		const res = await GET(makeReq() as any)
		const body = await res.json()

		expect(res.status).toBe(500)
		expect(body).toEqual({ error: 'Failed to fetch rounds' })
	})

	test('accumulates vote weights from multiple tiers on the same option', async () => {
		mockRoundsResult = {
			data: [
				{
					id: 'round-1',
					title: 'Round 1',
					status: 'active',
					options: [{ id: 'opt-a', title: 'Option A' }],
				},
			],
			error: null,
			count: 1,
		}
		// bronze=1, diamond=10 both upvoting → total 11
		mockVotesResult = {
			data: [
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'up', vote_weight: 1 },
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'up', vote_weight: 10 },
			],
			error: null,
		}

		const res = await GET(makeReq() as any)
		const body = await res.json()
		const opt = body.data[0].options[0]

		expect(opt.weighted_upvotes).toBe(11)
		expect(opt.weighted_downvotes).toBe(0)
	})

	test('votes from other rounds do not bleed into the wrong round', async () => {
		mockRoundsResult = {
			data: [
				{
					id: 'round-1',
					title: 'Round 1',
					status: 'active',
					options: [{ id: 'opt-a', title: 'Option A' }],
				},
				{
					id: 'round-2',
					title: 'Round 2',
					status: 'active',
					options: [{ id: 'opt-a', title: 'Option A (round 2)' }],
				},
			],
			error: null,
			count: 2,
		}
		// opt-a exists in both rounds but with different weights per round
		mockVotesResult = {
			data: [
				{ round_id: 'round-1', option_id: 'opt-a', vote_type: 'up', vote_weight: 3 },
				{ round_id: 'round-2', option_id: 'opt-a', vote_type: 'up', vote_weight: 8 },
			],
			error: null,
		}

		const res = await GET(makeReq() as any)
		const body = await res.json()

		expect(body.data[0].options[0].weighted_upvotes).toBe(3)
		expect(body.data[1].options[0].weighted_upvotes).toBe(8)
	})
})

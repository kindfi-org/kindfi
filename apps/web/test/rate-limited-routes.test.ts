/**
 * rate-limited-routes.test.ts
 *
 * Verifies that all newly rate-limited API routes:
 * 1. Return HTTP 429 when the rate limiter blocks the request
 * 2. Pass through to the handler when the rate limiter allows the request
 *
 * All 12 routes added in the rate-limiting expansion are covered.
 * High-priority routes use the 'strict' preset (3 req/min, 1 h block).
 * Medium-priority routes use the 'moderate' preset (10 req/min, 30 min block).
 */

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'

// ─── Mutable mock handle ──────────────────────────────────────────────────────

const mockIncrement = mock(async (_id: string, _action: string) => ({
	isBlocked: false,
	attemptsRemaining: 9,
}))

// ─── Module mocks (must be registered before any dynamic imports) ─────────────

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: ResponseInit) => {
			const headersMap = new Map<string, string>(
				Object.entries((init?.headers as Record<string, string>) ?? {}),
			)
			return {
				status: init?.status ?? 200,
				headers: {
					set: (k: string, v: string) => headersMap.set(k, v),
					get: (k: string) => headersMap.get(k) ?? null,
				},
				json: async () => JSON.parse(JSON.stringify(body)),
			}
		},
	},
}))

mock.module('~/lib/auth/rate-limiter', () => ({
	RateLimiter: class {
		increment = mockIncrement
	},
}))

// ── shared infrastructure ────────────────────────────────────────────────────

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

mock.module('~/lib/services/audit-logger', () => ({
	AuditLogger: class {
		log = async () => {}
		static maskAddress = (a: string) => a
	},
}))

mock.module('~/lib/utils/id', () => ({ generateUniqueId: () => 'mock-id' }))

mock.module('~/lib/utils/validation', () => ({
	validateRequest: () => ({
		success: false,
		response: {
			status: 400,
			headers: { set: () => {}, get: () => null },
			json: async () => ({ error: 'validation' }),
		},
	}),
}))

mock.module('~/lib/error', () => ({
	AppError: class extends Error {
		statusCode: number
		details: unknown
		constructor(msg: string, code = 500, details?: unknown) {
			super(msg)
			this.statusCode = code
			this.details = details
		}
	},
}))

// ── auth ─────────────────────────────────────────────────────────────────────

mock.module('next-auth', () => ({ getServerSession: async () => null }))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))
mock.module('~/lib/api-helpers', () => ({
	requireSession: async () => ({ user: { id: 'user-1' }, error: null }),
	error: (msg: string, opts?: { status?: number }) => ({
		status: opts?.status ?? 500,
		headers: { set: () => {}, get: () => null },
		json: async () => ({ error: msg }),
	}),
	respond: (data: unknown, opts?: { status?: number }) => ({
		status: opts?.status ?? 200,
		headers: { set: () => {}, get: () => null },
		json: async () => data,
	}),
}))

// ── database ─────────────────────────────────────────────────────────────────

mock.module('@packages/lib/supabase', () => ({
	supabase: {
		from: () => ({
			select: () => ({
				eq: () => ({
					single: () => ({ data: null, error: null }),
					maybeSingle: () => ({ data: null, error: null }),
				}),
			}),
			insert: () => ({ select: () => ({ single: () => ({ data: { id: '1' }, error: null }) }) }),
			update: () => ({ eq: () => ({ data: null, error: null }) }),
		}),
		auth: { getUser: async () => ({ data: { user: null }, error: null }) },
	},
}))

mock.module('@packages/lib/supabase-server', () => ({
	createSupabaseServerClient: async () => ({
		auth: { getUser: async () => ({ data: { user: null }, error: null }) },
		from: () => ({
			select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
			insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
		}),
	}),
}))

mock.module('@services/supabase', () => ({}))

// ── stellar / escrow ─────────────────────────────────────────────────────────

mock.module('@stellar/stellar-sdk', () => ({
	Networks: { TESTNET: 'Test SDF Network ; September 2015' },
	TransactionBuilder: { fromXDR: () => ({ toEnvelope: () => {} }) },
}))

mock.module('@stellar/stellar-sdk/rpc', () => ({
	Api: { isSimulationError: () => true },
	Server: class {
		simulateTransaction = async () => ({ error: 'sim error' })
	},
}))

mock.module('@packages/lib/config', () => ({
	appEnvConfig: () => ({
		stellar: {
			networkPassphrase: 'Test SDF Network ; September 2015',
			rpcUrl: 'https://rpc.test',
		},
		vapid: { publicKey: 'mock-vapid-key' },
	}),
}))

mock.module('@packages/lib/types', () => ({}))

mock.module('~/lib/stellar/utils/create-escrow', () => ({
	createEscrowRequest: async () => ({ unsignedTransaction: 'mock-xdr' }),
}))

mock.module('~/lib/stellar/utils/send-transaction', () => ({
	sendTransaction: async () => null,
}))

mock.module('~/lib/stellar/utils/sign-transaction', () => ({
	signTransaction: () => 'signed-xdr',
}))

mock.module('~/lib/utils/escrow/trustless-signer', () => ({
	isSmartAccountAddress: () => false,
}))

// ── schemas ───────────────────────────────────────────────────────────────────

mock.module('~/lib/schemas/escrow.schemas', () => ({
	escrowFundSchema: {},
	escrowInitializeSchema: {},
	milestoneReviewSchema: {},
}))

mock.module('~/lib/schemas/escrow-dispute.schemas', () => ({
	listDisputesQuerySchema: {},
}))

mock.module('~/lib/schemas/escrow-sign.schemas', () => ({
	signAndSubmitSchema: {},
}))

mock.module('~/lib/schemas/governance.schemas', () => ({
	castVoteSchema: {},
}))

mock.module('~/lib/schemas/kyc.schemas', () => ({
	createDiditSessionSchema: {},
}))

mock.module('~/lib/schemas/contribution.schemas', () => ({
	createContributionSchema: {},
}))

mock.module('~/lib/schemas/foundation-create.schemas', () => ({
	createFoundationFormSchema: {},
}))

mock.module('~/lib/schemas/project.schemas', () => ({
	projectCreateFormSchema: {},
}))

// ── validators / types ────────────────────────────────────────────────────────

mock.module('~/lib/validators/dispute', () => ({
	validateDispute: () => ({ success: false, error: { format: () => ({}) } }),
}))

mock.module('~/lib/types/escrow/escrow-payload.types', () => ({}))

mock.module('~/lib/governance/vote-weight', () => ({ getVoteWeight: () => 1 }))

// ── services ──────────────────────────────────────────────────────────────────

mock.module('~/lib/services/didit', () => ({
	createDiditSession: async () => ({
		session_id: 'sess-1',
		session_token: 'tok',
		url: 'https://didit.io',
	}),
}))

mock.module('~/lib/utils/project-utils', () => ({
	uploadFoundationLogo: async () => null,
	parseFormData: () => ({}),
	uploadProjectImage: async () => null,
	upsertTags: async () => {},
	buildSocialLinks: () => ({}),
}))

mock.module('~/lib/services/notification-logger.server', () => ({
	NotificationLogger: class {
		logInfo = () => {}
		logError = () => {}
	},
}))

mock.module('~/lib/services/notification-service', () => ({
	NotificationService: class {},
}))

// ── comments internal validation (relative import from route) ─────────────────

mock.module('../app/api/comments/validation', () => ({
	commentsQuerySchema: {},
	createCommentSchema: {
		safeParse: () => ({
			success: false,
			error: { flatten: () => ({ fieldErrors: {}, formErrors: [] }) },
		}),
	},
	validateParentComment: async () => ({ valid: true }),
}))

// ─── Dynamic route imports (after all mocks are registered) ───────────────────

const { POST: escrowFundPOST } = await import('../app/api/escrow/fund/route')
const { POST: escrowInitializePOST } = await import('../app/api/escrow/initialize/route')
const { POST: escrowDisputePOST } = await import('../app/api/escrow/dispute/route')
const { POST: escrowReviewPOST } = await import('../app/api/escrow/review/route')
const { POST: escrowSignPOST } = await import('../app/api/escrow/sign-and-submit/route')
const { POST: contributionsPOST } = await import('../app/api/contributions/create/route')
const { POST: votePOST } = await import('../app/api/governance/vote/route')
const { POST: kycSessionPOST } = await import('../app/api/kyc/didit/create-session/route')
const { POST: commentsPOST } = await import('../app/api/comments/route')
const { POST: foundationsPOST } = await import('../app/api/foundations/create/route')
const { POST: projectsPOST } = await import('../app/api/projects/create/route')
const { POST: notificationsPOST } = await import('../app/api/notifications/push/route')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(path = '/api/test'): NextRequest {
	return {
		nextUrl: { pathname: path },
		headers: {
			get: (key: string) => (key === 'x-forwarded-for' ? '127.0.0.1' : null),
		},
	} as unknown as NextRequest
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Rate-limited routes — blocked requests return 429', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockIncrement.mockImplementation(async () => ({
			isBlocked: true,
			attemptsRemaining: 0,
		}))
	})

	const highPriorityRoutes: Array<{
		name: string
		handler: (req: NextRequest) => Promise<{ status: number }>
		path: string
	}> = [
		{
			name: '/api/escrow/fund',
			handler: escrowFundPOST,
			path: '/api/escrow/fund',
		},
		{
			name: '/api/escrow/initialize',
			handler: escrowInitializePOST,
			path: '/api/escrow/initialize',
		},
		{
			name: '/api/escrow/dispute',
			handler: escrowDisputePOST,
			path: '/api/escrow/dispute',
		},
		{
			name: '/api/escrow/review',
			handler: escrowReviewPOST,
			path: '/api/escrow/review',
		},
		{
			name: '/api/escrow/sign-and-submit',
			handler: escrowSignPOST,
			path: '/api/escrow/sign-and-submit',
		},
		{
			name: '/api/contributions/create',
			handler: contributionsPOST,
			path: '/api/contributions/create',
		},
		{
			name: '/api/governance/vote',
			handler: votePOST,
			path: '/api/governance/vote',
		},
		{
			name: '/api/kyc/didit/create-session',
			handler: kycSessionPOST,
			path: '/api/kyc/didit/create-session',
		},
	]

	const mediumPriorityRoutes: Array<{
		name: string
		handler: (req: NextRequest) => Promise<{ status: number }>
		path: string
	}> = [
		{
			name: '/api/comments (POST)',
			handler: commentsPOST,
			path: '/api/comments',
		},
		{
			name: '/api/foundations/create',
			handler: foundationsPOST,
			path: '/api/foundations/create',
		},
		{
			name: '/api/projects/create',
			handler: projectsPOST,
			path: '/api/projects/create',
		},
		{
			name: '/api/notifications/push',
			handler: notificationsPOST,
			path: '/api/notifications/push',
		},
	]

	describe('high-priority routes (strict preset)', () => {
		for (const { name, handler, path } of highPriorityRoutes) {
			test(`${name} returns 429 when rate limited`, async () => {
				const res = await handler(makeRequest(path))
				expect(res.status).toBe(429)
			})
		}
	})

	describe('medium-priority routes (moderate preset)', () => {
		for (const { name, handler, path } of mediumPriorityRoutes) {
			test(`${name} returns 429 when rate limited`, async () => {
				const res = await handler(makeRequest(path))
				expect(res.status).toBe(429)
			})
		}
	})
})

describe('Rate-limited routes — allowed requests pass through', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 5,
		}))
	})

	test('/api/escrow/fund does not return 429 when not blocked', async () => {
		const res = await escrowFundPOST(makeRequest('/api/escrow/fund'))
		expect(res.status).not.toBe(429)
	})

	test('/api/governance/vote does not return 429 when not blocked', async () => {
		const res = await votePOST(makeRequest('/api/governance/vote'))
		expect(res.status).not.toBe(429)
	})

	test('/api/comments does not return 429 when not blocked', async () => {
		const res = await commentsPOST(makeRequest('/api/comments'))
		expect(res.status).not.toBe(429)
	})

	test('/api/projects/create does not return 429 when not blocked', async () => {
		const res = await projectsPOST(makeRequest('/api/projects/create'))
		expect(res.status).not.toBe(429)
	})
})

describe('Rate-limited routes — increment is called for each request', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockIncrement.mockImplementation(async () => ({
			isBlocked: false,
			attemptsRemaining: 9,
		}))
	})

	test('increment is called once per request on /api/escrow/fund', async () => {
		await escrowFundPOST(makeRequest('/api/escrow/fund'))
		expect(mockIncrement).toHaveBeenCalledTimes(1)
	})

	test('increment is called with the route pathname', async () => {
		await votePOST(makeRequest('/api/governance/vote'))
		expect(mockIncrement).toHaveBeenCalledWith(expect.any(String), '/api/governance/vote')
	})

	test('increment is called with the route pathname for medium-priority routes', async () => {
		await commentsPOST(makeRequest('/api/comments'))
		expect(mockIncrement).toHaveBeenCalledWith(expect.any(String), '/api/comments')
	})
})

describe('Rate-limited routes — Redis failure falls open', () => {
	beforeEach(() => {
		mockIncrement.mockReset()
		mockIncrement.mockImplementation(async () => {
			throw new Error('Redis connection refused')
		})
	})

	test('/api/escrow/fund passes through when Redis is unavailable', async () => {
		const res = await escrowFundPOST(makeRequest('/api/escrow/fund'))
		expect(res.status).not.toBe(429)
	})

	test('/api/contributions/create passes through when Redis is unavailable', async () => {
		const res = await contributionsPOST(makeRequest('/api/contributions/create'))
		expect(res.status).not.toBe(429)
	})
})

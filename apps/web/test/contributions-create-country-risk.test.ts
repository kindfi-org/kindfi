/**
 * contributions-create-country-risk.test.ts
 *
 * Integration test for the `donate` action's country-risk enforcement wiring
 * in apps/web/app/api/contributions/create/route.ts (issue #1009). Verifies
 * the route consults evaluateCountryRiskAuthorization and short-circuits
 * with 403 when the decision blocks the action, while passing through to
 * the normal contribution flow when it's allowed.
 */

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'

function jsonResponse(body: unknown, init?: { status?: number }) {
	return {
		status: init?.status ?? 200,
		json: async () => body,
	}
}

mock.module('next/server', () => ({
	NextResponse: { json: jsonResponse },
}))

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

const mockGetServerSession = mock(async () => ({ user: { id: 'user-1' } }) as unknown)
mock.module('next-auth', () => ({ getServerSession: mockGetServerSession }))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))

mock.module('~/lib/middleware/rate-limit', () => ({
	withRateLimit: (_config: unknown, handler: (req: NextRequest) => Promise<unknown>) => handler,
}))

mock.module('~/lib/queries/projects/development-only-access', () => ({
	canAccessDevelopmentOnlyProject: async () => true,
}))

mock.module('~/lib/schemas/contribution.schemas', () => ({
	createContributionSchema: {
		safeParse: (body: unknown) => ({ success: true, data: body }),
	},
}))

mock.module('~/lib/utils/validation', () => ({
	validateRequest: (_schema: unknown, body: unknown) => ({ success: true, data: body }),
}))

const mockEvaluate = mock(
	async () =>
		({ allowed: true, enforced: false, mode: 'disabled' }) as {
			allowed: boolean
			enforced: boolean
			mode: string
			requiredAction?: string
		},
)
mock.module('~/lib/compliance/authorization-service', () => ({
	evaluateCountryRiskAuthorization: mockEvaluate,
}))

mock.module('~/lib/kyc/denial', () => ({
	requireKycAuthorization: async () => ({
		ok: true,
		result: {
			allowed: true,
			enforced: false,
			mode: 'disabled',
			currentKycStatus: 'not_started',
			policyResult: 'allow',
			reasonCode: 'disabled',
		},
	}),
}))

// Once the compliance gate passes, force a controlled, distinguishable
// failure downstream so we can prove the gate was crossed without having to
// fully stub the rest of the contribution pipeline.
mock.module('~/lib/services/contribution-service', () => ({
	resolveProjectId: async () => ({ success: false, error: 'downstream reached', status: 404 }),
	checkFundraisingGoalNotReached: async () => ({ allowed: true }),
	checkDuplicateContribution: async () => ({ duplicate: false }),
	createContributionWithProjectUpdate: async () => ({ success: true, contributionId: 'c1' }),
	sendContributionNotifications: async () => {},
	triggerGamificationUpdates: async () => {},
}))

function makeRequest(body: Record<string, unknown>): NextRequest {
	return {
		json: async () => body,
		headers: { get: () => null },
	} as unknown as NextRequest
}

describe('POST /api/contributions/create — country-risk enforcement', () => {
	beforeEach(() => {
		mockEvaluate.mockClear()
		mockGetServerSession.mockClear()
	})

	test('passes through to the contribution flow when the decision allows the action', async () => {
		mockEvaluate.mockImplementation(async () => ({
			allowed: true,
			enforced: false,
			mode: 'disabled',
		}))

		const { POST } = await import('../app/api/contributions/create/route')
		const response = (await POST(
			makeRequest({
				projectId: '11111111-1111-1111-1111-111111111111',
				amount: 10,
				transactionHash: 'tx1',
				walletAddress: 'GABC',
			}),
		)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> }

		expect(mockEvaluate).toHaveBeenCalledTimes(1)
		const callArg = mockEvaluate.mock.calls[0][0] as { userId: string; action: string }
		expect(callArg.userId).toBe('user-1')
		expect(callArg.action).toBe('donate')

		// Blocked only by our stubbed downstream failure — proves the request
		// passed the compliance gate rather than being blocked at 403.
		const body = await response.json()
		expect(response.status).toBe(404)
		expect(body.error).toBe('downstream reached')
	})

	test('returns 403 and never reaches the contribution flow when the decision blocks the action', async () => {
		mockEvaluate.mockImplementation(async () => ({
			allowed: false,
			enforced: true,
			mode: 'enforced',
			requiredAction: 'manual_review',
		}))

		const { POST } = await import('../app/api/contributions/create/route')
		const response = (await POST(
			makeRequest({
				projectId: '11111111-1111-1111-1111-111111111111',
				amount: 10,
				transactionHash: 'tx2',
				walletAddress: 'GABC',
			}),
		)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> }

		expect(response.status).toBe(403)
		const body = await response.json()
		expect(body.requiredAction).toBe('manual_review')
	})
})

/**
 * Integration test: contribution creation keeps existing behavior while KYC
 * enforcement is disabled or in monitor mode. The route still calls
 * authorizeFinancialAction; those modes must not return 403.
 */

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { NextRequest } from 'next/server'

const jsonResponse = (body: unknown, init?: { status?: number }) => ({
	status: init?.status ?? 200,
	json: async () => body,
})

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

mock.module('~/lib/compliance/authorization-service', () => ({
	evaluateCountryRiskAuthorization: async () => ({
		allowed: true,
		enforced: false,
		mode: 'disabled',
	}),
}))

const mockAuthorize = mock(async () => ({
	allowed: true,
	enforced: false,
	mode: 'disabled',
	currentKycStatus: 'not_started',
	policyResult: 'allow',
	reasonCode: 'disabled',
}))

mock.module('~/lib/kyc/denial', () => ({
	requireKycAuthorization: async (input: { userId: string; action: string; amount?: number }) => {
		const result = await mockAuthorize(input)
		if (!result.allowed) {
			return {
				ok: false,
				response: jsonResponse(
					{
						error: 'Identity verification is required for this action.',
						...result,
					},
					{ status: 403 },
				),
			}
		}
		return { ok: true, result }
	},
}))

mock.module('~/lib/services/contribution-service', () => ({
	resolveProjectId: async () => ({ success: false, error: 'downstream reached', status: 404 }),
	checkFundraisingGoalNotReached: async () => ({ allowed: true }),
	checkDuplicateContribution: async () => ({ duplicate: false }),
	createContributionWithProjectUpdate: async () => ({ success: true, contributionId: 'c1' }),
	sendContributionNotifications: async () => {},
	triggerGamificationUpdates: async () => {},
	validateContributionAllowed: async () => ({ allowed: true }),
}))

const makeRequest = (body: Record<string, unknown>): NextRequest =>
	({
		json: async () => body,
		headers: { get: () => null },
	}) as unknown as NextRequest

describe('POST /api/contributions/create — KYC enforcement wiring', () => {
	beforeEach(() => {
		mockAuthorize.mockClear()
		mockGetServerSession.mockClear()
	})

	test('disabled mode preserves the contribution flow', async () => {
		mockAuthorize.mockImplementation(async () => ({
			allowed: true,
			enforced: false,
			mode: 'disabled',
			currentKycStatus: 'not_started',
			policyResult: 'allow',
			reasonCode: 'disabled',
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

		expect(mockAuthorize).toHaveBeenCalledTimes(1)
		const callArg = mockAuthorize.mock.calls[0][0] as { action: string }
		expect(callArg.action).toBe('donate')
		const body = await response.json()
		expect(response.status).toBe(404)
		expect(body.error).toBe('downstream reached')
	})

	test('monitor mode still reaches the contribution flow', async () => {
		mockAuthorize.mockImplementation(async () => ({
			allowed: true,
			enforced: false,
			mode: 'monitor',
			currentKycStatus: 'not_started',
			policyResult: 'deny',
			reasonCode: 'kyc_not_started',
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

		expect(response.status).toBe(404)
		expect((await response.json()).error).toBe('downstream reached')
	})

	test('enforced deny returns a structured 403 and never reaches contribution flow', async () => {
		mockAuthorize.mockImplementation(async () => ({
			allowed: false,
			enforced: true,
			mode: 'enforced',
			currentKycStatus: 'not_started',
			policyResult: 'deny',
			reasonCode: 'kyc_not_started',
			requiredAction: 'start_kyc',
		}))

		const { POST } = await import('../app/api/contributions/create/route')
		const response = (await POST(
			makeRequest({
				projectId: '11111111-1111-1111-1111-111111111111',
				amount: 10,
				transactionHash: 'tx3',
				walletAddress: 'GABC',
			}),
		)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> }

		expect(response.status).toBe(403)
		const body = await response.json()
		expect(body.reasonCode).toBe('kyc_not_started')
		expect(body.requiredAction).toBe('start_kyc')
		expect(body.allowed).toBe(false)
	})
})

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

const mockAuditEvent = mock(async () => {})
const mockGetActivePolicy = mock(async () => null as unknown)
const mockGetPolicyActions = mock(async () => [] as string[])
const mockGetPolicyCountryRiskLevel = mock(async () => 'standard')
const mockHasActiveException = mock(async () => false)
const mockGetCountryProfile = mock(async () => null as unknown)

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

mock.module('~/lib/compliance/audit-log', () => ({
	recordComplianceAuditEvent: mockAuditEvent,
}))

// Deliberately NOT mocking '~/lib/compliance/country-risk-config' — it's
// exercised for real (via the COUNTRY_RISK_MODE env var) so this file and
// compliance-country-risk-config.test.ts don't fight over a shared
// module-level mock in the same bun test process.
function setMode(mode: 'disabled' | 'monitor' | 'enforced' | undefined) {
	if (mode === undefined) delete process.env.COUNTRY_RISK_MODE
	else process.env.COUNTRY_RISK_MODE = mode
}

mock.module('~/lib/compliance/country-declaration-service', () => ({
	getCountryProfile: mockGetCountryProfile,
}))

mock.module('~/lib/compliance/policy-service', () => ({
	getActivePolicy: mockGetActivePolicy,
	getPolicyActions: mockGetPolicyActions,
	getPolicyCountryRiskLevel: mockGetPolicyCountryRiskLevel,
	hasActiveException: mockHasActiveException,
}))

describe('evaluateCountryRiskAuthorization', () => {
	beforeEach(() => {
		setMode('disabled')
		mockAuditEvent.mockClear()
		mockGetActivePolicy.mockReset()
		mockGetActivePolicy.mockImplementation(async () => null)
		mockGetPolicyActions.mockReset()
		mockGetPolicyActions.mockImplementation(async () => [])
		mockGetPolicyCountryRiskLevel.mockReset()
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'standard')
		mockHasActiveException.mockReset()
		mockHasActiveException.mockImplementation(async () => false)
		mockGetCountryProfile.mockReset()
		mockGetCountryProfile.mockImplementation(async () => null)
		delete process.env.COUNTRY_RISK_ALLOW_DECLARED_FALLBACK
	})

	afterEach(() => {
		mock.restore()
		delete process.env.COUNTRY_RISK_MODE
	})

	test('disabled mode always allows and never touches the database', async () => {
		setMode('disabled')
		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)

		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision).toEqual({ allowed: true, enforced: false, mode: 'disabled' })
		expect(mockGetActivePolicy).not.toHaveBeenCalled()
		expect(mockAuditEvent).not.toHaveBeenCalled()
	})

	test('monitor mode always returns allowed:true even when the hypothetical result is a block', async () => {
		setMode('monitor')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 1 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: 'XX',
			declaredCountry: 'XX',
			verificationStatus: 'verified',
		}))
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'restricted')

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.enforced).toBe(false)
		expect(decision.mode).toBe('monitor')
		expect(decision.reasonCode).toBe('country_restricted')
		expect(mockAuditEvent).toHaveBeenCalledTimes(1)
		const auditArg = mockAuditEvent.mock.calls[0][0] as Record<string, unknown>
		expect(auditArg.decisionAllowed).toBe(true)
		expect(auditArg.hypotheticalAllowed).toBe(false)
	})

	test('enforced mode with no active policy allows the action', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => null)

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.enforced).toBe(true)
		expect(decision.reasonCode).toBe('no_active_policy')
	})

	test('enforced mode allows an action not covered by the active policy', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 2 }))
		mockGetPolicyActions.mockImplementation(async () => ['send_assets'])

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.reasonCode).toBe('action_not_covered')
	})

	test('enforced mode allows the action when an active exception exists', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 3 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockHasActiveException.mockImplementation(async () => true)

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.reasonCode).toBe('active_exception')
	})

	test('enforced mode blocks and requires KYC completion when no country is available', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 4 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => null)

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(false)
		expect(decision.reasonCode).toBe('country_unavailable')
		expect(decision.requiredAction).toBe('complete_kyc')
	})

	test('enforced mode does not fall back to declared country unless explicitly configured', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 5 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: null,
			declaredCountry: 'US',
			verificationStatus: 'declared',
		}))

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(false)
		expect(decision.reasonCode).toBe('country_unavailable')
	})

	test('enforced mode allows standard-risk countries', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 6 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: 'US',
			declaredCountry: 'US',
			verificationStatus: 'verified',
		}))
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'standard')

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.riskLevel).toBe('standard')
		expect(decision.effectiveCountry).toBe('US')
	})

	test('enforced mode blocks restricted-risk countries and points to support', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 7 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: 'XX',
			declaredCountry: 'XX',
			verificationStatus: 'verified',
		}))
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'restricted')

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(false)
		expect(decision.reasonCode).toBe('country_restricted')
		expect(decision.requiredAction).toBe('contact_support')
	})

	test('enforced mode allows but flags enhanced_review countries for manual review', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 8 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: 'YY',
			declaredCountry: 'YY',
			verificationStatus: 'verified',
		}))
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'enhanced_review')

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.requiredAction).toBe('manual_review')
		expect(decision.reasonCode).toBe('country_enhanced_review')
	})

	test('a declared/verified mismatch never auto-blocks — it only raises a manual-review signal', async () => {
		setMode('enforced')
		mockGetActivePolicy.mockImplementation(async () => ({ id: 'p1', version: 9 }))
		mockGetPolicyActions.mockImplementation(async () => ['donate'])
		mockGetCountryProfile.mockImplementation(async () => ({
			verifiedCountry: 'US',
			declaredCountry: 'CA',
			verificationStatus: 'mismatched',
		}))
		mockGetPolicyCountryRiskLevel.mockImplementation(async () => 'standard')

		const { evaluateCountryRiskAuthorization } = await import(
			'../lib/compliance/authorization-service'
		)
		const decision = await evaluateCountryRiskAuthorization({ userId: 'u1', action: 'donate' })

		expect(decision.allowed).toBe(true)
		expect(decision.requiredAction).toBe('manual_review')
		expect(decision.reasonCode).toBe('mismatch_manual_review')
	})
})

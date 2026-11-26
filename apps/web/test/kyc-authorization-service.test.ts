import { describe, expect, test } from 'bun:test'
import type { KycAuthorizationAuditEvent } from '../lib/kyc/audit-log'
import { authorizeFinancialAction } from '../lib/kyc/authorization-service'
import type { CanonicalKycStatus, KycEnforcementMode, KycFinancialAction } from '../lib/kyc/types'

const createDeps = (options: {
	mode: KycEnforcementMode
	actions?: KycFinancialAction[]
	status?: CanonicalKycStatus
}) => {
	const recorded: KycAuthorizationAuditEvent[] = []
	return {
		deps: {
			getMode: () => options.mode,
			getEnforcedActions: () => options.actions ?? [],
			getStatus: async () => options.status ?? 'not_started',
			recordAudit: async (event: KycAuthorizationAuditEvent) => {
				recorded.push(event)
			},
		},
		recorded,
	}
}

describe('authorizeFinancialAction', () => {
	test('disabled mode always allows and never reads KYC or writes audit events', async () => {
		const { deps, recorded } = createDeps({ mode: 'disabled', status: 'rejected' })
		let statusReads = 0
		const result = await authorizeFinancialAction(
			{ userId: 'u1', action: 'donate' },
			{
				...deps,
				getStatus: async () => {
					statusReads += 1
					return 'rejected'
				},
			},
		)

		expect(result).toEqual({
			allowed: true,
			enforced: false,
			mode: 'disabled',
			currentKycStatus: 'not_started',
			policyResult: 'allow',
			reasonCode: 'disabled',
		})
		expect(statusReads).toBe(0)
		expect(recorded).toHaveLength(0)
	})

	test('monitor mode always returns allowed:true even when the hypothetical result is deny', async () => {
		const { deps, recorded } = createDeps({
			mode: 'monitor',
			actions: ['donate'],
			status: 'not_started',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'donate' }, deps)

		expect(result.allowed).toBe(true)
		expect(result.enforced).toBe(false)
		expect(result.mode).toBe('monitor')
		expect(result.policyResult).toBe('deny')
		expect(result.reasonCode).toBe('kyc_not_started')
		expect(recorded).toHaveLength(1)
		expect(recorded[0]?.decisionAllowed).toBe(true)
		expect(recorded[0]?.hypotheticalAllowed).toBe(false)
	})

	test('enforced mode allows actions that are not in KYC_ENFORCED_ACTIONS', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: ['send_assets', 'use_off_ramp'],
			status: 'not_started',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'donate' }, deps)

		expect(result.allowed).toBe(true)
		expect(result.policyResult).toBe('allow')
		expect(result.reasonCode).toBe('action_not_covered')
	})

	test('enforced mode allows configured actions when Didit status is approved', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: ['donate'],
			status: 'approved',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'donate' }, deps)

		expect(result.allowed).toBe(true)
		expect(result.enforced).toBe(true)
		expect(result.policyResult).toBe('allow')
		expect(result.reasonCode).toBe('kyc_approved')
		expect(result.requiredAction).toBeUndefined()
	})

	test('enforced mode treats verified as approved via canonical status', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: ['send_assets'],
			status: 'approved',
		})
		const result = await authorizeFinancialAction(
			{ userId: 'u1', action: 'send_assets', amount: 12, asset: 'XLM' },
			deps,
		)

		expect(result.allowed).toBe(true)
		expect(result.currentKycStatus).toBe('approved')
	})

	test('enforced mode denies configured actions without approved KYC', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: ['use_off_ramp'],
			status: 'pending',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'use_off_ramp' }, deps)

		expect(result.allowed).toBe(false)
		expect(result.enforced).toBe(true)
		expect(result.policyResult).toBe('deny')
		expect(result.reasonCode).toBe('kyc_pending')
		expect(result.requiredAction).toBe('wait_for_review')
	})

	test('enforced mode returns start_kyc when verification has not started', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: ['submit_campaign'],
			status: 'not_started',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'submit_campaign' }, deps)

		expect(result.allowed).toBe(false)
		expect(result.requiredAction).toBe('start_kyc')
		expect(result.reasonCode).toBe('kyc_not_started')
	})

	test('enforced with an empty action list never blocks', async () => {
		const { deps } = createDeps({
			mode: 'enforced',
			actions: [],
			status: 'rejected',
		})
		const result = await authorizeFinancialAction({ userId: 'u1', action: 'donate' }, deps)

		expect(result.allowed).toBe(true)
		expect(result.reasonCode).toBe('action_not_covered')
	})

	test('enforced mode denies remaining configured actions with the matching next step', async () => {
		const cases: Array<{
			action: KycFinancialAction
			status: CanonicalKycStatus
			reasonCode: string
			requiredAction: string
		}> = [
			{
				action: 'release_escrow_funds',
				status: 'expired',
				reasonCode: 'kyc_expired',
				requiredAction: 'start_kyc',
			},
			{
				action: 'use_on_ramp',
				status: 'rejected',
				reasonCode: 'kyc_rejected',
				requiredAction: 'contact_support',
			},
			{
				action: 'send_assets',
				status: 'manual_review',
				reasonCode: 'kyc_manual_review',
				requiredAction: 'wait_for_review',
			},
			{
				action: 'donate',
				status: 'in_review',
				reasonCode: 'kyc_in_review',
				requiredAction: 'wait_for_review',
			},
			{
				action: 'submit_campaign',
				status: 'provider_unavailable',
				reasonCode: 'kyc_provider_unavailable',
				requiredAction: 'wait_for_review',
			},
		]

		for (const item of cases) {
			const { deps } = createDeps({
				mode: 'enforced',
				actions: [item.action],
				status: item.status,
			})
			const result = await authorizeFinancialAction({ userId: 'u1', action: item.action }, deps)
			expect(result.allowed).toBe(false)
			expect(result.reasonCode).toBe(item.reasonCode)
			expect(result.requiredAction).toBe(item.requiredAction)
			expect(result.currentKycStatus).toBe(item.status)
		}
	})
})

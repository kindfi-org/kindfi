import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

import { authorizeFinancialAction } from '../lib/kyc/authorization-service'
import type {
	AuthorizeFinancialActionDeps,
	AuthorizeFinancialActionInput,
	CanonicalKycStatus,
	KycEnforcementMode,
	KycFinancialAction,
} from '../lib/kyc/types'
import { logger } from '../lib/logger'

const baseInput: AuthorizeFinancialActionInput = {
	userId: 'user-1',
	action: 'donate',
	amount: 100,
	asset: 'XLM',
	network: 'testnet',
}

function buildDeps(overrides: {
	mode: KycEnforcementMode
	status: CanonicalKycStatus
	enforced?: KycFinancialAction[]
	recordAudit: AuthorizeFinancialActionDeps['recordAudit']
}): AuthorizeFinancialActionDeps {
	return {
		getMode: () => overrides.mode,
		getEnforcedActions: () => overrides.enforced ?? ['donate'],
		getStatus: async () => overrides.status,
		recordAudit: overrides.recordAudit,
	}
}

describe('authorizeFinancialAction audit resilience', () => {
	let warnSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		warnSpy = spyOn(logger, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		warnSpy.mockRestore()
	})

	test('monitor mode returns the computed decision when audit fails', async () => {
		const recordAudit = mock(() => Promise.reject(new Error('supabase down')))

		const result = await authorizeFinancialAction(
			baseInput,
			buildDeps({ mode: 'monitor', status: 'not_started', recordAudit }),
		)

		expect(recordAudit).toHaveBeenCalledTimes(1)
		expect(result.allowed).toBe(true)
		expect(result.enforced).toBe(false)
		expect(result.mode).toBe('monitor')
		expect(result.currentKycStatus).toBe('not_started')
		expect(result.policyResult).toBe('deny')
	})

	test('enforced mode preserves an already-approved allow decision when audit fails', async () => {
		const recordAudit = mock(() => Promise.reject(new Error('write timeout')))

		const result = await authorizeFinancialAction(
			baseInput,
			buildDeps({ mode: 'enforced', status: 'approved', recordAudit }),
		)

		expect(recordAudit).toHaveBeenCalledTimes(1)
		expect(result.allowed).toBe(true)
		expect(result.enforced).toBe(true)
		expect(result.policyResult).toBe('allow')
		expect(result.reasonCode).toBe('kyc_approved')
	})

	test('enforced mode preserves a deny decision when audit fails', async () => {
		const recordAudit = mock(() => Promise.reject(new Error('rls violation')))

		const result = await authorizeFinancialAction(
			baseInput,
			buildDeps({ mode: 'enforced', status: 'pending', recordAudit }),
		)

		expect(recordAudit).toHaveBeenCalledTimes(1)
		expect(result.allowed).toBe(false)
		expect(result.enforced).toBe(true)
		expect(result.policyResult).toBe('deny')
		expect(result.reasonCode).toBe('kyc_pending')
		expect(result.requiredAction).toBe('wait_for_review')
	})

	test('successful audit path still returns the same decision object', async () => {
		const recordAudit = mock(() => Promise.resolve())

		const result = await authorizeFinancialAction(
			baseInput,
			buildDeps({ mode: 'enforced', status: 'approved', recordAudit }),
		)

		expect(recordAudit).toHaveBeenCalledTimes(1)
		expect(result.allowed).toBe(true)
		expect(result.policyResult).toBe('allow')
		expect(warnSpy).not.toHaveBeenCalled()
	})

	test('audit failure log includes limited context and omits amount, asset, and network', async () => {
		const recordAudit = mock(() => Promise.reject(new Error('supabase down')))

		await authorizeFinancialAction(
			baseInput,
			buildDeps({ mode: 'enforced', status: 'approved', recordAudit }),
		)

		expect(warnSpy).toHaveBeenCalledTimes(1)
		const [message, data] = warnSpy.mock.calls[0]
		expect(message).toBe('[kyc] Failed to record authorization audit')
		expect(data).toEqual({
			error: 'supabase down',
			userId: 'user-1',
			action: 'donate',
			mode: 'enforced',
		})
		expect(data).not.toHaveProperty('amount')
		expect(data).not.toHaveProperty('asset')
		expect(data).not.toHaveProperty('network')
	})
})

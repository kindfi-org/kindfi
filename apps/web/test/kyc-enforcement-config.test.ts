import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

const mockWarn = mock(() => {})

mock.module('@/lib/logger', () => ({
	logger: { warn: mockWarn, error: () => {}, info: () => {} },
}))

describe('getKycEnforcementMode', () => {
	beforeEach(() => {
		mockWarn.mockClear()
	})

	afterEach(() => {
		delete process.env.KYC_ENFORCEMENT_MODE
		delete process.env.KYC_ENFORCED_ACTIONS
	})

	test('defaults to disabled when unset', async () => {
		delete process.env.KYC_ENFORCEMENT_MODE
		const { getKycEnforcementMode } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcementMode()).toBe('disabled')
	})

	test('accepts monitor', async () => {
		process.env.KYC_ENFORCEMENT_MODE = 'monitor'
		const { getKycEnforcementMode } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcementMode()).toBe('monitor')
	})

	test('accepts enforced', async () => {
		process.env.KYC_ENFORCEMENT_MODE = 'enforced'
		const { getKycEnforcementMode } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcementMode()).toBe('enforced')
	})

	test('falls back to disabled and logs a warning for an invalid value', async () => {
		process.env.KYC_ENFORCEMENT_MODE = 'on'
		const { getKycEnforcementMode } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcementMode()).toBe('disabled')
		expect(mockWarn).toHaveBeenCalledTimes(1)
	})
})

describe('getKycEnforcedActions', () => {
	beforeEach(() => {
		mockWarn.mockClear()
		delete process.env.KYC_ENFORCED_ACTIONS
	})

	afterEach(() => {
		delete process.env.KYC_ENFORCED_ACTIONS
	})

	test('defaults to an empty list when unset', async () => {
		const { getKycEnforcedActions } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcedActions()).toEqual([])
	})

	test('parses a comma-separated list', async () => {
		process.env.KYC_ENFORCED_ACTIONS = 'send_assets,use_off_ramp'
		const { getKycEnforcedActions } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcedActions()).toEqual(['send_assets', 'use_off_ramp'])
	})

	test('skips unknown actions and warns', async () => {
		process.env.KYC_ENFORCED_ACTIONS = 'send_assets,not_a_real_action,donate'
		const { getKycEnforcedActions } = await import('../lib/kyc/enforcement-config')
		expect(getKycEnforcedActions()).toEqual(['send_assets', 'donate'])
		expect(mockWarn).toHaveBeenCalled()
	})
})

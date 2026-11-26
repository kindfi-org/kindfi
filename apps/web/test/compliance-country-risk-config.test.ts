import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

const mockWarn = mock(() => {})

mock.module('@/lib/logger', () => ({
	logger: { warn: mockWarn, error: () => {}, info: () => {} },
}))

describe('getCountryRiskMode', () => {
	beforeEach(() => {
		mockWarn.mockClear()
	})

	afterEach(() => {
		delete process.env.COUNTRY_RISK_MODE
	})

	test('defaults to disabled when unset', async () => {
		delete process.env.COUNTRY_RISK_MODE
		const { getCountryRiskMode } = await import('../lib/compliance/country-risk-config')
		expect(getCountryRiskMode()).toBe('disabled')
	})

	test('accepts monitor', async () => {
		process.env.COUNTRY_RISK_MODE = 'monitor'
		const { getCountryRiskMode } = await import('../lib/compliance/country-risk-config')
		expect(getCountryRiskMode()).toBe('monitor')
	})

	test('accepts enforced', async () => {
		process.env.COUNTRY_RISK_MODE = 'enforced'
		const { getCountryRiskMode } = await import('../lib/compliance/country-risk-config')
		expect(getCountryRiskMode()).toBe('enforced')
	})

	test('falls back to disabled and logs a warning for an invalid value', async () => {
		process.env.COUNTRY_RISK_MODE = 'nonsense'
		const { getCountryRiskMode } = await import('../lib/compliance/country-risk-config')
		expect(getCountryRiskMode()).toBe('disabled')
		expect(mockWarn).toHaveBeenCalledTimes(1)
	})
})

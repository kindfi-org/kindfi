import { describe, expect, test } from 'bun:test'
import { buildFundEscrowApiPath, resolveFundEscrowApiVersion } from './resolve-escrow-api-version'

describe('resolveFundEscrowApiVersion', () => {
	test('mainnet always uses v1 fund route even when contract metadata says v2', () => {
		expect(resolveFundEscrowApiVersion('mainnet', 'v2')).toBe('v1')
		expect(resolveFundEscrowApiVersion('mainnet', 'v1')).toBe('v1')
	})

	test('testnet uses contract metadata version', () => {
		expect(resolveFundEscrowApiVersion('development', 'v2')).toBe('v2')
		expect(resolveFundEscrowApiVersion('development', 'v1')).toBe('v1')
	})
})

describe('buildFundEscrowApiPath', () => {
	test('v1 path is fund-escrow', () => {
		expect(buildFundEscrowApiPath('multi-release', 'v1')).toBe('/escrow/multi-release/fund-escrow')
	})

	test('v2 path is /v2/fund', () => {
		expect(buildFundEscrowApiPath('multi-release', 'v2')).toBe('/escrow/multi-release/v2/fund')
	})
})

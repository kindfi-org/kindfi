import { describe, expect, test } from 'bun:test'

describe('Trustless Work proxy path rules', () => {
	test('allows known SDK path prefixes', async () => {
		const { isAllowedTrustlessWorkPath } = await import('../lib/config/trustless-work-proxy.paths')

		expect(isAllowedTrustlessWorkPath('helper/get-multiple-escrow-balance')).toBe(true)
		expect(isAllowedTrustlessWorkPath('deployer/multi-release')).toBe(true)
		expect(isAllowedTrustlessWorkPath('escrow/single-release/fund-escrow')).toBe(true)
		expect(isAllowedTrustlessWorkPath('indexer/update-from-txHash')).toBe(true)
	})

	test('rejects unknown paths', async () => {
		const { isAllowedTrustlessWorkPath } = await import('../lib/config/trustless-work-proxy.paths')

		expect(isAllowedTrustlessWorkPath('admin/users')).toBe(false)
		expect(isAllowedTrustlessWorkPath('../helper/get-multiple-escrow-balance')).toBe(false)
	})

	test('marks helper reads as public GET', async () => {
		const { isPublicTrustlessWorkRead, requiresTrustlessWorkAuth } = await import(
			'../lib/config/trustless-work-proxy.paths'
		)

		expect(isPublicTrustlessWorkRead('GET', 'helper/get-multiple-escrow-balance')).toBe(true)
		expect(requiresTrustlessWorkAuth('GET', 'helper/get-multiple-escrow-balance')).toBe(false)
		expect(requiresTrustlessWorkAuth('POST', 'helper/send-transaction')).toBe(true)
		expect(requiresTrustlessWorkAuth('GET', 'helper/send-transaction')).toBe(true)
	})
})

describe('Trustless Work config', () => {
	test('getTrustlessWorkApiKey reads server-only env var', async () => {
		const previous = process.env.TRUSTLESS_WORK_API_KEY
		process.env.TRUSTLESS_WORK_API_KEY = 'server-key'
		delete process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY

		const { getTrustlessWorkApiKey } = await import('../lib/config/trustless-work.config')
		expect(getTrustlessWorkApiKey()).toBe('server-key')

		if (previous === undefined) {
			delete process.env.TRUSTLESS_WORK_API_KEY
		} else {
			process.env.TRUSTLESS_WORK_API_KEY = previous
		}
	})

	test('getTrustlessWorkClientBaseUrl points at the proxy route', async () => {
		process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

		const { getTrustlessWorkClientBaseUrl } = await import('../lib/config/trustless-work.config')

		expect(getTrustlessWorkClientBaseUrl()).toBe('http://localhost:3000/api/trustless-work')
	})
})

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

describe('Legacy escrow API routes', () => {
	test('retired /api/escrow paths return 410 Gone', async () => {
		const { POST } = await import('../app/api/escrow/[[...path]]/route')
		const response = await POST()
		const body = await response.json()

		expect(response.status).toBe(410)
		expect(body.error).toBe('Gone')
		expect(body.message).toContain('/api/trustless-work')
	})
})

describe('Escrow USDC defaults', () => {
	test('uses testnet USDC when Trustless Work network is development', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'development'
		delete process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS
		delete process.env.USDC_CONTRACT_ADDRESS

		const { getDefaultUsdcContractAddress, TESTNET_USDC_TRUSTLINE_ADDRESS } = await import(
			'../lib/constants/escrow'
		)

		expect(getDefaultUsdcContractAddress()).toBe(TESTNET_USDC_TRUSTLINE_ADDRESS)
	})

	test('uses mainnet USDC when Trustless Work network is mainnet', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		delete process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS
		delete process.env.USDC_CONTRACT_ADDRESS
		delete process.env.MAINNET_PUBLIC_USDC_ISSUER

		const { getDefaultUsdcContractAddress, MAINNET_USDC_TRUSTLINE_ADDRESS } = await import(
			'../lib/constants/escrow'
		)

		expect(getDefaultUsdcContractAddress()).toBe(MAINNET_USDC_TRUSTLINE_ADDRESS)
	})

	test('explicit USDC env override wins over network default', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS =
			'CCUSTOMUSDCADDRESS12345678901234567890123456789012'

		const { getDefaultUsdcContractAddress } = await import('../lib/constants/escrow')

		expect(getDefaultUsdcContractAddress()).toBe(
			'CCUSTOMUSDCADDRESS12345678901234567890123456789012',
		)

		delete process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS
	})
})

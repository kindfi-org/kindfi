import { describe, expect, test } from 'bun:test'

describe('Trustless Work RPC config', () => {
	test('uses mainnet Soroban RPC when Trustless Work network is mainnet', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		delete process.env.RPC_URL

		const { getTrustlessWorkStellarRpcUrl, TRUSTLESS_WORK_STELLAR_RPC_URLS } = await import(
			'../lib/config/trustless-work.config'
		)

		expect(getTrustlessWorkStellarRpcUrl()).toBe(TRUSTLESS_WORK_STELLAR_RPC_URLS.mainnet)
	})

	test('RPC_URL override wins over network default for getTrustlessWorkStellarRpcUrl', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		process.env.RPC_URL = 'https://custom-rpc.example.com'

		const { getTrustlessWorkStellarRpcUrl } = await import('../lib/config/trustless-work.config')

		expect(getTrustlessWorkStellarRpcUrl()).toBe('https://custom-rpc.example.com')

		delete process.env.RPC_URL
	})

	test('network-specific submit RPC ignores RPC_URL override', async () => {
		process.env.RPC_URL = 'https://soroban-testnet.stellar.org'

		const { getTrustlessWorkStellarRpcUrlForNetwork, TRUSTLESS_WORK_STELLAR_RPC_URLS } =
			await import('../lib/config/trustless-work.config')

		expect(getTrustlessWorkStellarRpcUrlForNetwork('mainnet')).toBe(
			TRUSTLESS_WORK_STELLAR_RPC_URLS.mainnet,
		)
		expect(getTrustlessWorkStellarRpcUrlForNetwork('development')).toBe(
			TRUSTLESS_WORK_STELLAR_RPC_URLS.development,
		)

		delete process.env.RPC_URL
	})
})

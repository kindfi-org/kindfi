import { describe, expect, test } from 'bun:test'

describe('Stellar network config', () => {
	test('uses mainnet passphrase when Trustless Work network is mainnet', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE

		const {
			getClientStellarNetworkId,
			getClientStellarNetworkPassphrase,
			STELLAR_MAINNET_PASSPHRASE,
		} = await import('../lib/config/stellar-network.config')

		expect(getClientStellarNetworkId()).toBe('mainnet')
		expect(getClientStellarNetworkPassphrase()).toBe(STELLAR_MAINNET_PASSPHRASE)
	})

	test('uses testnet passphrase when Trustless Work network is development', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'development'
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE

		const {
			getClientStellarNetworkId,
			getClientStellarNetworkPassphrase,
			STELLAR_TESTNET_PASSPHRASE,
		} = await import('../lib/config/stellar-network.config')

		expect(getClientStellarNetworkId()).toBe('testnet')
		expect(getClientStellarNetworkPassphrase()).toBe(STELLAR_TESTNET_PASSPHRASE)
	})

	test('NEXT_PUBLIC_STELLAR_NETWORK override wins over Trustless Work network', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'development'
		process.env.NEXT_PUBLIC_STELLAR_NETWORK = 'mainnet'
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE

		const {
			getClientStellarNetworkId,
			getClientStellarNetworkPassphrase,
			STELLAR_MAINNET_PASSPHRASE,
		} = await import('../lib/config/stellar-network.config')

		expect(getClientStellarNetworkId()).toBe('mainnet')
		expect(getClientStellarNetworkPassphrase()).toBe(STELLAR_MAINNET_PASSPHRASE)
	})
})

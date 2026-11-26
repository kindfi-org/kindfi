import { describe, expect, test } from 'bun:test'
import {
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import {
	getWalletTransferConfig,
	WALLET_TRANSFER_HORIZON_URLS,
} from '~/lib/config/wallet-transfer.config'
import {
	MAINNET_USDC_TRUSTLINE_ADDRESS,
	TESTNET_USDC_TRUSTLINE_ADDRESS,
} from '~/lib/constants/escrow'

describe('getWalletTransferConfig', () => {
	test('returns testnet config when Trustless Work network is development', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'development'
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE
		delete process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS

		const result = getWalletTransferConfig()

		expect(result.ok).toBe(true)
		if (!result.ok) return

		expect(result.config.networkId).toBe('testnet')
		expect(result.config.networkPassphrase).toBe(STELLAR_TESTNET_PASSPHRASE)
		expect(result.config.horizonUrl).toBe(WALLET_TRANSFER_HORIZON_URLS.testnet)
		expect(result.config.usdc.issuer).toBe(TESTNET_USDC_TRUSTLINE_ADDRESS)
		expect(result.config.explorerNetwork).toBe('testnet')
	})

	test('returns mainnet config when Trustless Work network is mainnet', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK
		delete process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE
		delete process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS

		const result = getWalletTransferConfig()

		expect(result.ok).toBe(true)
		if (!result.ok) return

		expect(result.config.networkId).toBe('mainnet')
		expect(result.config.networkPassphrase).toBe(STELLAR_MAINNET_PASSPHRASE)
		expect(result.config.horizonUrl).toBe(WALLET_TRANSFER_HORIZON_URLS.mainnet)
		expect(result.config.usdc.issuer).toBe(MAINNET_USDC_TRUSTLINE_ADDRESS)
	})

	test('fails closed when network passphrase mismatches network id', async () => {
		process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK = 'mainnet'
		process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE = STELLAR_TESTNET_PASSPHRASE

		const result = getWalletTransferConfig()

		expect(result.ok).toBe(false)
		if (result.ok) return

		expect(result.error).toContain('passphrase')
	})
})

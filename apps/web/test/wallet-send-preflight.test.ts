import { describe, expect, test } from 'bun:test'
import { TESTNET_USDC_TRUSTLINE_ADDRESS } from '~/lib/constants/escrow'
import {
	assertDestinationUsdcTrustline,
	assertUsdcTrustlineReady,
	assertXlmSpendable,
	getWalletBalances,
} from '~/lib/wallet-send/horizon/balances'
import type { HorizonAccountResponse } from '~/lib/wallet-send/types'

const baseAccount = (): HorizonAccountResponse => ({
	id: 'source',
	account_id: 'GBBO453X3XUPUCSEYSLRDA7S4YPUJ7S3NDKCB3W7V3J4K3QY533IQZUE',
	sequence: '1',
	subentry_count: 1,
	balances: [
		{
			asset_type: 'native',
			balance: '25',
			selling_liabilities: '0',
		},
		{
			asset_type: 'credit_alphanum4',
			asset_code: 'USDC',
			asset_issuer: TESTNET_USDC_TRUSTLINE_ADDRESS,
			balance: '100',
			limit: '1000000',
			is_authorized: true,
			selling_liabilities: '0',
		},
	],
})

describe('wallet send balances', () => {
	test('computes spendable XLM after reserve', () => {
		const balances = getWalletBalances(baseAccount(), {
			networkId: 'testnet',
			networkPassphrase: 'Test SDF Network ; September 2015',
			horizonUrl: 'https://horizon-testnet.stellar.org',
			usdc: { code: 'USDC', issuer: TESTNET_USDC_TRUSTLINE_ADDRESS },
			explorerNetwork: 'testnet',
		})

		expect(balances.XLM.available).toBe('23.5')
		expect(balances.USDC.available).toBe('100')
	})

	test('rejects USDC send when source trustline missing', () => {
		const account = baseAccount()
		account.balances = account.balances.filter((line) => line.asset_type === 'native')
		const result = assertUsdcTrustlineReady(
			account,
			{
				networkId: 'testnet',
				networkPassphrase: 'Test SDF Network ; September 2015',
				horizonUrl: 'https://horizon-testnet.stellar.org',
				usdc: { code: 'USDC', issuer: TESTNET_USDC_TRUSTLINE_ADDRESS },
				explorerNetwork: 'testnet',
			},
			'10',
		)

		expect(result.ok).toBe(false)
	})

	test('rejects XLM send below reserve', () => {
		const account = baseAccount()
		account.balances[0].balance = '1'
		const result = assertXlmSpendable(account, '1')
		expect(result.ok).toBe(false)
	})

	test('validates destination USDC trustline limit', () => {
		const destination = baseAccount()
		destination.balances[1].limit = '100'
		destination.balances[1].balance = '95'

		const result = assertDestinationUsdcTrustline(
			destination,
			{
				networkId: 'testnet',
				networkPassphrase: 'Test SDF Network ; September 2015',
				horizonUrl: 'https://horizon-testnet.stellar.org',
				usdc: { code: 'USDC', issuer: TESTNET_USDC_TRUSTLINE_ADDRESS },
				explorerNetwork: 'testnet',
			},
			'10',
		)

		expect(result.ok).toBe(false)
	})
})

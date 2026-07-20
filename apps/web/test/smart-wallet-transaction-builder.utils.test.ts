import { describe, expect, test } from 'bun:test'
import {
	getFundingAccount,
	getSmartWalletAccount,
} from '../lib/stellar/smart-wallet-transaction-builder.utils'

describe('getSmartWalletAccount', () => {
	test('returns an Account at sequence 0 for the given address', () => {
		const address = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
		const account = getSmartWalletAccount(address)
		expect(account.accountId()).toBe(address)
		expect(account.sequenceNumber()).toBe('0')
	})
})

describe('getFundingAccount', () => {
	test('throws when no funding keypair is configured', async () => {
		const ctx = {
			server: {} as never,
			networkPassphrase: 'Test SDF Network ; September 2015',
			fee: '5000000',
		}
		await expect(getFundingAccount(ctx)).rejects.toThrow(
			'Funding keypair required for fee sponsorship',
		)
	})
})

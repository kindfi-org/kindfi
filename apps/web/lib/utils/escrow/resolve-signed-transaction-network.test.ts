import { describe, expect, test } from 'bun:test'
import { Account, Asset, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk'
import {
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import { resolveSignedTransactionNetwork } from './resolve-signed-transaction-network'

const buildSignedTransaction = (networkPassphrase: string): string => {
	const source = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const transaction = new TransactionBuilder(account, {
		fee: '100',
		networkPassphrase,
	})
		.addOperation(
			Operation.payment({
				destination: Keypair.random().publicKey(),
				asset: Asset.native(),
				amount: '1',
			}),
		)
		.setTimeout(30)
		.build()

	transaction.sign(source)
	return transaction.toXDR()
}

describe('resolveSignedTransactionNetwork', () => {
	test('detects mainnet signatures', () => {
		const signedXdr = buildSignedTransaction(STELLAR_MAINNET_PASSPHRASE)
		const resolved = resolveSignedTransactionNetwork(signedXdr)

		expect(resolved?.networkId).toBe('mainnet')
		expect(resolved?.networkPassphrase).toBe(STELLAR_MAINNET_PASSPHRASE)
	})

	test('detects testnet signatures', () => {
		const signedXdr = buildSignedTransaction(STELLAR_TESTNET_PASSPHRASE)
		const resolved = resolveSignedTransactionNetwork(signedXdr)

		expect(resolved?.networkId).toBe('testnet')
		expect(resolved?.networkPassphrase).toBe(STELLAR_TESTNET_PASSPHRASE)
	})

	test('returns null for invalid XDR', () => {
		expect(resolveSignedTransactionNetwork('not-valid-xdr')).toBeNull()
	})
})

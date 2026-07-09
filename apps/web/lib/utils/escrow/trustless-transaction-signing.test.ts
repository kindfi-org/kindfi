import { describe, expect, test } from 'bun:test'
import { Account, Asset, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk'
import {
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import {
	assertSignedTrustlessTransaction,
	TX_BAD_AUTH_MESSAGE,
} from '~/lib/utils/escrow/trustless-transaction-signing'

const buildSignedTransaction = (networkPassphrase: string, source = Keypair.random()): string => {
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

const buildSignedFeeBump = (networkPassphrase: string, source = Keypair.random()): string => {
	const feeSource = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const inner = new TransactionBuilder(account, {
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

	inner.sign(source)

	const feeBump = TransactionBuilder.buildFeeBumpTransaction(
		feeSource,
		'200',
		inner,
		networkPassphrase,
	)
	feeBump.sign(feeSource)
	return feeBump.toXDR()
}

describe('assertSignedTrustlessTransaction', () => {
	test('accepts a correctly signed testnet transaction', () => {
		const source = Keypair.random()
		const signedXdr = buildSignedTransaction(STELLAR_TESTNET_PASSPHRASE, source)

		expect(() =>
			assertSignedTrustlessTransaction(signedXdr, source.publicKey(), STELLAR_TESTNET_PASSPHRASE),
		).not.toThrow()
	})

	test('accepts a fee-bump envelope signed by the inner escrow source', () => {
		const source = Keypair.random()
		const signedXdr = buildSignedFeeBump(STELLAR_TESTNET_PASSPHRASE, source)

		expect(() =>
			assertSignedTrustlessTransaction(signedXdr, source.publicKey(), STELLAR_TESTNET_PASSPHRASE),
		).not.toThrow()
	})

	test('rejects a mainnet signature when verifying as testnet', () => {
		const source = Keypair.random()
		const signedXdr = buildSignedTransaction(STELLAR_MAINNET_PASSPHRASE, source)

		expect(() =>
			assertSignedTrustlessTransaction(signedXdr, source.publicKey(), STELLAR_TESTNET_PASSPHRASE),
		).toThrow(TX_BAD_AUTH_MESSAGE)
	})
})

import { describe, expect, test } from 'bun:test'
import { Account, Asset, Keypair, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { classifySignedXdrAction } from '~/lib/services/classify-trustless-signed-xdr.service'

const PASSPHRASE = 'Test SDF Network ; September 2015'

const buildSignedPayment = (): string => {
	const source = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: PASSPHRASE })
		.addOperation(
			Operation.payment({
				destination: Keypair.random().publicKey(),
				asset: Asset.native(),
				amount: '10',
			}),
		)
		.setTimeout(30)
		.build()
	transaction.sign(source)
	return transaction.toXDR()
}

const buildInvokeContract = (functionName: string): string => {
	const source = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const contractAddress = xdr.ScAddress.scAddressTypeContract(
		Array.from(new Uint8Array(32).fill(7)) as unknown as xdr.ContractId,
	)
	const invoke = Operation.invokeHostFunction({
		func: xdr.HostFunction.hostFunctionTypeInvokeContract(
			new xdr.InvokeContractArgs({
				contractAddress,
				functionName,
				args: [],
			}),
		),
		auth: [],
	})
	const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: PASSPHRASE })
		.addOperation(invoke)
		.setTimeout(30)
		.build()
	transaction.sign(source)
	return transaction.toXDR()
}

const buildSignedFeeBump = (functionName: string): string => {
	const source = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const contractAddress = xdr.ScAddress.scAddressTypeContract(
		Array.from(new Uint8Array(32).fill(7)) as unknown as xdr.ContractId,
	)
	const invoke = Operation.invokeHostFunction({
		func: xdr.HostFunction.hostFunctionTypeInvokeContract(
			new xdr.InvokeContractArgs({
				contractAddress,
				functionName,
				args: [],
			}),
		),
		auth: [],
	})
	const inner = new TransactionBuilder(account, {
		fee: '100',
		networkPassphrase: PASSPHRASE,
	})
		.addOperation(invoke)
		.setTimeout(30)
		.build()
	inner.sign(source)

	const feeSource = Keypair.random()
	const feeBump = TransactionBuilder.buildFeeBumpTransaction(feeSource, '200', inner, PASSPHRASE)
	feeBump.sign(feeSource)
	return feeBump.toXDR()
}

describe('classifySignedXdrAction', () => {
	test('classifies a native payment as send_assets', () => {
		expect(classifySignedXdrAction(buildSignedPayment())).toBe('send_assets')
	})

	test('classifies an escrow releaseFunds invoke as release_escrow_funds', () => {
		expect(classifySignedXdrAction(buildInvokeContract('releaseFunds'))).toBe(
			'release_escrow_funds',
		)
	})

	test('classifies an escrow fundEscrow invoke as donate', () => {
		expect(classifySignedXdrAction(buildInvokeContract('fundEscrow'))).toBe('donate')
	})

	test('classifies an unknown contract invoke as send_assets', () => {
		expect(classifySignedXdrAction(buildInvokeContract('deployEscrow'))).toBe('send_assets')
	})

	test('unwraps fee-bump envelopes before classifying', () => {
		expect(classifySignedXdrAction(buildSignedFeeBump('releaseFunds'))).toBe('release_escrow_funds')
	})

	test('falls back to send_assets for unparseable XDR', () => {
		expect(classifySignedXdrAction('not-a-valid-xdr')).toBe('send_assets')
		expect(classifySignedXdrAction('')).toBe('send_assets')
	})
})

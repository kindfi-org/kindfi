import { Asset, TransactionBuilder } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import type { ValidatedWalletSendPayment } from '~/lib/wallet-send/types'
import { compareDecimalAmounts } from '~/lib/wallet-send/validation/amount'

export class WalletSendVerificationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'WalletSendVerificationError'
	}
}

const memoMatches = (
	payment: ValidatedWalletSendPayment,
	transactionMemo: { type: string; value?: string | Buffer | number | null },
): boolean => {
	if (payment.memo.type === 'none') {
		return !transactionMemo.type || transactionMemo.type === 'none'
	}

	if (payment.memo.type === 'text') {
		return transactionMemo.type === 'text' && transactionMemo.value === payment.memo.value
	}

	return transactionMemo.type === 'id' && String(transactionMemo.value ?? '') === payment.memo.value
}

export const verifyPaymentTransactionXdr = (
	xdr: string,
	sourceAddress: string,
	payment: ValidatedWalletSendPayment,
	config: WalletTransferConfig,
): void => {
	const transaction = TransactionBuilder.fromXDR(xdr, config.networkPassphrase)
	const source = transaction.source

	if (source !== sourceAddress) {
		throw new WalletSendVerificationError(
			'Transaction source does not match your connected wallet.',
		)
	}

	if (transaction.operations.length !== 1) {
		throw new WalletSendVerificationError('Unexpected transaction operations detected.')
	}

	const [operation] = transaction.operations
	if (operation.type !== 'payment') {
		throw new WalletSendVerificationError('Transaction must contain a single payment operation.')
	}

	if (operation.destination !== payment.destination) {
		throw new WalletSendVerificationError(
			'Transaction destination does not match the reviewed address.',
		)
	}

	if (compareDecimalAmounts(String(operation.amount), payment.amount) !== 0) {
		throw new WalletSendVerificationError('Transaction amount does not match the reviewed amount.')
	}

	if (payment.asset === 'XLM') {
		const asset = operation.asset as Asset
		if (!(asset instanceof Asset ? asset.isNative() : asset.type === 'native')) {
			throw new WalletSendVerificationError('Transaction asset must be native XLM.')
		}
	} else if (
		operation.asset.type !== 'credit_alphanum4' ||
		operation.asset.code !== config.usdc.code ||
		operation.asset.issuer !== config.usdc.issuer
	) {
		throw new WalletSendVerificationError(
			'Transaction USDC issuer does not match the configured asset.',
		)
	}

	if (!memoMatches(payment, transaction.memo)) {
		throw new WalletSendVerificationError('Transaction memo does not match the reviewed memo.')
	}
}

export const verifySignedPaymentTransactionXdr = (
	signedXdr: string,
	sourceAddress: string,
	payment: ValidatedWalletSendPayment,
	config: WalletTransferConfig,
): void => {
	verifyPaymentTransactionXdr(signedXdr, sourceAddress, payment, config)
}

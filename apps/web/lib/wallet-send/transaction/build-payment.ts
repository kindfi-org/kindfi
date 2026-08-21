import { BASE_FEE, Operation, TransactionBuilder } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import type { HorizonAccountResponse, ValidatedWalletSendPayment } from '~/lib/wallet-send/types'

export type BuiltPaymentTransaction = {
	unsignedXdr: string
	estimatedFeeXlm: string
}

export const buildPaymentTransaction = (
	sourceAccount: HorizonAccountResponse,
	payment: ValidatedWalletSendPayment,
	config: WalletTransferConfig,
): BuiltPaymentTransaction => {
	const sequence = sourceAccount.sequence
	const builder = new TransactionBuilder(
		{
			accountId: () => sourceAccount.account_id,
			sequenceNumber: () => sequence,
			incrementSequenceNumber: () => {
				sourceAccount.sequence = (Number.parseInt(sequence, 10) + 1).toString()
			},
		},
		{
			fee: BASE_FEE,
			networkPassphrase: config.networkPassphrase,
		},
	)

	builder.addOperation(
		Operation.payment({
			destination: payment.destination,
			asset: payment.paymentAsset,
			amount: payment.amount,
		}),
	)

	if (payment.memoObject) {
		builder.addMemo(payment.memoObject)
	}

	const transaction = builder.setTimeout(180).build()

	return {
		unsignedXdr: transaction.toXDR(),
		estimatedFeeXlm: '0.00001',
	}
}

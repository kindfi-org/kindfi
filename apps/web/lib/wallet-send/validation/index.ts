import { Asset } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import type {
	ValidatedWalletSendPayment,
	WalletSendAssetCode,
	WalletSendFormInput,
} from '~/lib/wallet-send/types'
import { validatePaymentAmount } from '~/lib/wallet-send/validation/amount'
import { validatePaymentDestination } from '~/lib/wallet-send/validation/destination'
import { validatePaymentMemo } from '~/lib/wallet-send/validation/memo'

export type ValidateWalletSendFormResult =
	| { ok: true; payment: ValidatedWalletSendPayment }
	| { ok: false; error: string }

export const validateWalletSendForm = (
	input: WalletSendFormInput,
	sourceAddress: string,
	config: WalletTransferConfig,
): ValidateWalletSendFormResult => {
	const destinationResult = validatePaymentDestination(input.destination, sourceAddress)
	if (!destinationResult.ok) return destinationResult

	const amountResult = validatePaymentAmount(input.amount, input.asset)
	if (!amountResult.ok) return amountResult

	const memoResult = validatePaymentMemo(input.memo)
	if (!memoResult.ok) return memoResult

	const paymentAsset =
		input.asset === 'XLM' ? Asset.native() : new Asset(config.usdc.code, config.usdc.issuer)

	return {
		ok: true,
		payment: {
			destination: destinationResult.destination,
			amount: amountResult.amount,
			memo: memoResult.memo,
			memoObject: memoResult.memoObject,
			asset: input.asset as WalletSendAssetCode,
			paymentAsset,
		},
	}
}

export { validatePaymentAmount, validatePaymentDestination, validatePaymentMemo }

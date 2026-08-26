import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { loadHorizonAccount, WalletSendHorizonError } from '~/lib/wallet-send/horizon/accounts'
import {
	assertDestinationUsdcTrustline,
	assertFeeReserve,
	assertUsdcTrustlineReady,
	assertXlmSpendable,
} from '~/lib/wallet-send/horizon/balances'
import { createHorizonServer } from '~/lib/wallet-send/horizon/client'
import type { HorizonAccountResponse, ValidatedWalletSendPayment } from '~/lib/wallet-send/types'

export type PreflightPaymentResult = { ok: true } | { ok: false; error: string }

export const preflightWalletSendPayment = async (
	sourceAddress: string,
	payment: ValidatedWalletSendPayment,
	config: WalletTransferConfig,
): Promise<PreflightPaymentResult> => {
	const server = createHorizonServer(config)

	let sourceAccount: HorizonAccountResponse
	try {
		sourceAccount = await loadHorizonAccount(server, sourceAddress)
	} catch (error) {
		if (error instanceof WalletSendHorizonError) {
			return { ok: false, error: error.message }
		}

		return { ok: false, error: 'Unable to load your wallet account on this network.' }
	}

	const feeCheck = assertFeeReserve(sourceAccount)
	if (!feeCheck.ok) return feeCheck

	if (payment.asset === 'XLM') {
		const xlmCheck = assertXlmSpendable(sourceAccount, payment.amount)
		if (!xlmCheck.ok) return xlmCheck
	} else {
		const sourceUsdcCheck = assertUsdcTrustlineReady(sourceAccount, config, payment.amount)
		if (!sourceUsdcCheck.ok) return sourceUsdcCheck

		let destinationAccount: HorizonAccountResponse
		try {
			destinationAccount = await loadHorizonAccount(server, payment.destination)
		} catch (error) {
			if (error instanceof WalletSendHorizonError && error.code === 'account_not_found') {
				return {
					ok: false,
					error: 'The destination account was not found on this network.',
				}
			}

			return { ok: false, error: 'Unable to verify the destination account.' }
		}

		const destinationUsdcCheck = assertDestinationUsdcTrustline(
			destinationAccount,
			config,
			payment.amount,
		)
		if (!destinationUsdcCheck.ok) return destinationUsdcCheck
	}

	return { ok: true }
}

export const loadWalletSendBalances = async (
	sourceAddress: string,
	config: WalletTransferConfig,
) => {
	const server = createHorizonServer(config)
	const account = await loadHorizonAccount(server, sourceAddress)
	return account
}

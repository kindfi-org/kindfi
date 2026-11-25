import { logger } from '~/lib/logger'
import {
	WalletSendHorizonError,
	type WalletSendHorizonErrorCode,
} from '~/lib/wallet-send/horizon/accounts'

export type WalletSendErrorCode =
	| 'wallet_disconnected'
	| 'network_mismatch'
	| 'invalid_destination'
	| 'destination_not_found'
	| 'invalid_memo'
	| 'user_rejected'
	| 'insufficient_xlm'
	| 'insufficient_asset'
	| 'trustline_issue'
	| 'bad_sequence'
	| 'expired'
	| 'pollar_policy'
	| 'submission_failed'
	| 'confirmation_unavailable'
	| 'unknown'

export type WalletSendUserError = {
	code: WalletSendErrorCode
	message: string
}

const mapHorizonErrorCodeToWalletErrorCode = (
	code: WalletSendHorizonErrorCode,
): WalletSendErrorCode => {
	switch (code) {
		case 'account_not_found':
		case 'op_no_destination':
			return 'destination_not_found'
		case 'op_no_trust':
		case 'op_line_full':
		case 'op_src_no_trust':
		case 'op_not_authorized':
		case 'op_src_not_authorized':
			return 'trustline_issue'
		case 'tx_insufficient_fee':
		case 'tx_insufficient_balance':
		case 'op_low_reserve':
			return 'insufficient_xlm'
		case 'op_underfunded':
			return 'insufficient_asset'
		case 'tx_bad_seq':
			return 'bad_sequence'
		case 'tx_bad_auth':
			return 'network_mismatch'
		case 'tx_too_early':
		case 'tx_too_late':
			return 'expired'
		case 'network_error':
		case 'unknown':
			return 'submission_failed'
	}
}

const includesAny = (value: string, needles: string[]): boolean =>
	needles.some((needle) => value.includes(needle))

export const mapWalletSendError = (error: unknown): WalletSendUserError => {
	if (error instanceof WalletSendHorizonError) {
		logger.error('Wallet send Horizon error:', error, {
			code: error.code,
			rawCode: error.rawCode,
			resultCodes: error.resultCodes,
		})
		return {
			code: mapHorizonErrorCodeToWalletErrorCode(error.code),
			message: error.message,
		}
	}

	const rawMessage = error instanceof Error ? error.message : String(error)
	const message = rawMessage.toLowerCase()

	logger.error('Wallet send failed:', error)

	if (includesAny(message, ['user rejected', 'request rejected', 'cancelled', 'canceled'])) {
		return { code: 'user_rejected', message: 'Signing was cancelled. No funds were sent.' }
	}

	if (includesAny(message, ['network mismatch', 'main net', 'test net', 'tx_bad_auth'])) {
		return {
			code: 'network_mismatch',
			message:
				'Your wallet and KindFi are on different Stellar networks. Switch networks in your wallet and try again.',
		}
	}

	if (includesAny(message, ['auth policy', 'policy rejected', 'not allowed'])) {
		return {
			code: 'pollar_policy',
			message:
				'Your custodial wallet policy blocked this transfer. Contact support or update the Pollar Auth Policy for classic payments.',
		}
	}

	if (includesAny(message, ['destination account not found', 'account not found'])) {
		return {
			code: 'destination_not_found',
			message: 'The destination account was not found on this network.',
		}
	}

	if (includesAny(message, ['memo'])) {
		return { code: 'invalid_memo', message: rawMessage }
	}

	if (includesAny(message, ['trustline', 'authorized'])) {
		return { code: 'trustline_issue', message: rawMessage }
	}

	if (includesAny(message, ['insufficient', 'underfunded', 'op_underfunded'])) {
		if (includesAny(message, ['xlm', 'native', 'fee', 'reserve'])) {
			return {
				code: 'insufficient_xlm',
				message: 'Insufficient spendable XLM after reserves, liabilities, and network fees.',
			}
		}

		return { code: 'insufficient_asset', message: rawMessage }
	}

	if (includesAny(message, ['tx_bad_seq', 'bad sequence', 'sequence number'])) {
		return {
			code: 'bad_sequence',
			message: 'Your wallet sequence changed. Refresh balances and try again.',
		}
	}

	if (includesAny(message, ['expired', 'timeout', 'tx_too_late'])) {
		return {
			code: 'expired',
			message: 'The transaction expired before submission. Please try again.',
		}
	}

	if (includesAny(message, ['disconnected', 'not connected', 'wallet not connected'])) {
		return { code: 'wallet_disconnected', message: 'Connect your wallet before sending assets.' }
	}

	if (includesAny(message, ['horizon', 'submission', 'failed to submit'])) {
		return {
			code: 'submission_failed',
			message: 'Unable to submit the transaction. Check your connection and try again.',
		}
	}

	return {
		code: 'unknown',
		message: 'Unable to complete the transfer. Please try again.',
	}
}

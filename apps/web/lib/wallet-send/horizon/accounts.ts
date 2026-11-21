import type { Horizon } from '@stellar/stellar-sdk'
import type { HorizonAccountResponse } from '~/lib/wallet-send/types'

export type HorizonResultCodes = {
	transaction?: string
	operations?: readonly string[]
}

export type WalletSendHorizonResultCode =
	| 'tx_insufficient_fee'
	| 'tx_bad_seq'
	| 'tx_bad_auth'
	| 'tx_too_early'
	| 'tx_too_late'
	| 'tx_insufficient_balance'
	| 'op_underfunded'
	| 'op_no_destination'
	| 'op_no_trust'
	| 'op_line_full'
	| 'op_low_reserve'
	| 'op_src_no_trust'
	| 'op_not_authorized'
	| 'op_src_not_authorized'

export type WalletSendHorizonErrorCode =
	| 'account_not_found'
	| 'network_error'
	| WalletSendHorizonResultCode
	| 'unknown'

export type WalletSendHorizonErrorOptions = {
	rawCode?: string
	resultCodes?: HorizonResultCodes
	cause?: unknown
}

export class WalletSendHorizonError extends Error {
	readonly rawCode?: string
	readonly resultCodes?: HorizonResultCodes

	constructor(
		message: string,
		readonly code: WalletSendHorizonErrorCode,
		options?: WalletSendHorizonErrorOptions,
	) {
		super(message, options?.cause !== undefined ? { cause: options.cause } : undefined)
		this.name = 'WalletSendHorizonError'
		this.rawCode = options?.rawCode
		this.resultCodes = options?.resultCodes
	}
}

export const loadHorizonAccount = async (
	server: Horizon.Server,
	address: string,
): Promise<HorizonAccountResponse> => {
	try {
		const account = await server.loadAccount(address)
		return account as unknown as HorizonAccountResponse
	} catch (error) {
		const notFound =
			typeof error === 'object' &&
			error !== null &&
			'response' in error &&
			typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
			(error as { response?: { status?: number } }).response?.status === 404

		if (notFound) {
			throw new WalletSendHorizonError(
				'Destination account not found on this network.',
				'account_not_found',
			)
		}

		throw new WalletSendHorizonError(
			'Unable to load account details from Horizon. Check your network connection and try again.',
			'network_error',
		)
	}
}

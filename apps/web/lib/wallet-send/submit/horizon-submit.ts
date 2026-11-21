import { type Horizon, TransactionBuilder } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { logger } from '~/lib/logger'
import {
	type HorizonResultCodes,
	WalletSendHorizonError,
	type WalletSendHorizonResultCode,
} from '~/lib/wallet-send/horizon/accounts'
import { createHorizonServer } from '~/lib/wallet-send/horizon/client'

export type HorizonSubmitResult = {
	hash: string
}

export type HorizonSubmitServer = Pick<Horizon.Server, 'submitTransaction'>

const TRANSACTION_WRAPPER_CODES = new Set(['tx_failed', 'tx_fee_bump_inner_failed'])

const HORIZON_RESULT_MESSAGES: Record<WalletSendHorizonResultCode, string> = {
	tx_insufficient_fee:
		'The network fee was too low for the current ledger load, so please try sending again.',
	tx_bad_seq: 'Your wallet sequence number changed, so refresh your balances and try again.',
	tx_bad_auth:
		'Transaction signature verification failed; ensure your wallet is on the matching Stellar network.',
	tx_too_early:
		'The transaction time bounds are not valid yet, so check your device clock and try again.',
	tx_too_late: 'The transaction expired before Horizon accepted it, so please try sending again.',
	tx_insufficient_balance:
		'Insufficient spendable XLM after reserves and network fees for this transaction.',
	op_underfunded: 'Insufficient spendable balance after reserves and liabilities for this payment.',
	op_no_destination: 'The destination account was not found on this network.',
	op_no_trust: 'The destination account does not have the required trustline for this asset.',
	op_line_full: 'The destination trustline does not have enough remaining limit for this payment.',
	op_low_reserve:
		'Insufficient spendable XLM to meet the minimum account reserve for this payment.',
	op_src_no_trust: 'Your wallet does not have the required trustline for this asset.',
	op_not_authorized: 'The destination trustline is not authorized to hold this asset.',
	op_src_not_authorized: 'Your wallet trustline is not authorized to send this asset.',
}

const isMappedHorizonResultCode = (code: string): code is WalletSendHorizonResultCode =>
	Object.hasOwn(HORIZON_RESULT_MESSAGES, code)

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

export const extractHorizonResultCodes = (error: unknown): HorizonResultCodes | undefined => {
	if (!isRecord(error)) return undefined

	const response = isRecord(error.response) ? error.response : undefined
	const data = isRecord(response?.data)
		? response.data
		: isRecord(error.data)
			? error.data
			: undefined
	const extras = isRecord(data?.extras)
		? data.extras
		: isRecord(error.extras)
			? error.extras
			: undefined
	const rawCodes = extras?.result_codes
	if (!isRecord(rawCodes)) return undefined

	const transaction =
		typeof rawCodes.transaction === 'string' && rawCodes.transaction.trim().length > 0
			? rawCodes.transaction.trim()
			: undefined
	const operations = Array.isArray(rawCodes.operations)
		? rawCodes.operations
				.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
				.map((entry) => entry.trim())
		: undefined

	if (!transaction && (!operations || operations.length === 0)) {
		return undefined
	}

	return {
		...(transaction ? { transaction } : {}),
		...(operations && operations.length > 0 ? { operations } : {}),
	}
}

const hasNetworkFailureShape = (error: unknown): boolean => {
	if (!isRecord(error)) return false
	const response = isRecord(error.response) ? error.response : undefined
	if (typeof response?.status === 'number' && response.status >= 500) {
		return true
	}

	const message = typeof error.message === 'string' ? error.message.toLowerCase() : ''
	return (
		message.includes('network') ||
		message.includes('fetch') ||
		message.includes('econn') ||
		message.includes('etimedout') ||
		message.includes('timeout')
	)
}

export const mapHorizonSubmissionError = (error: unknown): WalletSendHorizonError => {
	if (error instanceof WalletSendHorizonError) {
		return error
	}

	const resultCodes = extractHorizonResultCodes(error)
	if (resultCodes) {
		const failingOperations = (resultCodes.operations ?? []).filter((code) => code !== 'op_success')
		const mappedOperation = failingOperations.find(isMappedHorizonResultCode)
		if (mappedOperation) {
			return new WalletSendHorizonError(HORIZON_RESULT_MESSAGES[mappedOperation], mappedOperation, {
				rawCode: mappedOperation,
				resultCodes,
				cause: error,
			})
		}

		const txCode = resultCodes.transaction
		if (txCode && !TRANSACTION_WRAPPER_CODES.has(txCode) && isMappedHorizonResultCode(txCode)) {
			return new WalletSendHorizonError(HORIZON_RESULT_MESSAGES[txCode], txCode, {
				rawCode: txCode,
				resultCodes,
				cause: error,
			})
		}

		const unknownRawCode = failingOperations[0] ?? txCode ?? 'unknown'
		return new WalletSendHorizonError(
			'Horizon rejected the payment transaction; please check your transfer details and try again.',
			'unknown',
			{
				rawCode: unknownRawCode,
				resultCodes,
				cause: error,
			},
		)
	}

	if (hasNetworkFailureShape(error)) {
		return new WalletSendHorizonError(
			'Unable to submit the payment to Horizon; check your network connection and try again.',
			'network_error',
			{ cause: error },
		)
	}

	return new WalletSendHorizonError(
		'Unable to submit the payment transaction to Horizon.',
		'unknown',
		{ cause: error },
	)
}

export const submitSignedPaymentToHorizon = async (
	signedXdr: string,
	config: WalletTransferConfig,
	deps?: { server?: HorizonSubmitServer },
): Promise<HorizonSubmitResult> => {
	const server = deps?.server ?? createHorizonServer(config)

	try {
		const transaction = TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase)
		const response = await server.submitTransaction(transaction)
		return { hash: response.hash }
	} catch (error) {
		const horizonError = mapHorizonSubmissionError(error)
		logger.error('Horizon payment submission failed', horizonError, {
			code: horizonError.code,
			rawCode: horizonError.rawCode,
			resultCodes: horizonError.resultCodes,
		})
		throw horizonError
	}
}

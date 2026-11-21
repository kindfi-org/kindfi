import { describe, expect, spyOn, test } from 'bun:test'
import { Asset, BadRequestError, Keypair, TransactionBuilder } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { TESTNET_USDC_TRUSTLINE_ADDRESS } from '~/lib/constants/escrow'
import { logger } from '~/lib/logger'
import { mapWalletSendError } from '~/lib/wallet-send/errors'
import {
	type HorizonResultCodes,
	WalletSendHorizonError,
	type WalletSendHorizonErrorCode,
} from '~/lib/wallet-send/horizon/accounts'
import {
	extractHorizonResultCodes,
	type HorizonSubmitServer,
	mapHorizonSubmissionError,
	submitSignedPaymentToHorizon,
} from '~/lib/wallet-send/submit/horizon-submit'
import { buildPaymentTransaction } from '~/lib/wallet-send/transaction/build-payment'
import type { HorizonAccountResponse } from '~/lib/wallet-send/types'

const TESTNET_CONFIG: WalletTransferConfig = {
	networkId: 'testnet',
	networkPassphrase: 'Test SDF Network ; September 2015',
	horizonUrl: 'https://horizon-testnet.stellar.org',
	usdc: { code: 'USDC', issuer: TESTNET_USDC_TRUSTLINE_ADDRESS },
	explorerNetwork: 'testnet',
}

const buildSignedPaymentXdr = (): string => {
	const sourceKeypair = Keypair.random()
	const destination = Keypair.random().publicKey()
	const sourceAccount: HorizonAccountResponse = {
		id: sourceKeypair.publicKey(),
		account_id: sourceKeypair.publicKey(),
		sequence: '10',
		subentry_count: 1,
		balances: [{ asset_type: 'native', balance: '50' }],
	}

	const built = buildPaymentTransaction(
		sourceAccount,
		{
			destination,
			amount: '5',
			memo: { type: 'none' },
			asset: 'XLM',
			paymentAsset: Asset.native(),
		},
		TESTNET_CONFIG,
	)

	const tx = TransactionBuilder.fromXDR(built.unsignedXdr, TESTNET_CONFIG.networkPassphrase)
	tx.sign(sourceKeypair)
	return tx.toXDR()
}

const buildFakeHorizonError = (resultCodes: HorizonResultCodes, messageOverride?: string) => {
	const body = {
		type: 'https://stellar.org/horizon-errors/transaction_failed',
		title: 'Transaction Failed',
		status: 400,
		detail:
			'The transaction failed when submitted to the stellar network. The `extras.result_codes` field on this response contains further details.',
		extras: {
			envelope_xdr: 'AAAAAgAAAAB=',
			result_codes: resultCodes,
			result_xdr: 'AAAAAAAAAGT/////AAAAAQAAAAAAAAAB////+gAAAAA=',
		},
	}

	return new BadRequestError(
		messageOverride ?? `Transaction submission failed: ${JSON.stringify(body)}`,
		{
			status: 400,
			data: body,
		} as any,
	)
}

const MAPPED_HORIZON_CASES: ReadonlyArray<{
	label: string
	resultCodes: HorizonResultCodes
	expectedCode: WalletSendHorizonErrorCode
	expectedTerm: string
}> = [
	{
		label: 'tx_insufficient_fee',
		resultCodes: { transaction: 'tx_insufficient_fee' },
		expectedCode: 'tx_insufficient_fee',
		expectedTerm: 'fee',
	},
	{
		label: 'tx_bad_seq',
		resultCodes: { transaction: 'tx_bad_seq' },
		expectedCode: 'tx_bad_seq',
		expectedTerm: 'sequence',
	},
	{
		label: 'op_underfunded',
		resultCodes: { transaction: 'tx_failed', operations: ['op_underfunded'] },
		expectedCode: 'op_underfunded',
		expectedTerm: 'reserves',
	},
	{
		label: 'op_no_destination',
		resultCodes: { transaction: 'tx_failed', operations: ['op_no_destination'] },
		expectedCode: 'op_no_destination',
		expectedTerm: 'destination',
	},
	{
		label: 'op_no_trust',
		resultCodes: { transaction: 'tx_failed', operations: ['op_no_trust'] },
		expectedCode: 'op_no_trust',
		expectedTerm: 'trustline',
	},
	{
		label: 'op_line_full',
		resultCodes: { transaction: 'tx_failed', operations: ['op_line_full'] },
		expectedCode: 'op_line_full',
		expectedTerm: 'trustline',
	},
	{
		label: 'op_low_reserve',
		resultCodes: { transaction: 'tx_failed', operations: ['op_low_reserve'] },
		expectedCode: 'op_low_reserve',
		expectedTerm: 'reserve',
	},
]

describe('wallet send Horizon result code mapping', () => {
	test('returns the Horizon transaction hash when submission succeeds', async () => {
		const signedXdr = buildSignedPaymentXdr()
		const fakeServer: HorizonSubmitServer = {
			submitTransaction: async () => ({ hash: 'abc123horizonhash' }) as any,
		}

		const result = await submitSignedPaymentToHorizon(signedXdr, TESTNET_CONFIG, {
			server: fakeServer,
		})
		expect(result).toEqual({ hash: 'abc123horizonhash' })
	})

	for (const testCase of MAPPED_HORIZON_CASES) {
		test(`maps ${testCase.label} onto WalletSendHorizonError with clean one-sentence copy`, async () => {
			const signedXdr = buildSignedPaymentXdr()
			const fakeServer: HorizonSubmitServer = {
				submitTransaction: async () => {
					throw buildFakeHorizonError(testCase.resultCodes)
				},
			}

			let caught: unknown
			try {
				await submitSignedPaymentToHorizon(signedXdr, TESTNET_CONFIG, { server: fakeServer })
			} catch (error) {
				caught = error
			}

			expect(caught).toBeInstanceOf(WalletSendHorizonError)
			const horizonError = caught as WalletSendHorizonError
			expect(horizonError.code).toBe(testCase.expectedCode)
			expect(horizonError.rawCode).toBe(testCase.expectedCode)
			expect(horizonError.resultCodes).toEqual(testCase.resultCodes)
			expect(horizonError.message.toLowerCase()).toContain(testCase.expectedTerm)
			expect(horizonError.message).not.toContain('{')
			expect(horizonError.message).not.toContain('}')
			expect(horizonError.message).not.toContain('extras')
		})
	}

	test('skips op_success and maps the failing operation code in multi-op responses', () => {
		const error = buildFakeHorizonError({
			transaction: 'tx_failed',
			operations: ['op_success', 'op_no_trust'],
		})

		const mapped = mapHorizonSubmissionError(error)
		expect(mapped).toBeInstanceOf(WalletSendHorizonError)
		expect(mapped.code).toBe('op_no_trust')
		expect(mapped.rawCode).toBe('op_no_trust')
	})

	test('throws WalletSendHorizonError on unknown codes and logs the raw code without raw JSON in message', async () => {
		const signedXdr = buildSignedPaymentXdr()
		const loggerSpy = spyOn(logger, 'error')
		const fakeServer: HorizonSubmitServer = {
			submitTransaction: async () => {
				throw buildFakeHorizonError({
					transaction: 'tx_failed',
					operations: ['op_future_unknown_code'],
				})
			},
		}

		let caught: unknown
		try {
			await submitSignedPaymentToHorizon(signedXdr, TESTNET_CONFIG, { server: fakeServer })
		} catch (error) {
			caught = error
		}

		expect(caught).toBeInstanceOf(WalletSendHorizonError)
		const horizonError = caught as WalletSendHorizonError
		expect(horizonError.code).toBe('unknown')
		expect(horizonError.rawCode).toBe('op_future_unknown_code')
		expect(horizonError.message).not.toContain('{')
		expect(horizonError.message).not.toContain('extras')

		expect(loggerSpy).toHaveBeenCalledWith(
			'Horizon payment submission failed',
			horizonError,
			expect.objectContaining({
				code: 'unknown',
				rawCode: 'op_future_unknown_code',
				resultCodes: {
					transaction: 'tx_failed',
					operations: ['op_future_unknown_code'],
				},
			}),
		)
		loggerSpy.mockRestore()
	})

	test('maps bare tx_failed without operations to unknown while retaining rawCode', () => {
		const mapped = mapHorizonSubmissionError(buildFakeHorizonError({ transaction: 'tx_failed' }))
		expect(mapped).toBeInstanceOf(WalletSendHorizonError)
		expect(mapped.code).toBe('unknown')
		expect(mapped.rawCode).toBe('tx_failed')
	})

	test('maps HTTP 503 Horizon failures without result_codes to network_error', () => {
		const mapped = mapHorizonSubmissionError(
			Object.assign(new Error('Service Unavailable'), { response: { status: 503 } }),
		)
		expect(mapped).toBeInstanceOf(WalletSendHorizonError)
		expect(mapped.code).toBe('network_error')
	})

	test('preserves WalletSendHorizonError human message through mapWalletSendError', () => {
		const horizonError = mapHorizonSubmissionError(
			buildFakeHorizonError({ transaction: 'tx_failed', operations: ['op_line_full'] }),
		)

		const userError = mapWalletSendError(horizonError)
		expect(userError).toEqual({
			code: 'trustline_issue',
			message: horizonError.message,
		})
	})

	test('extracts Horizon result_codes safely and returns undefined for unrelated errors', () => {
		expect(extractHorizonResultCodes(new Error('Network timeout'))).toBeUndefined()
		expect(extractHorizonResultCodes(null)).toBeUndefined()
		expect(
			extractHorizonResultCodes({
				response: { data: { extras: { result_codes: { transaction: 'tx_bad_seq' } } } },
			}),
		).toEqual({ transaction: 'tx_bad_seq' })
	})
})

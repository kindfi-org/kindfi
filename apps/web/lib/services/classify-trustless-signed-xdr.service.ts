import { xdr } from '@stellar/stellar-sdk'
import type { KycFinancialAction } from '~/lib/kyc/types'

const RELEASE_ESCROW_FUNCTIONS = new Set(['releaseFunds', 'release_funds', 'release'])
const DONATE_FUNCTIONS = new Set(['fundEscrow', 'donate'])

/**
 * Unwrap a transaction envelope to its inner Transaction, following
 * fee-bump wrappers to the escaped transaction being authorized.
 */
const unwrapEnvelopeTransaction = (
	envelope: xdr.TransactionEnvelope,
): xdr.Transaction | xdr.TransactionV0 | null => {
	const switchName = envelope.switch().name

	if (switchName === 'envelopeTypeTx') {
		return envelope.v1().tx()
	}

	if (switchName === 'envelopeTypeTxV0') {
		return envelope.v0().tx()
	}

	if (switchName === 'envelopeTypeTxFeeBump') {
		const innerEnvelope = envelope.feeBump().tx().innerTx()
		if (innerEnvelope.switch().name === 'envelopeTypeTx') {
			return innerEnvelope.v1().tx()
		}
	}

	return null
}

const classifyInvokeContract = (functionName: string): KycFinancialAction | null => {
	if (RELEASE_ESCROW_FUNCTIONS.has(functionName)) {
		return 'release_escrow_funds'
	}

	if (DONATE_FUNCTIONS.has(functionName)) {
		return 'donate'
	}

	return null
}

const classifyOperation = (op: xdr.Operation): KycFinancialAction | null => {
	const body = op.body()
	const switchName = body.switch().name

	if (switchName === 'invokeHostFunction') {
		const hostFunction = body.invokeHostFunctionOp().hostFunction()

		if (hostFunction.switch() !== xdr.HostFunctionType.hostFunctionTypeInvokeContract()) {
			return 'send_assets'
		}

		const functionName = hostFunction.invokeContract().functionName().toString()
		return classifyInvokeContract(functionName) ?? 'send_assets'
	}

	const classicAssetOps = new Set([
		'payment',
		'pathPaymentStrictReceive',
		'pathPaymentStrictSend',
		'accountMerge',
		'createAccount',
		'manageBuyOffer',
		'manageSellOffer',
		'createClaimableBalance',
	])
	if (classicAssetOps.has(switchName)) {
		return 'send_assets'
	}

	return null
}

/**
 * Map a signed Trustless Work XDR to the financial action it performs so the
 * KYC gate can authorize it before any broadcast. Unknown or unparseable
 * payloads fall back to the generic on-chain asset-movement action so they
 * still require approved KYC in enforced mode.
 */
export const classifySignedXdrAction = (signedXdr: string): KycFinancialAction => {
	try {
		const envelope = xdr.TransactionEnvelope.fromXDR(signedXdr, 'base64')
		const transaction = unwrapEnvelopeTransaction(envelope)
		if (!transaction) return 'send_assets'

		for (const op of transaction.operations()) {
			const action = classifyOperation(op)
			if (action) return action
		}

		return 'send_assets'
	} catch {
		return 'send_assets'
	}
}

import { TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { type Api, Server } from '@stellar/stellar-sdk/rpc'
import { getClientStellarNetworkPassphrase } from '~/lib/config/stellar-network.config'
import { getTrustlessWorkStellarRpcUrl } from '~/lib/config/trustless-work.config'

export type TrustlessSubmitSuccess = {
	status: 'SUCCESS'
	message: string
	hash: string
}

const getTransactionResultCode = (errorResult: xdr.TransactionResult): string => {
	const result = errorResult.result()

	switch (result.switch()) {
		case xdr.TransactionResultResultType.txBadAuth():
			return 'tx_bad_auth'
		case xdr.TransactionResultResultType.txBadSeq():
			return 'tx_bad_seq'
		case xdr.TransactionResultResultType.txTooEarly():
			return 'tx_too_early'
		case xdr.TransactionResultResultType.txTooLate():
			return 'tx_too_late'
		case xdr.TransactionResultResultType.txFailed(): {
			const operationResults = result.txFailed()
			const codes = operationResults.map((operationResult) => operationResult.value().switch().name)
			return codes.length > 0 ? codes.join(', ') : 'tx_failed'
		}
		default:
			return result.switch().name
	}
}

const formatSubmitError = (result: Api.SendTransactionResponse): string => {
	if (result.errorResult) {
		return getTransactionResultCode(result.errorResult)
	}

	if (result.status === 'TRY_AGAIN_LATER') {
		return 'try_again_later'
	}

	return result.status.toLowerCase()
}

export class TrustlessStellarSubmitError extends Error {
	constructor(
		message: string,
		readonly stellarCode: string,
	) {
		super(message)
		this.name = 'TrustlessStellarSubmitError'
	}
}

/** Submit a wallet-signed Trustless Work XDR directly to Soroban RPC on the configured network. */
export const submitTrustlessSignedTransaction = async (
	signedXdr: string,
): Promise<TrustlessSubmitSuccess> => {
	const networkPassphrase = getClientStellarNetworkPassphrase()
	const transaction = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)
	const server = new Server(getTrustlessWorkStellarRpcUrl())
	const result = await server.sendTransaction(transaction)

	if (result.status === 'PENDING' || result.status === 'DUPLICATE' || result.status === 'SUCCESS') {
		return {
			status: 'SUCCESS',
			message: 'Transaction submitted to Stellar',
			hash: result.hash,
		}
	}

	const stellarCode = formatSubmitError(result)
	throw new TrustlessStellarSubmitError(
		`Transaction rejected by Stellar: ${stellarCode}`,
		stellarCode,
	)
}

import { TransactionBuilder, type xdr } from '@stellar/stellar-sdk'
import { type Api, Server } from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'
import type { ClientStellarNetworkId } from '~/lib/config/stellar-network.config'
import type { TrustlessWorkNetwork } from '~/lib/config/trustless-work.config'
import { getTrustlessWorkStellarRpcUrlForNetwork } from '~/lib/config/trustless-work.config'
import { resolveSignedTransactionNetwork } from '~/lib/utils/escrow/resolve-signed-transaction-network'
import { getTxBadAuthMessage } from '~/lib/utils/escrow/trustless-transaction-signing'

export type TrustlessSubmitSuccess = {
	status: 'SUCCESS'
	message: string
	hash: string
}

const toTrustlessWorkNetwork = (networkId: ClientStellarNetworkId): TrustlessWorkNetwork =>
	networkId === 'mainnet' ? 'mainnet' : 'development'

const getTransactionResultCode = (errorResult: xdr.TransactionResult): string => {
	const result = errorResult.result()
	const resultType = result.switch().name

	switch (resultType) {
		case 'txBadAuth':
			return 'tx_bad_auth'
		case 'txBadSeq':
			return 'tx_bad_seq'
		case 'txTooEarly':
			return 'tx_too_early'
		case 'txTooLate':
			return 'tx_too_late'
		case 'txFailed':
			return 'tx_failed'
		default:
			return resultType
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

/** Submit a wallet-signed Trustless Work XDR directly to Soroban RPC on the signed network. */
export const submitTrustlessSignedTransaction = async (
	signedXdr: string,
): Promise<TrustlessSubmitSuccess> => {
	const resolvedNetwork = resolveSignedTransactionNetwork(signedXdr)
	if (!resolvedNetwork) {
		throw new TrustlessStellarSubmitError(
			'Signed transaction signature could not be verified for mainnet or testnet.',
			'invalid_signature',
		)
	}

	const transaction = TransactionBuilder.fromXDR(signedXdr, resolvedNetwork.networkPassphrase)
	const trustlessNetwork = toTrustlessWorkNetwork(resolvedNetwork.networkId)
	const rpcUrl = getTrustlessWorkStellarRpcUrlForNetwork(trustlessNetwork)
	const server = new Server(rpcUrl)
	const result = await server.sendTransaction(transaction)

	if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
		return {
			status: 'SUCCESS',
			message: 'Transaction submitted to Stellar',
			hash: result.hash,
		}
	}

	const stellarCode = formatSubmitError(result)
	const transactionSource =
		'innerTransaction' in transaction ? transaction.innerTransaction.source : transaction.source
	logger.error('Trustless Work signed tx rejected by Soroban RPC', {
		stellarCode,
		networkId: resolvedNetwork.networkId,
		rpcUrl,
		txHash: result.hash,
		source: transactionSource,
	})

	const message =
		stellarCode === 'tx_bad_auth'
			? getTxBadAuthMessage(resolvedNetwork.networkId)
			: `Transaction rejected by Stellar: ${stellarCode}`

	throw new TrustlessStellarSubmitError(message, stellarCode)
}

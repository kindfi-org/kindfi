import type { TrustlessSubmitResult } from '~/hooks/pollar/use-pollar-signer'

type SendTransactionFn = (
	xdr: string,
) => Promise<{ status?: string; txHash?: string } | null | undefined>

/**
 * Signs and submits a Trustless Work unsigned XDR via Pollar (auto-submit)
 * or Wallet Kit (sign then TW sendTransaction).
 */
export const submitTrustlessEscrowXdr = async (
	unsignedXdr: string,
	signAndSubmitTrustlessTransaction: (
		unsignedXdr: string,
		requiredSigner?: string,
	) => Promise<TrustlessSubmitResult>,
	sendTransaction: SendTransactionFn,
	requiredSigner?: string,
) => {
	const result = await signAndSubmitTrustlessTransaction(unsignedXdr, requiredSigner)

	if (result.alreadySubmitted) {
		return { status: 'SUCCESS', txHash: result.hash }
	}

	if (!result.signedXdr) {
		throw new Error('No signed transaction returned')
	}

	const sendResult = await sendTransaction(result.signedXdr)
	if (!sendResult || sendResult.status !== 'SUCCESS') {
		throw new Error('Transaction failed')
	}

	return sendResult
}

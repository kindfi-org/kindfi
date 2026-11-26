import type { PollarClient } from '@pollar/core'
import { mapWalletSendError } from '~/lib/wallet-send/errors'

export type PollarWalletSendResult = {
	hash: string
}

export const submitClassicPaymentWithPollar = async (
	client: PollarClient,
	unsignedXdr: string,
): Promise<PollarWalletSendResult> => {
	await client.ready()
	const outcome = await client.signAndSubmitTx(unsignedXdr)

	if (outcome.status === 'error') {
		const message = outcome.message ?? outcome.details ?? 'Pollar signing failed'
		throw Object.assign(new Error(message), {
			code: mapWalletSendError(new Error(message)).code,
		})
	}

	if (!outcome.hash) {
		throw new Error('Pollar did not return a transaction hash.')
	}

	return { hash: outcome.hash }
}

export const isPollarPolicyRejection = (error: unknown): boolean =>
	mapWalletSendError(error).code === 'pollar_policy'

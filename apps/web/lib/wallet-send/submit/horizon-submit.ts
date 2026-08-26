import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { mapWalletSendError } from '~/lib/wallet-send/errors'
import { createHorizonServer } from '~/lib/wallet-send/horizon/client'

export type HorizonSubmitResult = {
	hash: string
}

export const submitSignedPaymentToHorizon = async (
	signedXdr: string,
	config: WalletTransferConfig,
): Promise<HorizonSubmitResult> => {
	const server = createHorizonServer(config)

	try {
		const response = await server.submitTransaction(
			// Transaction object reconstructed by Horizon helper
			await import('@stellar/stellar-sdk').then(({ TransactionBuilder }) =>
				TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase),
			),
		)

		return { hash: response.hash }
	} catch (error) {
		const mapped = mapWalletSendError(error)
		throw Object.assign(new Error(mapped.message), { code: mapped.code })
	}
}

'use client'

import { useCallback } from 'react'
import { usePollarSigner } from '~/hooks/pollar/use-pollar-signer'
import {
	isPollarPolicyRejection,
	submitClassicPaymentWithPollar,
} from '~/lib/pollar/integrations/wallet-send.signer'

export const useWalletSendPollar = () => {
	const { isPollarReady, getClient, pollarAddress } = usePollarSigner()

	const sendWithPollar = useCallback(
		async (unsignedXdr: string) => {
			if (!isPollarReady) {
				throw new Error('Pollar wallet is not ready for signing')
			}

			return submitClassicPaymentWithPollar(getClient(), unsignedXdr)
		},
		[getClient, isPollarReady],
	)

	return {
		isPollarSendEnabled: isPollarReady,
		isPollarPolicyRejection,
		pollarAddress,
		sendWithPollar,
	}
}

'use client'

import { useCallback, useState } from 'react'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { usePollarSigner } from '~/hooks/pollar/use-pollar-signer'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { submitClassicPaymentWithPollar } from '~/lib/pollar/integrations/wallet-send.signer'
import { mapWalletSendError } from '~/lib/wallet-send/errors'
import { loadHorizonAccount } from '~/lib/wallet-send/horizon/accounts'
import { createHorizonServer } from '~/lib/wallet-send/horizon/client'
import { preflightWalletSendPayment } from '~/lib/wallet-send/horizon/preflight'
import { submitSignedPaymentToHorizon } from '~/lib/wallet-send/submit/horizon-submit'
import { buildPaymentTransaction } from '~/lib/wallet-send/transaction/build-payment'
import {
	verifyPaymentTransactionXdr,
	verifySignedPaymentTransactionXdr,
} from '~/lib/wallet-send/transaction/verify-payment-xdr'
import type { ValidatedWalletSendPayment } from '~/lib/wallet-send/types'

export const useWalletSendKit = () => {
	const wallet = useWallet()
	const { isPollarReady, pollarAddress, getClient } = usePollarSigner()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const sendPayment = useCallback(
		async (
			sourceAddress: string,
			payment: ValidatedWalletSendPayment,
			config: WalletTransferConfig,
		) => {
			if (isSubmitting) {
				throw new Error('A transfer is already in progress.')
			}

			setIsSubmitting(true)

			try {
				const preflight = await preflightWalletSendPayment(sourceAddress, payment, config)
				if (!preflight.ok) {
					throw new Error(preflight.error)
				}

				const server = createHorizonServer(config)
				const sourceAccount = await loadHorizonAccount(server, sourceAddress)
				const { unsignedXdr } = buildPaymentTransaction(sourceAccount, payment, config)
				verifyPaymentTransactionXdr(unsignedXdr, sourceAddress, payment, config)

				if (isPollarReady) {
					if (pollarAddress && pollarAddress !== sourceAddress) {
						throw new Error('Connected Pollar wallet does not match the active source address.')
					}

					const result = await submitClassicPaymentWithPollar(getClient(), unsignedXdr)
					return { hash: result.hash, submittedVia: 'pollar' as const }
				}

				if (!wallet.isConnected) {
					await wallet.connect()
				}

				const signer = wallet.address ?? sourceAddress
				if (signer !== sourceAddress) {
					throw new Error('Connected wallet does not match the active source address.')
				}

				const signedXdr = await wallet.signTransaction(unsignedXdr, sourceAddress)
				verifySignedPaymentTransactionXdr(signedXdr, sourceAddress, payment, config)
				const result = await submitSignedPaymentToHorizon(signedXdr, config)
				return { hash: result.hash, submittedVia: 'wallet-kit' as const }
			} catch (error) {
				const mapped = mapWalletSendError(error)
				throw Object.assign(new Error(mapped.message), { code: mapped.code })
			} finally {
				setIsSubmitting(false)
			}
		},
		[getClient, isPollarReady, isSubmitting, pollarAddress, wallet],
	)

	return {
		sendPayment,
		isSubmitting,
		isPollarReady,
	}
}

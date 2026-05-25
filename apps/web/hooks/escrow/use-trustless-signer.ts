'use client'

import { toast } from 'sonner'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useI18n } from '~/lib/i18n'
import {
	getTrustlessSignerError,
	isExternalStellarWalletAddress,
} from '~/lib/utils/escrow/trustless-signer'

export function useTrustlessSigner() {
	const wallet = useWallet()
	const { t } = useI18n()

	const ensureTrustlessSigner = async (): Promise<string> => {
		if (!wallet.isConnected) {
			await wallet.connect()
		}

		const signerError = getTrustlessSignerError(wallet.address)
		if (signerError) {
			toast.error(t('profile.trustlessWalletRequired'), {
				description: t('profile.trustlessWalletRequiredDescription'),
			})
			throw new Error(signerError)
		}

		return wallet.address as string
	}

	const signTrustlessTransaction = async (unsignedXdr: string): Promise<string> => {
		await ensureTrustlessSigner()
		return wallet.signTransaction(unsignedXdr)
	}

	return {
		...wallet,
		ensureTrustlessSigner,
		signTrustlessTransaction,
		isTrustlessReady: isExternalStellarWalletAddress(wallet.address),
	}
}

'use client'

import { toast } from 'sonner'
import { useStellarNetworkConfig } from '~/hooks/contexts/stellar-network.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import type { TrustlessSubmitResult } from '~/hooks/pollar/use-pollar-signer'
import { usePollarSigner } from '~/hooks/pollar/use-pollar-signer'
import { useI18n } from '~/lib/i18n'
import {
	getTrustlessSignerError,
	isExternalStellarWalletAddress,
} from '~/lib/utils/escrow/trustless-signer'
import {
	assertSignedTrustlessTransaction,
	assertTrustlessSignerMatches,
	getTxBadAuthMessage,
} from '~/lib/utils/escrow/trustless-transaction-signing'

/**
 * Unified escrow signing facade: Pollar custodial G-address or Stellar Wallet Kit.
 */
export function useTrustlessSigner() {
	const wallet = useWallet()
	const { networkId, networkPassphrase } = useStellarNetworkConfig()
	const { t } = useI18n()
	const { isPollarReady, pollarAddress, signAndSubmitTrustless } = usePollarSigner()

	const ensureTrustlessSigner = async (): Promise<string> => {
		if (isPollarReady && pollarAddress) {
			return pollarAddress
		}

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

	const signTrustlessTransaction = async (
		unsignedXdr: string,
		requiredSigner?: string,
	): Promise<string> => {
		if (isPollarReady) {
			const result = await signAndSubmitTrustless(unsignedXdr)
			if (!result.alreadySubmitted) {
				throw new Error('Expected Pollar to submit transaction')
			}
			return unsignedXdr
		}

		const signer = await ensureTrustlessSigner()
		if (requiredSigner) {
			assertTrustlessSignerMatches(signer, requiredSigner, 'platform')
		}
		const signedXdr = await wallet.signTransaction(unsignedXdr, requiredSigner ?? signer)
		try {
			assertSignedTrustlessTransaction(signedXdr, requiredSigner ?? signer, networkPassphrase)
		} catch (error) {
			if (error instanceof Error && error.message.includes('authorization failed')) {
				throw new Error(getTxBadAuthMessage(networkId))
			}
			throw error
		}
		return signedXdr
	}

	const signAndSubmitTrustlessTransaction = async (
		unsignedXdr: string,
		requiredSigner?: string,
	): Promise<TrustlessSubmitResult> => {
		if (isPollarReady) {
			if (requiredSigner && pollarAddress) {
				assertTrustlessSignerMatches(pollarAddress, requiredSigner, 'platform')
			}
			return signAndSubmitTrustless(unsignedXdr)
		}

		const signedXdr = await signTrustlessTransaction(unsignedXdr, requiredSigner)
		return { signedXdr, alreadySubmitted: false }
	}

	const signAndSendTrustless = async (
		unsignedXdr: string,
		sendTransaction: (
			xdr: string,
		) => Promise<{ status?: string; txHash?: string } | null | undefined>,
		requiredSigner?: string,
	) => {
		const result = await signAndSubmitTrustlessTransaction(unsignedXdr, requiredSigner)
		if (result.alreadySubmitted) {
			return { status: 'SUCCESS', txHash: result.hash }
		}
		if (!result.signedXdr) {
			throw new Error('No signed transaction returned')
		}
		return sendTransaction(result.signedXdr)
	}

	return {
		...wallet,
		ensureTrustlessSigner,
		signTrustlessTransaction,
		signAndSubmitTrustlessTransaction,
		signAndSendTrustless,
		isTrustlessReady: isPollarReady || isExternalStellarWalletAddress(wallet.address),
		isPollarSigner: isPollarReady,
		pollarAddress,
	}
}

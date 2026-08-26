'use client'

import { isExternalStellarWalletAddress } from '@packages/lib/utils/wallet-address'
import { useSession } from 'next-auth/react'
import { useCallback } from 'react'
import { signTrustlessWorkXdrWithPollar } from '~/lib/pollar/integrations/trustless-work.signer'
import { useKindfiPollarClientState } from '~/lib/pollar/use-kindfi-pollar-client-state'

export interface TrustlessSubmitResult {
	signedXdr?: string
	hash?: string
	alreadySubmitted: boolean
}

/**
 * Pollar signing facade for Trustless Work escrow transactions.
 * Uses the singleton Pollar client so escrow hooks work without `<PollarProvider>`.
 */
export const usePollarSigner = () => {
	const { data: session } = useSession()
	const { isAuthenticated, verified, wallet, getClient } = useKindfiPollarClientState()

	const sessionPollarAddress = session?.user?.wallet?.address ?? session?.wallet?.address ?? null

	const isPollarUser =
		session?.user?.onboardingProvider === 'pollar' ||
		(wallet?.custody === 'internal' && isAuthenticated)

	const pollarAddress = wallet?.address ?? sessionPollarAddress

	const isPollarReady =
		isPollarUser && isAuthenticated && verified && isExternalStellarWalletAddress(pollarAddress)

	const signAndSubmitTrustless = useCallback(
		async (unsignedXdr: string): Promise<TrustlessSubmitResult> => {
			if (!isPollarReady) {
				throw new Error('Pollar wallet is not ready for signing')
			}

			const outcome = await signTrustlessWorkXdrWithPollar(getClient(), unsignedXdr)

			return {
				hash: outcome.hash,
				alreadySubmitted: true,
			}
		},
		[getClient, isPollarReady],
	)

	const getPollarWalletAddress = useCallback((): string | null => {
		if (!isExternalStellarWalletAddress(pollarAddress)) {
			return null
		}
		return pollarAddress
	}, [pollarAddress])

	return {
		isPollarUser,
		isPollarReady,
		pollarAddress,
		signAndSubmitTrustless,
		getPollarWalletAddress,
		getClient,
	}
}

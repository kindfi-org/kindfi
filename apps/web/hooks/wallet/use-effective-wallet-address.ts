'use client'

import { isExternalStellarWalletAddress } from '@packages/lib/utils/wallet-address'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { usePollarSigner } from '~/hooks/pollar/use-pollar-signer'

export interface UseEffectiveWalletAddressOptions {
	/** Profile-level Pollar wallet address (from DB). */
	profilePollarAddress?: string | null
	/** Profile-level external wallet address (from DB). */
	profileExternalAddress?: string | null
}

/**
 * Resolves the best available Stellar G-address for the current user.
 * Mirrors server-side `resolveUserStellarAddress` priority for client surfaces.
 */
export function useEffectiveWalletAddress(options: UseEffectiveWalletAddressOptions = {}) {
	const { data: session } = useSession()
	const { address: kitAddress, isConnected: isKitConnected, connect, disconnect } = useWallet()
	const { isPollarReady, isPollarUser, pollarAddress, getPollarWalletAddress } = usePollarSigner()

	const sessionWalletAddress = session?.wallet?.address ?? session?.user?.wallet?.address ?? null

	const address = useMemo(() => {
		const candidates = [
			isPollarReady ? pollarAddress : null,
			getPollarWalletAddress(),
			options.profilePollarAddress,
			sessionWalletAddress,
			options.profileExternalAddress,
			isKitConnected ? kitAddress : null,
		]

		for (const candidate of candidates) {
			if (isExternalStellarWalletAddress(candidate)) {
				return candidate
			}
		}

		return null
	}, [
		getPollarWalletAddress,
		isKitConnected,
		isPollarReady,
		kitAddress,
		options.profileExternalAddress,
		options.profilePollarAddress,
		pollarAddress,
		sessionWalletAddress,
	])

	return {
		address,
		isReady: Boolean(address),
		isPollarSigner: isPollarReady,
		isPollarUser,
		isKitConnected,
		connectKit: connect,
		disconnectKit: disconnect,
	}
}

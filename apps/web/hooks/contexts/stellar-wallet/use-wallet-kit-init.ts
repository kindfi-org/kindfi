'use client'

import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { KitEventType, Networks } from '@creit-tech/stellar-wallets-kit/types'
import { useEffect, useRef } from 'react'
import { getStellarWalletTheme } from '~/lib/config/stellar-wallet-theme'
import {
	clearWalletStorage,
	getStoredWalletAddress,
	persistWalletAddress,
	persistWalletName,
} from './stellar-wallet-storage'
import { WALLET_ADDRESS_KEY, WALLET_ID_TO_NAME } from './stellar-wallet.types'

type UseWalletKitInitParams = {
	setAddress: (address: string | null) => void
	setWalletName: (name: string | null) => void
	setIsInitialized: (initialized: boolean) => void
}

export const useWalletKitInit = ({
	setAddress,
	setWalletName,
	setIsInitialized,
}: UseWalletKitInitParams) => {
	const subscriptionsRef = useRef<Array<() => void>>([])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
	useEffect(() => {
		if (typeof window === 'undefined') return

		try {
			const modules = defaultModules()
			console.log(
				'🔌 Initializing Stellar Wallets Kit with modules:',
				modules.map((m) => m.productName),
			)

			StellarWalletsKit.init({
				modules,
				network: Networks.TESTNET,
				theme: getStellarWalletTheme(),
				authModal: {
					showInstallLabel: true,
					hideUnsupportedWallets: false,
				},
			})

			const storedAddress = getStoredWalletAddress()
			if (storedAddress) {
				StellarWalletsKit.getAddress()
					.then(({ address: fetchedAddress }: { address: string }) => {
						if (fetchedAddress && fetchedAddress !== storedAddress) {
							setAddress(fetchedAddress)
						}
					})
					.catch(() => {
						setAddress(null)
						setWalletName(null)
						clearWalletStorage()
					})
			}

			setIsInitialized(true)
			console.log('✅ Stellar Wallets Kit initialized successfully')

			const unsubscribeState = StellarWalletsKit.on(
				KitEventType.STATE_UPDATED,
				(event: {
					payload: { address?: string; networkPassphrase: string }
				}) => {
					if (event.payload.address) {
						setAddress(event.payload.address)
						persistWalletAddress(event.payload.address)
					} else {
						setAddress(null)
						localStorage.removeItem(WALLET_ADDRESS_KEY)
					}
				},
			)

			const unsubscribeDisconnect = StellarWalletsKit.on(
				KitEventType.DISCONNECT,
				() => {
					setAddress(null)
					setWalletName(null)
					clearWalletStorage()
				},
			)

			const unsubscribeWalletSelected = StellarWalletsKit.on(
				KitEventType.WALLET_SELECTED,
				(event: { payload: { id?: string } }) => {
					if (event.payload.id) {
						const name =
							WALLET_ID_TO_NAME[event.payload.id] || event.payload.id
						setWalletName(name)
						persistWalletName(name)
					}
				},
			)

			subscriptionsRef.current = [
				unsubscribeState,
				unsubscribeDisconnect,
				unsubscribeWalletSelected,
			]
		} catch (error) {
			console.error('❌ Failed to initialize StellarWalletsKit:', error)
			setIsInitialized(false)
		}

		return () => {
			subscriptionsRef.current.forEach((unsubscribe) => {
				unsubscribe()
			})
			subscriptionsRef.current = []
		}
	}, [])
}

'use client'

import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { KitEventType } from '@creit-tech/stellar-wallets-kit/types'
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils'
import { Networks } from '@creit-tech/stellar-wallets-kit/types'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getStellarWalletTheme } from '~/lib/config/stellar-wallet-theme'

interface WalletContextValue {
	address: string | null
	walletName: string | null
	isConnected: boolean
	isInitialized: boolean
	connect: () => Promise<void>
	disconnect: () => void
	signTransaction: (unsignedXdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [address, setAddress] = useState<string | null>(null)
	const [walletName, setWalletName] = useState<string | null>(null)
	const [isInitialized, setIsInitialized] = useState(false)
	const subscriptionsRef = useRef<Array<() => void>>([])

	useEffect(() => {
		// Initialize wallet kit only on client side
		if (typeof window === 'undefined') return

		// Load stored address from localStorage
		const storedAddress = localStorage.getItem('stellar_wallet_address')
		const storedName = localStorage.getItem('stellar_wallet_name')
		if (storedAddress) {
			setAddress(storedAddress)
			setWalletName(storedName)
		}

		// Initialize StellarWalletsKit with custom theme
		try {
			StellarWalletsKit.init({
				modules: defaultModules(),
				network: Networks.TESTNET,
				theme: getStellarWalletTheme(),
				authModal: {
					showInstallLabel: true,
					hideUnsupportedWallets: false,
				},
			})
			setIsInitialized(true)

			// Try to get address if already connected
			if (storedAddress) {
				StellarWalletsKit.getAddress()
					.then(({ address: currentAddress }: { address: string }) => {
						if (currentAddress) {
							setAddress(currentAddress)
						}
					})
					.catch(() => {
						// If getAddress fails, clear stored data
						setAddress(null)
						setWalletName(null)
						localStorage.removeItem('stellar_wallet_address')
						localStorage.removeItem('stellar_wallet_name')
					})
			}

			// Listen to state updates
			const unsubscribeState = StellarWalletsKit.on(
				KitEventType.STATE_UPDATED,
				(event: { payload: { address?: string; networkPassphrase: string } }) => {
					if (event.payload.address) {
						setAddress(event.payload.address)
						localStorage.setItem('stellar_wallet_address', event.payload.address)
					} else {
						setAddress(null)
						localStorage.removeItem('stellar_wallet_address')
					}
				},
			)

			// Listen to disconnect events
			const unsubscribeDisconnect = StellarWalletsKit.on(
				KitEventType.DISCONNECT,
				() => {
					setAddress(null)
					setWalletName(null)
					localStorage.removeItem('stellar_wallet_address')
					localStorage.removeItem('stellar_wallet_name')
				},
			)

			// Listen to wallet selection
			const unsubscribeWalletSelected = StellarWalletsKit.on(
				KitEventType.WALLET_SELECTED,
				(event: { payload: { id?: string } }) => {
					// Wallet name will be available from the module, but we can try to get it
					// For now, we'll just store the wallet ID
					if (event.payload.id) {
						// You might want to map wallet IDs to names
						const walletIdToName: Record<string, string> = {
							freighter: 'Freighter',
							albedo: 'Albedo',
							rabet: 'Rabet',
							xbull: 'xBull',
							walletconnect: 'WalletConnect',
						}
						const name = walletIdToName[event.payload.id] || event.payload.id
						setWalletName(name)
						localStorage.setItem('stellar_wallet_name', name)
					}
				},
			)

			subscriptionsRef.current = [
				unsubscribeState,
				unsubscribeDisconnect,
				unsubscribeWalletSelected,
			]
		} catch (error) {
			console.error('Failed to initialize StellarWalletsKit:', error)
		}

		// Cleanup subscriptions on unmount
		return () => {
			subscriptionsRef.current.forEach((unsubscribe) => unsubscribe())
			subscriptionsRef.current = []
		}
	}, [])

	const connect = async () => {
		if (!isInitialized) {
			throw new Error('Wallet kit not initialized')
		}

		try {
			const { address: newAddress } = await StellarWalletsKit.authModal()
			if (newAddress) {
				setAddress(newAddress)
				localStorage.setItem('stellar_wallet_address', newAddress)
				// Try to get wallet name from the selected wallet
				// This might need adjustment based on actual API behavior
			}
		} catch (error) {
			console.error('Failed to connect wallet:', error)
			throw error
		}
	}

	const disconnect = () => {
		if (!isInitialized) return
		try {
			StellarWalletsKit.disconnect()
			setAddress(null)
			setWalletName(null)
			localStorage.removeItem('stellar_wallet_address')
			localStorage.removeItem('stellar_wallet_name')
		} catch (error) {
			console.error('Failed to disconnect wallet:', error)
		}
	}

	const signTransaction = async (unsignedXdr: string) => {
		if (!isInitialized) {
			throw new Error('Wallet kit not initialized')
		}
		if (!address) {
			throw new Error('Wallet not connected')
		}

		try {
			const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
				address,
				networkPassphrase: Networks.TESTNET,
			})
			return signedTxXdr
		} catch (error) {
			console.error('Failed to sign transaction:', error)
			throw error
		}
	}

	const value: WalletContextValue = {
		address,
		walletName,
		isConnected: Boolean(address),
		isInitialized,
		connect,
		disconnect,
		signTransaction,
	}

	return (
		<WalletContext.Provider value={value}>{children}</WalletContext.Provider>
	)
}

export function useWallet() {
	const ctx = useContext(WalletContext)
	if (!ctx) throw new Error('useWallet must be used within WalletProvider')
	return ctx
}

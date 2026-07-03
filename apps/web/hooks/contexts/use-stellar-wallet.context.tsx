'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'
import { getClientStellarNetworkPassphrase } from '~/lib/config/stellar-network.config'
import { getStellarWalletTheme } from '~/lib/config/stellar-wallet-theme'
import {
	getTrustlessSignerError,
	isExternalStellarWalletAddress,
} from '~/lib/utils/escrow/trustless-signer'
import {
	isLocalStorageAvailable,
	safeLocalStorageGet,
	safeLocalStorageRemove,
	safeLocalStorageSet,
} from '~/lib/utils/safe-storage'

/** Loaded only in the browser so kit state does not touch Node's broken `localStorage` polyfill. */
type StellarWalletsKitModules = {
	defaultModules: typeof import('@creit-tech/stellar-wallets-kit/modules/utils').defaultModules
	StellarWalletsKit: typeof import('@creit-tech/stellar-wallets-kit/sdk').StellarWalletsKit
	KitEventType: typeof import('@creit-tech/stellar-wallets-kit/types').KitEventType
	Networks: typeof import('@creit-tech/stellar-wallets-kit/types').Networks
}

const loadStellarWalletsKit = (): Promise<StellarWalletsKitModules> =>
	Promise.all([
		import('@creit-tech/stellar-wallets-kit/modules/utils'),
		import('@creit-tech/stellar-wallets-kit/sdk'),
		import('@creit-tech/stellar-wallets-kit/types'),
	]).then(([utils, sdk, types]) => ({
		defaultModules: utils.defaultModules,
		StellarWalletsKit: sdk.StellarWalletsKit,
		KitEventType: types.KitEventType,
		Networks: types.Networks,
	}))

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

const syncLinkedWallet = async (address: string | null) => {
	try {
		await fetch('/api/profile/wallet', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ address }),
		})
	} catch (error) {
		logger.error('Failed to sync linked external wallet:', error)
	}
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const { status: sessionStatus } = useSession()
	const isAuthenticated = sessionStatus === 'authenticated'
	const isAuthenticatedRef = useRef(isAuthenticated)
	isAuthenticatedRef.current = isAuthenticated

	const syncLinkedWalletIfAuthenticatedRef = useRef<(address: string | null) => void>(() => {})
	syncLinkedWalletIfAuthenticatedRef.current = (address: string | null) => {
		if (!isAuthenticatedRef.current) return
		void syncLinkedWallet(address)
	}

	// Initialize state from localStorage if available (client-side only)
	const [address, setAddress] = useState<string | null>(() => {
		if (typeof window === 'undefined') return null
		const stored = safeLocalStorageGet('stellar_wallet_address')
		if (stored && !isExternalStellarWalletAddress(stored)) {
			safeLocalStorageRemove('stellar_wallet_address')
			safeLocalStorageRemove('stellar_wallet_name')
		}
		return isExternalStellarWalletAddress(stored) ? stored : null
	})
	const [walletName, setWalletName] = useState<string | null>(() => {
		if (typeof window === 'undefined') return null
		return safeLocalStorageGet('stellar_wallet_name')
	})
	const [isInitialized, setIsInitialized] = useState(false)
	const subscriptionsRef = useRef<Array<() => void>>([])
	const swkRef = useRef<StellarWalletsKitModules | null>(null)

	// Initialize wallet kit once on mount
	useEffect(() => {
		// Initialize wallet kit only on client side
		if (typeof window === 'undefined') return

		let cancelled = false

		void (async () => {
			try {
				const swk = await loadStellarWalletsKit()
				if (cancelled) return

				if (!isLocalStorageAvailable()) {
					logger.error(
						'StellarWalletsKit requires browser localStorage. Storage may be blocked by privacy settings.',
					)
					return
				}

				swkRef.current = swk
				const { defaultModules, StellarWalletsKit, KitEventType, Networks } = swk

				const modules = defaultModules()
				const networkPassphrase = getClientStellarNetworkPassphrase()
				const kitNetwork =
					networkPassphrase === Networks.PUBLIC
						? Networks.PUBLIC
						: networkPassphrase === Networks.FUTURENET
							? Networks.FUTURENET
							: Networks.TESTNET

				StellarWalletsKit.init({
					modules,
					network: kitNetwork,
					theme: getStellarWalletTheme(),
					authModal: {
						showInstallLabel: true,
						hideUnsupportedWallets: false,
					},
				})
				// Try to get address if already connected (read from localStorage directly to avoid dependency)
				const storedAddress = safeLocalStorageGet('stellar_wallet_address')
				if (storedAddress) {
					StellarWalletsKit.getAddress()
						.then(({ address: fetchedAddress }: { address: string }) => {
							if (fetchedAddress && !isExternalStellarWalletAddress(fetchedAddress)) {
								setAddress(null)
								setWalletName(null)
								safeLocalStorageRemove('stellar_wallet_address')
								safeLocalStorageRemove('stellar_wallet_name')
								return
							}
							if (fetchedAddress && fetchedAddress !== storedAddress) {
								setAddress(fetchedAddress)
								syncLinkedWalletIfAuthenticatedRef.current(fetchedAddress)
							}
						})
						.catch(() => {
							// If getAddress fails, clear stored data
							setAddress(null)
							setWalletName(null)
							safeLocalStorageRemove('stellar_wallet_address')
							safeLocalStorageRemove('stellar_wallet_name')
						})
				}

				setIsInitialized(true)

				// Listen to state updates
				const unsubscribeState = StellarWalletsKit.on(
					KitEventType.STATE_UPDATED,
					(event: { payload: { address?: string; networkPassphrase: string } }) => {
						if (event.payload.address) {
							if (!isExternalStellarWalletAddress(event.payload.address)) {
								setAddress(null)
								safeLocalStorageRemove('stellar_wallet_address')
								return
							}
							setAddress(event.payload.address)
							safeLocalStorageSet('stellar_wallet_address', event.payload.address)
							syncLinkedWalletIfAuthenticatedRef.current(event.payload.address)
						} else {
							setAddress(null)
							safeLocalStorageRemove('stellar_wallet_address')
							syncLinkedWalletIfAuthenticatedRef.current(null)
						}
					},
				)

				// Listen to disconnect events
				const unsubscribeDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
					setAddress(null)
					setWalletName(null)
					safeLocalStorageRemove('stellar_wallet_address')
					safeLocalStorageRemove('stellar_wallet_name')
					syncLinkedWalletIfAuthenticatedRef.current(null)
				})

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
							safeLocalStorageSet('stellar_wallet_name', name)
						}
					},
				)

				subscriptionsRef.current = [
					unsubscribeState,
					unsubscribeDisconnect,
					unsubscribeWalletSelected,
				]
			} catch (error) {
				logger.error('❌ Failed to initialize StellarWalletsKit:', error)
				setIsInitialized(false)
			}
		})()

		// Cleanup subscriptions on unmount
		return () => {
			cancelled = true
			swkRef.current = null
			setIsInitialized(false)
			subscriptionsRef.current.forEach((unsubscribe) => {
				unsubscribe()
			})
			subscriptionsRef.current = []
		}
	}, [])

	useEffect(() => {
		if (!isInitialized) return
		if (!address) return
		if (!isAuthenticated) return
		void syncLinkedWallet(address)
	}, [isInitialized, address, isAuthenticated])

	const connect = async () => {
		const { StellarWalletsKit } = swkRef.current ?? {}
		if (!isInitialized || !StellarWalletsKit) {
			throw new Error('Wallet kit not initialized')
		}

		try {
			// Refresh supported wallets before showing modal to ensure latest availability
			await StellarWalletsKit.refreshSupportedWallets()

			const { address: newAddress } = await StellarWalletsKit.authModal()
			if (newAddress) {
				if (!isExternalStellarWalletAddress(newAddress)) {
					throw new Error(
						'Trustless Work requires an external Stellar wallet (G-address). Smart accounts are not supported yet.',
					)
				}
				setAddress(newAddress)
				safeLocalStorageSet('stellar_wallet_address', newAddress)
				syncLinkedWalletIfAuthenticatedRef.current(newAddress)
				// Try to get wallet name from the selected wallet
				// This might need adjustment based on actual API behavior
			}
		} catch (error) {
			logger.error('❌ Failed to connect wallet:', error)
			// Re-throw with more context
			if (error && typeof error === 'object' && 'message' in error) {
				throw new Error(`Wallet connection failed: ${error.message}`)
			}
			throw error
		}
	}

	const disconnect = () => {
		const { StellarWalletsKit } = swkRef.current ?? {}
		if (!isInitialized || !StellarWalletsKit) return
		try {
			StellarWalletsKit.disconnect()
			setAddress(null)
			setWalletName(null)
			safeLocalStorageRemove('stellar_wallet_address')
			safeLocalStorageRemove('stellar_wallet_name')
			syncLinkedWalletIfAuthenticatedRef.current(null)
		} catch (error) {
			logger.error('Failed to disconnect wallet:', error)
		}
	}

	const signTransaction = async (unsignedXdr: string) => {
		const { StellarWalletsKit, Networks } = swkRef.current ?? {}
		if (!isInitialized || !StellarWalletsKit || !Networks) {
			throw new Error('Wallet kit not initialized')
		}
		if (!address) {
			throw new Error('Wallet not connected')
		}

		const signerError = getTrustlessSignerError(address)
		if (signerError) {
			throw new Error(signerError)
		}

		try {
			const networkPassphrase = getClientStellarNetworkPassphrase()
			const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
				address,
				networkPassphrase,
			})
			return signedTxXdr
		} catch (error) {
			logger.error('Failed to sign transaction:', error)
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

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
	const ctx = useContext(WalletContext)
	if (!ctx) throw new Error('useWallet must be used within WalletProvider')
	return ctx
}

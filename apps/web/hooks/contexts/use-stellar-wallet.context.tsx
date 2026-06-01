'use client'

import { createContext, useContext, useState } from 'react'
import {
	getStoredWalletAddress,
	getStoredWalletName,
} from './stellar-wallet/stellar-wallet-storage'
import type { WalletContextValue } from './stellar-wallet/stellar-wallet.types'
import { useWalletActions } from './stellar-wallet/use-wallet-actions'
import { useWalletKitInit } from './stellar-wallet/use-wallet-kit-init'

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [address, setAddress] = useState<string | null>(() =>
		getStoredWalletAddress(),
	)
	const [walletName, setWalletName] = useState<string | null>(() =>
		getStoredWalletName(),
	)
	const [isInitialized, setIsInitialized] = useState(false)

	useWalletKitInit({ setAddress, setWalletName, setIsInitialized })

	const { connect, disconnect, signTransaction } = useWalletActions({
		address,
		isInitialized,
		setAddress,
		setWalletName,
	})

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

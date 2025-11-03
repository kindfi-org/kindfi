'use client'

import {
	AlbedoModule,
	FREIGHTER_ID,
	FreighterModule,
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

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
	const kitRef = useRef<StellarWalletsKit | null>(null)

	useEffect(() => {
		// Initialize wallet kit only on client side
		if (typeof window === 'undefined') return

		const storedAddress = localStorage.getItem('stellar_wallet_address')
		const storedName = localStorage.getItem('stellar_wallet_name')
		if (storedAddress) setAddress(storedAddress)
		if (storedName) setWalletName(storedName)

		// Initialize StellarWalletsKit
		kitRef.current = new StellarWalletsKit({
			network: WalletNetwork.TESTNET,
			selectedWalletId: FREIGHTER_ID,
			modules: [new FreighterModule(), new AlbedoModule()],
		})

		setIsInitialized(true)
	}, [])

	const connect = async () => {
		if (!kitRef.current) {
			throw new Error('Wallet kit not initialized')
		}

		await kitRef.current.openModal({
			onWalletSelected: async (option) => {
				if (!kitRef.current) return
				kitRef.current.setWallet(option.id)
				const { address } = await kitRef.current.getAddress()
				setAddress(address)
				setWalletName(option.name)
				localStorage.setItem('stellar_wallet_address', address)
				localStorage.setItem('stellar_wallet_name', option.name)
			},
		})
	}

	const disconnect = () => {
		if (!kitRef.current) return
		kitRef.current.disconnect()
		setAddress(null)
		setWalletName(null)
		localStorage.removeItem('stellar_wallet_address')
		localStorage.removeItem('stellar_wallet_name')
	}

	const signTransaction = async (unsignedXdr: string) => {
		if (!kitRef.current) {
			throw new Error('Wallet kit not initialized')
		}
		if (!address) {
			throw new Error('Wallet not connected')
		}
		const { signedTxXdr } = await kitRef.current.signTransaction(unsignedXdr, {
			address,
			networkPassphrase: WalletNetwork.TESTNET,
		})
		return signedTxXdr
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

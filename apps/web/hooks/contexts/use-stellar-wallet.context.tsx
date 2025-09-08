'use client'

import {
	AlbedoModule,
	FREIGHTER_ID,
	FreighterModule,
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface WalletContextValue {
	address: string | null
	walletName: string | null
	isConnected: boolean
	connect: () => Promise<void>
	disconnect: () => void
	signTransaction: (unsignedXdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [address, setAddress] = useState<string | null>(null)
	const [walletName, setWalletName] = useState<string | null>(null)

	useEffect(() => {
		const storedAddress = localStorage.getItem('stellar_wallet_address')
		const storedName = localStorage.getItem('stellar_wallet_name')
		if (storedAddress) setAddress(storedAddress)
		if (storedName) setWalletName(storedName)
	}, [])

	const kit = useMemo(
		() =>
			new StellarWalletsKit({
				network:
					process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
					process.env.NODE_ENV === 'production'
						? WalletNetwork.PUBLIC
						: WalletNetwork.TESTNET,
				selectedWalletId: FREIGHTER_ID,
				modules: [new FreighterModule(), new AlbedoModule()],
			}),
		[],
	)

	const connect = async () => {
		await kit.openModal({
			onWalletSelected: async (option) => {
				kit.setWallet(option.id)
				const { address } = await kit.getAddress()
				setAddress(address)
				setWalletName(option.name)
				localStorage.setItem('stellar_wallet_address', address)
				localStorage.setItem('stellar_wallet_name', option.name)
			},
		})
	}

	const disconnect = () => {
		kit.disconnect()
		setAddress(null)
		setWalletName(null)
		localStorage.removeItem('stellar_wallet_address')
		localStorage.removeItem('stellar_wallet_name')
	}

	const signTransaction = async (unsignedXdr: string) => {
		if (!address) throw new Error('Wallet not connected')
		const { signedTxXdr } = await kit.signTransaction(unsignedXdr, {
			address,
			networkPassphrase:
				process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
				process.env.NODE_ENV === 'production'
					? WalletNetwork.PUBLIC
					: WalletNetwork.TESTNET,
		})
		return signedTxXdr
	}

	const value: WalletContextValue = {
		address,
		walletName,
		isConnected: Boolean(address),
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

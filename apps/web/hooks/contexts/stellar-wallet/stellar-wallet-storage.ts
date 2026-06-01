import {
	WALLET_ADDRESS_KEY,
	WALLET_NAME_KEY,
} from './stellar-wallet.types'

export const getStoredWalletAddress = (): string | null => {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(WALLET_ADDRESS_KEY)
}

export const getStoredWalletName = (): string | null => {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(WALLET_NAME_KEY)
}

export const persistWalletAddress = (address: string) => {
	localStorage.setItem(WALLET_ADDRESS_KEY, address)
}

export const persistWalletName = (name: string) => {
	localStorage.setItem(WALLET_NAME_KEY, name)
}

export const clearWalletStorage = () => {
	localStorage.removeItem(WALLET_ADDRESS_KEY)
	localStorage.removeItem(WALLET_NAME_KEY)
}

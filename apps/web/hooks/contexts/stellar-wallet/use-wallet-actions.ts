'use client'

import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { Networks } from '@creit-tech/stellar-wallets-kit/types'
import {
	clearWalletStorage,
	persistWalletAddress,
} from './stellar-wallet-storage'

type UseWalletActionsParams = {
	address: string | null
	isInitialized: boolean
	setAddress: (address: string | null) => void
	setWalletName: (name: string | null) => void
}

export const useWalletActions = ({
	address,
	isInitialized,
	setAddress,
	setWalletName,
}: UseWalletActionsParams) => {
	const connect = async () => {
		if (!isInitialized) {
			throw new Error('Wallet kit not initialized')
		}

		try {
			console.log('🔌 Opening wallet connection modal...')
			const supportedWallets = await StellarWalletsKit.refreshSupportedWallets()
			console.log(
				'📋 Available wallets:',
				supportedWallets.map(
					(w: { name: string; isAvailable: boolean }) =>
						`${w.name} (${w.isAvailable ? 'available' : 'unavailable'})`,
				),
			)

			const { address: newAddress } = await StellarWalletsKit.authModal()
			if (newAddress) {
				console.log('✅ Wallet connected:', newAddress)
				setAddress(newAddress)
				persistWalletAddress(newAddress)
			}
		} catch (error) {
			console.error('❌ Failed to connect wallet:', error)
			if (error && typeof error === 'object' && 'message' in error) {
				throw new Error(`Wallet connection failed: ${error.message}`)
			}
			throw error
		}
	}

	const disconnect = () => {
		if (!isInitialized) return
		try {
			StellarWalletsKit.disconnect()
			setAddress(null)
			setWalletName(null)
			clearWalletStorage()
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
			const { signedTxXdr } = await StellarWalletsKit.signTransaction(
				unsignedXdr,
				{
					address,
					networkPassphrase: Networks.TESTNET,
				},
			)
			return signedTxXdr
		} catch (error) {
			console.error('Failed to sign transaction:', error)
			throw error
		}
	}

	return { connect, disconnect, signTransaction }
}

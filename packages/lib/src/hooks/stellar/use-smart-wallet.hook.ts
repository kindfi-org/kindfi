// TODO: REFACTOR THIS TO DO HOOK FOR SMART WALLET MANAGEMENT (transferXML/USDC, transaction invoke, balances, verification)
'use client'

import { debounce } from 'lodash'
import type { Session, User } from 'next-auth'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useStellarSignature } from './use-stellar-signature.hook'

export interface ContractOperation {
	contractAddress: string
	functionName: string
	args: unknown[]
	auth?: string[]
}

export interface StellarAccount {
	address: string
	contractId: string
	balance: string
	sequence: string
	status: string
	error?: string
}

/**
 * Hook for managing Stellar Soroban accounts and contract interactions with Passkeys
 * Provides high-level operations for DeFi and smart contract interactions
 */
export const useStellarSorobanAccount = (session?: Session | null) => {
	const [account, setAccount] = useState<StellarAccount | null>(null)
	const [isInitialized, setIsInitialized] = useState(false)
	const [requestId, setRequestId] = useState<string | null>(null)

	const stellarSignature = useStellarSignature({
		onSuccess: (result) => {
			console.log('✅ Transaction successful:', result)
			// Refresh account info after successful transaction
			if (account?.contractId) {
				refreshAccountInfo()
			}
		},
		onError: (error) => {
			console.error('❌ Transaction failed:', error)
		},
		// Pass session directly to avoid useSession call inside useStellarSignature
		// This prevents the SessionProvider requirement error
		session: session ?? null,
	})

	/**
	 * Initialize or load existing Stellar account for the current user
	 * This simulates the approval process - in production, this should only happen after KYC approval
	 */
	const initializeAccount = useCallback(async (): Promise<StellarAccount> => {
		if (!session?.user || !session?.user?.device) {
			throw new Error('User not authenticated or no device available')
		}

		// Generate unique request ID to prevent duplicate requests
		const currentRequestId = Math.random().toString(36).substring(7)
		setRequestId(currentRequestId)

		try {
			// Check if user already has a Stellar account
			const existingAddress = session.user.device.address

			// User has an existing address, get account info
			const accountInfo = await stellarSignature.getAccountInfo(existingAddress)

			const accountData: StellarAccount = {
				address: existingAddress,
				contractId: existingAddress,
				balance: accountInfo.balance,
				sequence: accountInfo.sequence,
				status: accountInfo.status,
			}

			if (requestId === currentRequestId) {
				// Only update state if this is still the current request
				setAccount(accountData)
				setIsInitialized(true)
				setRequestId(null)
			}

			if (accountData.status === 'not_found') {
				console.log(
					'❌ No existing account for logged user, simulating approval process...',
				)

				// SIMULATION: In production, this should only happen after KYC approval
				// For testing purposes, we'll simulate the account creation
				console.log(
					'🧪 SIMULATION: Creating Stellar account (this should only happen after approval)',
				)

				const newAccount = await stellarSignature.approveKYCAccount()

				const accountData: StellarAccount = {
					address: newAccount.address,
					contractId: newAccount.contractId,
					balance: '0',
					sequence: '0',
					status: 'active',
				}

				if (requestId === currentRequestId) {
					// Only update state if this is still the current request
					setAccount(accountData)
					setIsInitialized(true)
					setRequestId(null)

					// TODO: Update device record with new Stellar address
					toast.success(
						`🧪 SIMULATION: Stellar account created: ${newAccount.address}`,
					)
				}

				return accountData
			}

			return accountData
		} catch (error) {
			console.error('❌ Error initializing account:', error)
			setRequestId(null)
			throw error
		}
	}, [session, stellarSignature, requestId])

	/**
	 * Refresh account information from the blockchain
	 */
	const refreshAccountInfo = useCallback(async () => {
		if (!account?.contractId) return

		try {
			const accountInfo = await stellarSignature.getAccountInfo(
				account.contractId,
			)

			setAccount((prev) =>
				prev
					? {
							...prev,
							balance: accountInfo.balance,
							sequence: accountInfo.sequence,
							status: accountInfo.status,
						}
					: null,
			)
		} catch (error) {
			console.error('❌ Error refreshing account info:', error)
		}
	}, [account?.contractId, stellarSignature])

	/**
	 * Execute a Soroban smart contract function
	 */
	const invokeContract = useCallback(
		async (operation: ContractOperation) => {
			if (!account?.contractId) {
				throw new Error('Account not initialized')
			}

			const stellarOperation = {
				type: 'invoke_contract',
				contractAddress: operation.contractAddress,
				functionName: operation.functionName,
				args: operation.args,
				auth: operation.auth,
			}

			return await stellarSignature.signTransaction(
				stellarOperation,
				account.contractId,
			)
		},
		[account?.contractId, stellarSignature],
	)

	// Auto-initialize account when session is available
	useEffect(() => {
		if (
			session?.user?.device &&
			!isInitialized &&
			!stellarSignature.isLoading &&
			!requestId
		) {
			debounce(() => initializeAccount().catch(console.error), 6000)()
		}
	}, [
		session,
		isInitialized,
		stellarSignature.isLoading,
		requestId,
		initializeAccount,
	])

	return {
		// Account state
		account,
		isInitialized,
		isLoading: stellarSignature.isLoading || !!requestId,
		error: stellarSignature.error,

		// Account management
		initializeAccount,
		refreshAccountInfo,

		// Transaction operations
		invokeContract,

		// Low-level access
		signTransaction: stellarSignature.signTransaction,
		verifySignature: stellarSignature.verifySignature,

		// Computed properties
		isReady: stellarSignature.isReady && isInitialized,
		address: account?.address,
		balance: account?.balance,
		contractId: account?.contractId,
	}
}

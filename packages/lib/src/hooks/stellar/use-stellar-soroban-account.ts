import { debounce } from 'lodash'
import type { User } from 'next-auth'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useStellarSignature } from './use-stellar-signature'

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
export const useStellarSorobanAccount = (session?: User) => {
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
	})

	/**
	 * Initialize or load existing Stellar account for the current user
	 */
	const initializeAccount = useCallback(async (): Promise<StellarAccount> => {
		if (!session || !session?.device) {
			throw new Error('User not authenticated or no device available')
		}

		// Generate unique request ID to prevent duplicate requests
		const currentRequestId = Math.random().toString(36).substring(7)
		setRequestId(currentRequestId)

		try {
			// Check if user already has a Stellar account
			const existingAddress = session.device.address

			if (!existingAddress || existingAddress === '0x') {
				throw new Error('❌ No existing account for logged user.')
			}

			const accountInfo = await stellarSignature.getAccountInfo(existingAddress)

			const accountData: StellarAccount = {
				address: existingAddress,
				contractId: existingAddress,
				balance: accountInfo.balance,
				sequence: accountInfo.sequence,
				status: accountInfo.status,
			}

			if (accountData.status === 'not_found') {
				// If no existing address, create new account
				const newAccount = await stellarSignature.createStellarAccount()

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
					toast.success(`Stellar account created: ${newAccount.address}`)
				}
			} else if (requestId === currentRequestId) {
				// Only update state if this is still the current request
				setAccount(accountData)
				setIsInitialized(true)
				setRequestId(null)
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

	/**
	 * Transfer XLM to another address
	 */
	const transferXLM = useCallback(
		async (destination: string, amount: string) => {
			if (!account?.contractId) {
				throw new Error('Account not initialized')
			}

			const operation = {
				type: 'payment',
				destination,
				amount,
				asset: 'native', // XLM
			}

			return await stellarSignature.signTransaction(
				operation,
				account.contractId,
			)
		},
		[account?.contractId, stellarSignature],
	)

	/**
	 * Transfer a Stellar asset to another address
	 */
	const transferAsset = useCallback(
		async (
			destination: string,
			amount: string,
			assetCode: string,
			assetIssuer: string,
		) => {
			if (!account?.contractId) {
				throw new Error('Account not initialized')
			}

			const operation = {
				type: 'payment',
				destination,
				amount,
				asset: `${assetCode}:${assetIssuer}`,
			}

			return await stellarSignature.signTransaction(
				operation,
				account.contractId,
			)
		},
		[account?.contractId, stellarSignature],
	)

	/**
	 * Create a trustline for a Stellar asset
	 */
	const createTrustline = useCallback(
		async (assetCode: string, assetIssuer: string, limit?: string) => {
			if (!account?.contractId) {
				throw new Error('Account not initialized')
			}

			const operation = {
				type: 'change_trust',
				asset: `${assetCode}:${assetIssuer}`,
				limit: limit || undefined,
			}

			return await stellarSignature.signTransaction(
				operation,
				account.contractId,
			)
		},
		[account?.contractId, stellarSignature],
	)

	/**
	 * Deploy a new Soroban smart contract
	 */
	const deployContract = useCallback(
		async (contractWasm: Uint8Array, initArgs: unknown[] = []) => {
			if (!account?.contractId) {
				throw new Error('Account not initialized')
			}

			const operation = {
				type: 'deploy_contract',
				wasmBytes: Array.from(contractWasm),
				initArgs,
			}

			return await stellarSignature.signTransaction(
				operation,
				account.contractId,
			)
		},
		[account?.contractId, stellarSignature],
	)

	// Auto-initialize account when session is available
	useEffect(() => {
		if (
			session?.device &&
			!isInitialized &&
			!stellarSignature.isLoading &&
			!requestId
		) {
			debounce(() => initializeAccount().catch(console.error), 60000)()
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
		transferXLM,
		transferAsset,
		createTrustline,
		deployContract,

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

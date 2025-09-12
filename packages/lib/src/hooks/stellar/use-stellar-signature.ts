import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { startAuthentication } from '@simplewebauthn/browser'
import { useSession } from 'next-auth/react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface StellarOperation {
	type: string
	destination?: string
	amount?: string
	asset?: string
}

export interface SignatureResult {
	signature: string
	transactionHash: string
	success: boolean
}

export interface UseStellarSignatureOptions {
	onSuccess?: (result: SignatureResult) => void
	onError?: (error: Error) => void
}

/**
 * Hook for signing Stellar Soroban transactions with Passkeys
 * Integrates with the KYC server for signature verification and account management
 */
export const useStellarSignature = (
	options: UseStellarSignatureOptions = {},
) => {
	const { data: session } = useSession()
	const [isLoading, setIsLoading] = useState(false)
	const [lastResult, setLastResult] = useState<SignatureResult | null>(null)
	const [error, setError] = useState<string | null>(null)

	const appConfig: AppEnvInterface = appEnvConfig('web')
	const kycBaseUrl = appConfig.externalApis.kyc.baseUrl

	/**
	 * Signs a Stellar transaction using WebAuthn/Passkey
	 */
	const signTransaction = useCallback(
		async (
			operation: StellarOperation,
			contractId: string,
		): Promise<SignatureResult> => {
			if (!session?.user) {
				throw new Error('User not authenticated')
			}

			if (!session.device) {
				throw new Error('No device information available')
			}

			setIsLoading(true)
			setError(null)

			try {
				console.log('🔐 Starting Stellar transaction signature:', {
					operation,
					contractId,
				})

				// Step 1: Generate authentication options for the signature
				const authOptionsResponse = await fetch(
					`${kycBaseUrl}/api/passkey/generate-authentication-options`,
					{
						method: 'POST',
						body: JSON.stringify({
							identifier: session.user.email,
							userId: session.user.id,
							challenge: `stellar_tx_${Date.now()}`,
							origin: window.location.origin,
						}),
					},
				)

				if (!authOptionsResponse.ok) {
					throw new Error('Failed to generate authentication options')
				}

				const authOptions = await authOptionsResponse.json()

				// Step 2: Perform WebAuthn authentication
				const authResult = await startAuthentication(authOptions)

				// Step 3: Verify authentication and execute Stellar transaction
				const stellarResponse = await fetch(
					`${kycBaseUrl}/api/stellar/execute-transaction`,
					{
						method: 'POST',
						body: JSON.stringify({
							contractId,
							operation,
							signature: JSON.stringify(authResult),
						}),
					},
				)

				if (!stellarResponse.ok) {
					throw new Error('Failed to execute Stellar transaction')
				}

				const stellarResult = await stellarResponse.json()

				const result: SignatureResult = {
					signature: JSON.stringify(authResult),
					transactionHash: stellarResult.transactionHash,
					success: true,
				}

				setLastResult(result)
				options.onSuccess?.(result)
				toast.success('Transaction signed and executed successfully!')

				return result
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error('Unknown error occurred')
				console.error('❌ Error signing Stellar transaction:', error)

				setError(error.message)
				options.onError?.(error)
				toast.error(`Transaction failed: ${error.message}`)

				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[session, kycBaseUrl, options],
	)

	/**
	 * Creates a new Stellar account controlled by the current Passkey
	 */
	const createStellarAccount = useCallback(async (): Promise<{
		address: string
		contractId: string
	}> => {
		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		if (!session.device) {
			throw new Error('No device information available')
		}

		setIsLoading(true)
		setError(null)

		try {
			console.log('🌟 Creating Stellar account for user:', session.user.id)
			const userData = session.user

			if (!userData) {
				throw new Error('User session not found. Please login first.')
			}

			const response = await fetch(
				`${kycBaseUrl}/api/stellar/create-passkey-account`,
				{
					method: 'POST',
					body: JSON.stringify({
						credentialId: userData.device?.credential_id,
						publicKey: userData.device?.public_key,
						userId: userData.id,
					}),
				},
			)

			if (!response.ok) {
				console.error('response data', response)
				throw new Error('Failed to create Stellar account')
			}

			const result = await response.json()

			toast.success('Stellar account created successfully!')

			return {
				address: result.data.address,
				contractId: result.data.contractId,
			}
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error('Unknown error occurred')
			console.error('❌ Error creating Stellar account:', error)

			setError(error.message)
			options.onError?.(error)
			// toast.error(`Account creation failed: ${error.message}`)

			throw error
		} finally {
			setIsLoading(false)
		}
	}, [session, kycBaseUrl, options])

	/**
	 * Gets information about a Stellar account controlled by a Passkey
	 */
	const getAccountInfo = useCallback(
		async (contractId: string) => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(
					`${kycBaseUrl}/api/stellar/account-info?contractId=${encodeURIComponent(contractId)}`,
				)

				if (!response.ok) {
					throw new Error('Failed to get account information')
				}

				const result = await response.json()
				return result.data
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error('Unknown error occurred')
				console.error('❌ Error getting account info:', error)

				setError(error.message)
				options.onError?.(error)

				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[kycBaseUrl, options],
	)

	/**
	 * Verifies a signature for a given transaction
	 */
	const verifySignature = useCallback(
		async (
			contractId: string,
			signature: string,
			transactionHash: string,
		): Promise<boolean> => {
			try {
				const response = await fetch(
					`${kycBaseUrl}/api/stellar/verify-signature`,
					{
						method: 'POST',
						body: JSON.stringify({
							contractId,
							signature,
							transactionHash,
						}),
					},
				)

				if (!response.ok) {
					throw new Error('Failed to verify signature')
				}

				const result = await response.json()
				return result.valid
			} catch (err) {
				console.error('❌ Error verifying signature:', err)
				return false
			}
		},
		[kycBaseUrl],
	)

	/**
	 * Reset the hook state
	 */
	const reset = useCallback(() => {
		setError(null)
		setLastResult(null)
		setIsLoading(false)
	}, [])

	return {
		// State
		isLoading,
		error,
		lastResult,

		// Actions
		signTransaction,
		createStellarAccount,
		getAccountInfo,
		verifySignature,
		reset,

		// Computed
		isReady: !!session?.user && !!session?.device,
		userAddress: session?.device?.address,
	}
}

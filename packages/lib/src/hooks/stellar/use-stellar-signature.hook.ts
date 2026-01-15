'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import type { Session } from 'next-auth'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { appEnvConfig } from '../../config'
import type { AppEnvInterface } from '../../types'

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
	session?: Session | null // Optional session parameter to avoid requiring SessionProvider
}

/**
 * Hook for signing Stellar Soroban transactions with Passkeys
 * Integrates with the KYC server for signature verification and account management
 *
 * @param options - Configuration options including optional session
 * @param options.session - Optional session object. If provided, will use this session directly without requiring SessionProvider
 * @requires SessionProvider - Only required if session is not provided via options.session
 * @example
 * ```tsx
 * // Option 1: Pass session directly (recommended - avoids SessionProvider requirement)
 * const session = getSession() // Get session from anywhere
 * useStellarSignature({ session })
 *
 * // Option 2: With SessionProvider (if session is not provided)
 * <SessionProvider>
 *   <ComponentUsingThisHook />
 * </SessionProvider>
 * ```
 */
export const useStellarSignature = (
	options: UseStellarSignatureOptions = {},
) => {
	// Check if session was explicitly provided (either a Session object or null)
	// If session is explicitly provided, we'll use that exclusively
	const hasExplicitSession = 'session' in options

	// When session is explicitly provided, use it directly without calling useSession
	// This avoids the SessionProvider requirement error
	// Note: React hooks must be called unconditionally, but since we're not calling
	// useSession when session is provided, we can avoid the SessionProvider requirement
	const session = useMemo(() => {
		return hasExplicitSession ? options.session : null
	}, [hasExplicitSession, options.session])

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

			const typedSession = session as Session & {
				device?: { credential_id: string; public_key: string; address: string }
			}
			if (!typedSession.device) {
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
	const approveKYCAccount = useCallback(
		async (
			deployOnly = false,
		): Promise<{
			address: string
			contractId: string
		}> => {
			if (!session?.user) {
				throw new Error('User not authenticated')
			}

			const typedSession = session as Session & {
				device?: { credential_id: string; public_key: string; address: string }
			}
			if (!typedSession.device) {
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
		},
		[session, kycBaseUrl, options],
	)

	/**
	 * Gets information about a Stellar account controlled by a Passkey
	 * Uses local API route instead of external KYC server
	 */
	const getAccountInfo = useCallback(
		async (contractId: string) => {
			setIsLoading(true)
			setError(null)

			try {
				// Use local API route instead of external KYC server
				const response = await fetch(
					`/api/stellar/account-info?address=${encodeURIComponent(contractId)}`,
				)

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}))
					throw new Error(
						errorData.error || 'Failed to get account information',
					)
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
		[options],
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
		approveKYCAccount,
		getAccountInfo,
		verifySignature,
		reset,

		// Computed
		isReady: !!session?.user && !!session?.device,
		userAddress: session?.device?.address,
	}
}

'use client'

import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { startAuthentication } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createSessionAction } from '~/app/actions/auth'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

const mapPasskeyApiError = (errorMessage: string): InAppError => {
	if (errorMessage === 'User not found') {
		return new InAppError(ErrorCode.USER_NOT_FOUND)
	}

	if (errorMessage === 'No passkeys registered for this user') {
		return new InAppError(ErrorCode.AUTHENTICATOR_NOT_REGISTERED, errorMessage)
	}

	return new InAppError(ErrorCode.UNEXPECTED_ERROR, errorMessage)
}

const isUserCancelledAuth = (message: string): boolean =>
	message.includes('The operation either timed out or was not allowed.') ||
	message.includes('NotAllowedError') ||
	message.includes('Operation cancelled or not allowed')

/**
 * Hook for Smart Account authentication using WebAuthn passkeys
 * Replaces the KYC server-based authentication flow
 */
export const useSmartAccountAuth = (identifier: string) => {
	const { data: session, update: updateSession } = useSession()
	const router = useRouter()
	const _appConfig: AppEnvInterface = appEnvConfig('web')
	const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
	const [authSuccess, setAuthSuccess] = useState<string>('')
	const [authError, setAuthError] = useState<string>('')
	const [isNotRegistered, setIsNotRegistered] = useState<boolean>(false)

	const reset = () => {
		setIsAuthenticating(false)
		setAuthSuccess('')
		setAuthError('')
		setIsNotRegistered(false)
	}

	const handleAuth = async () => {
		setIsAuthenticating(true)
		setAuthSuccess('')
		setAuthError('')
		setIsNotRegistered(false)

		try {
			// Step 1: Generate authentication options
			// This should be done server-side to maintain security
			const authOptionsResponse = await fetch(
				'/api/passkey/generate-auth-options',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
						origin: window.location.origin,
					}),
				},
			)

			if (!authOptionsResponse.ok) {
				const errorData = await authOptionsResponse.json()
				throw mapPasskeyApiError(errorData.error)
			}

			const authenticationOptions = await authOptionsResponse.json()

			// Step 2: Perform WebAuthn authentication
			const authenticationResponse = await startAuthentication({
				optionsJSON: authenticationOptions,
			})

			// Step 3: Verify authentication and get Smart Account info
			const verificationResp = await fetch('/api/passkey/verify-auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					authenticationResponse,
					origin: window.location.origin,
					userId: session?.user?.id,
				}),
			})

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw mapPasskeyApiError(verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()

			if (!verificationJSON?.verified) {
				throw new InAppError(
					ErrorCode.AUTHENTICATOR_NOT_REGISTERED,
					'Authentication verification failed',
				)
			}

			// Step 4: Create NextAuth session after successful passkey verification
			if (verificationJSON.userId) {
				// First create the session action (for Supabase/backend)
				const sessionResult = await createSessionAction({
					userId: verificationJSON.userId,
					email: identifier,
				})

				if (!sessionResult.success) {
					throw new InAppError(
						ErrorCode.UNEXPECTED_ERROR,
						sessionResult.message,
					)
				}

				// Then sign in with NextAuth to create the client-side session
				// Public key is already base64 encoded from the API
				const pubKeyString = verificationJSON.publicKey || ''

				const loginResult = await signIn('credentials', {
					redirect: false,
					userId: verificationJSON.userId,
					email: identifier,
					pubKey: pubKeyString,
					credentialId: verificationJSON.credentialId,
					address: verificationJSON.smartAccountAddress,
				})

				if (!loginResult?.ok) {
					throw new InAppError(
						ErrorCode.UNEXPECTED_ERROR,
						'Failed to create authentication session',
					)
				}

				// Refresh the session to get updated data
				await updateSession()
			}

			const message = 'User authenticated successfully!'
			setAuthSuccess(message)
			toast.success(message)

			// Mark this as a new session so role selection modal can be shown
			sessionStorage.setItem('kindfi_new_session', 'true')

			// Redirect to profile page after a short delay to allow session to update
			setTimeout(() => {
				router.push('/profile')
				router.refresh() // Refresh to update navigation state
			}, 500)

			return {
				verified: true,
				smartAccountAddress: verificationJSON.smartAccountAddress,
				credentialId: verificationJSON.credentialId,
			}
		} catch (error) {
			const err =
				error instanceof InAppError
					? error
					: new InAppError(
							ErrorCode.UNEXPECTED_ERROR,
							error instanceof Error ? error.message : String(error),
						)

			if (err.code === ErrorCode.USER_NOT_FOUND) {
				setIsNotRegistered(true)
				return { verified: false }
			}

			if (isUserCancelledAuth(err.message)) {
				return { verified: false }
			}

			console.error('Error during Smart Account authentication:', err)

			const message =
				err.code === ErrorCode.AUTHENTICATOR_NOT_REGISTERED
					? err.message
					: `Authentication failed: ${err.message}`

			setAuthError(message)
			toast.error(message)
			return { verified: false }
		} finally {
			setIsAuthenticating(false)
		}
	}

	return {
		isAuthenticating,
		authSuccess,
		authError,
		handleAuth,
		isAuthenticated: Boolean(authSuccess),
		reset,
		isNotRegistered,
	}
}

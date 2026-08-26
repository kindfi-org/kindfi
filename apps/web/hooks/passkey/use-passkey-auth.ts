'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { getSession, signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { createSessionAction } from '~/app/actions/auth'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import { safeSessionStorageSet } from '~/lib/utils/safe-storage'

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
 * Production passkey authentication hook (WebAuthn + NextAuth).
 * Smart Account C-address deployment is optional and controlled by feature flag.
 */
export const usePasskeyAuth = (identifier: string) => {
	const { data: session, update: updateSession } = useSession()
	const router = useRouter()
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
			const authOptionsResponse = await fetch('/api/passkey/generate-auth-options', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin,
				}),
			})

			if (!authOptionsResponse.ok) {
				const errorData = await authOptionsResponse.json()
				throw mapPasskeyApiError(errorData.error)
			}

			const authenticationOptions = await authOptionsResponse.json()

			const authenticationResponse = await startAuthentication({
				optionsJSON: authenticationOptions,
			})

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

			if (verificationJSON.userId) {
				const sessionResult = await createSessionAction({
					userId: verificationJSON.userId,
					email: identifier,
				})

				if (!sessionResult.success) {
					throw new InAppError(ErrorCode.UNEXPECTED_ERROR, sessionResult.message)
				}

				const pubKeyString = verificationJSON.publicKey || ''

				const loginResult = await signIn('credentials', {
					redirect: false,
					userId: verificationJSON.userId,
					email: identifier,
					pubKey: pubKeyString,
					credentialId: verificationJSON.credentialId,
					address: verificationJSON.smartAccountAddress || '0x',
				})

				if (!loginResult?.ok) {
					throw new InAppError(
						ErrorCode.UNEXPECTED_ERROR,
						loginResult?.error ?? 'Failed to create authentication session',
					)
				}

				try {
					await updateSession()
				} catch (updateError) {
					logger.warn(
						'Session update after sign-in failed, falling back to getSession:',
						updateError,
					)
				}

				await getSession()
			}

			const message = 'User authenticated successfully!'
			setAuthSuccess(message)
			toast.success(message)

			safeSessionStorageSet('kindfi_new_session', 'true')

			await router.refresh()
			router.push('/profile')

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

			logger.error('Error during passkey authentication:', err)

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

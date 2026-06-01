'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import {
	createAuthSession,
	fetchAuthOptions,
	formatAuthError,
	verifyAuthentication,
} from './smart-account-auth/auth-utils'

/**
 * Hook for Smart Account authentication using WebAuthn passkeys
 * Replaces the KYC server-based authentication flow
 */
export const useSmartAccountAuth = (identifier: string) => {
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
			const authenticationOptions = await fetchAuthOptions(identifier)

			const authenticationResponse = await startAuthentication({
				optionsJSON: authenticationOptions,
			})

			const verificationJSON = await verifyAuthentication(
				identifier,
				authenticationResponse,
				session?.user?.id,
			)

			if (!verificationJSON?.verified) {
				throw new InAppError(
					ErrorCode.AUTHENTICATOR_NOT_REGISTERED,
					'Authentication verification failed',
				)
			}

			await createAuthSession(verificationJSON, identifier)
			await updateSession()

			const message = 'User authenticated successfully!'
			setAuthSuccess(message)
			toast.success(message)

			sessionStorage.setItem('kindfi_new_session', 'true')

			setTimeout(() => {
				router.push('/profile')
				router.refresh()
			}, 500)

			return {
				verified: true,
				smartAccountAddress: verificationJSON.smartAccountAddress,
				credentialId: verificationJSON.credentialId,
			}
		} catch (error) {
			console.error('🔴 Error during Smart Account authentication:', error)
			const err = error as Error
			const message = formatAuthError(err, setIsNotRegistered)

			setAuthError(message)
			toast.error(message)
			throw error
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

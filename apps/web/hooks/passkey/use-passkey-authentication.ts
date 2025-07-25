import { appEnvConfig, transformEnv } from '@packages/lib/config/app-env.config'
import { supabase } from '@packages/lib/supabase'
import type { AppEnvInterface } from '@packages/lib/types'
import { startAuthentication } from '@simplewebauthn/browser'
import { RedirectType, redirect } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createSessionAction } from '~/app/actions'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import type { PresignResponse, SignParams } from '~/lib/types'

export const usePasskeyAuthentication = (
	identifier: string,
	{
		onSign,
		prepareSign,
		userId,
	}: {
		onSign?: (params: SignParams) => void
		prepareSign?: () => Promise<PresignResponse>
		userId?: string
	},
) => {
	const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
	const [authSuccess, setAuthSuccess] = useState<string>('')
	const [authError, setAuthError] = useState<string>('')
	const [isNotRegistered, setIsNotRegistered] = useState<boolean>(false)

	const reset = () => {
		setIsAuthenticating(false)
		setAuthSuccess('')
		setAuthError('')
	}

	const handleAuth = async () => {
		const appConfig: AppEnvInterface = appEnvConfig('web')
		const baseUrl = appConfig.externalApis.kyc.baseUrl
		// Initiates the authentication process with WebAuthn and prepares for Stellar signing
		setIsAuthenticating(true)
		setAuthSuccess('')
		setAuthError('')
		setIsNotRegistered(false)

		let success = false

		try {
			const PresignResponse = await prepareSign?.()
			const resp = await fetch(
				`${baseUrl}/api/passkey/generate-authentication-options`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
						origin: window.location.origin,
						challenge: PresignResponse?.base64urlAuthHash,
					}),
				},
			)

			if (!resp.ok) {
				const opts = await resp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, opts.error)
			}

			const authenticationOptions = await resp.json() // TODO: type this

			const authenticationResponse = await startAuthentication({
				optionsJSON: authenticationOptions,
			})

			const verificationResp = await fetch(
				`${baseUrl}/api/passkey/verify-authentication`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
						authenticationResponse,
						origin: window.location.origin,
						userId,
					}),
				},
			)

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()

			if (!verificationJSON?.verified) {
				throw new InAppError(
					ErrorCode.AUTHENTICATOR_NOT_REGISTERED,
					'Authentication verification failed',
				)
			}

			// Create session after successful passkey verification
			const sessionResult = await createSessionAction({
				userId: userId || verificationJSON.userId,
				email: identifier, // identifier should be the email
			})

			if (!sessionResult.success) {
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, sessionResult.message)
			}

			const message = 'User authenticated and session created!'

			if (onSign && PresignResponse) {
				await onSign({
					signRes: authenticationResponse,
					authTxn: PresignResponse.authTxn,
					lastLedger: PresignResponse.lastLedger,
				})
			}

			console.log('verificationJSON:', verificationJSON)

			// Convert pubKey object to Uint8Array, then to base64 string
			const pubKeyArray =
				verificationJSON.device.pubKey instanceof Uint8Array
					? verificationJSON.device.pubKey
					: new Uint8Array(
							Object.values(
								verificationJSON.device.pubKey as Record<string, number>,
							),
						)
			const pubKeyString = Buffer.from(pubKeyArray).toString('base64')

			console.log('base64PubKey:', pubKeyString)
			const loginResult = await signIn('credentials', {
				redirect: false,
				userId: userId || verificationJSON.userId,
				email: identifier,
				pubKey: pubKeyString,
				credentialId: verificationJSON.device.id,
				address: verificationJSON.device.address,
			}).catch((error) => {
				console.error('Error during signIn:', error)
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, error.message)
			})

			console.log('Login result:', loginResult)

			setAuthSuccess(message)
			setIsNotRegistered(false)
			toast.success(message)
			success = Boolean(loginResult?.ok)
		} catch (_error) {
			console.error('🔴 Error during passkey authentication:', _error)
			const error = _error as Error
			let message = error.toString()
			if (
				error.message.includes(
					'The operation either timed out or was not allowed.',
				)
			) {
				message = 'Operation cancelled or not allowed'
			} else if (error.message.includes('User not found.')) {
				message = 'User not registered. Please register first.'
				setIsNotRegistered(true)
			} else {
				message = `Oh no, something went wrong! Response: ${JSON.stringify(error)}`
			}
			setAuthError(message)
			toast.error(message)
		} finally {
			setIsAuthenticating(false)
			if (success) {
				// Redirect to the dashboard or any other page after successful authentication
				redirect('/dashboard', RedirectType.replace)
			}
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

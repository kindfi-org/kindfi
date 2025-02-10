import { startAuthentication } from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import type { PresignResponse, SignParams } from '~/lib/types'

export const usePasskeyAuthentication = (
	identifier: string,
	{
		onSign,
		prepareSign,
	}: {
		onSign?: (params: SignParams) => void
		prepareSign?: () => Promise<PresignResponse>
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
		// Initiates the authentication process with WebAuthn and prepares for Stellar signing
		setIsAuthenticating(true)
		setAuthSuccess('')
		setAuthError('')
		setIsNotRegistered(false)
		try {
			const PresignResponse = await prepareSign?.()
			const resp = await fetch('api/passkey/generate-authentication-options', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin,
					challenge: PresignResponse?.base64urlAuthHash,
				}),
			})

			if (!resp.ok) {
				const opts = await resp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, opts.error)
			}

			const authenticationOptions = await resp.json() // TODO: type this

			const authenticationResponse = await startAuthentication({
				optionsJSON: authenticationOptions,
			})

			const verificationResp = await fetch(
				'api/passkey/verify-authentication',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
						authenticationResponse,
						origin: window.location.origin,
					}),
				},
			)

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()

			if (verificationJSON?.verified) {
				const message = 'User authenticated!'
				setAuthSuccess(message)
				setIsNotRegistered(false)
				toast.success(message)
				if (onSign && PresignResponse) {
					onSign({
						signRes: authenticationResponse,
						authTxn: PresignResponse.authTxn,
						lastLedger: PresignResponse.lastLedger,
					})
				}
			} else {
				const message = `Oh no, something went wrong! Response: ${JSON.stringify(verificationJSON)}`
				setAuthError(message)
				toast.error(message)
			}
		} catch (_error) {
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
			}
			setAuthError(message)
			toast.error(message)
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

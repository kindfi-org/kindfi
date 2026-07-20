'use client'

import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { startRegistration } from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

/**
 * Production passkey registration hook (WebAuthn).
 * Smart Account C-address deployment is optional and controlled by feature flag.
 */
export const usePasskeyRegistration = (identifier: string, userId?: string) => {
	const smartAccountEnabled = isSmartAccountEnabled()
	const [isCreatingPasskey, setIsCreatingPasskey] = useState<boolean>(false)
	const [regSuccess, setRegSuccess] = useState<string>('')
	const [regError, setRegError] = useState<string>('')
	const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false)
	const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null)
	const [credentialId, setCredentialId] = useState<string | null>(null)
	const [publicKey, setPublicKey] = useState<string | null>(null)

	const reset = () => {
		setIsCreatingPasskey(false)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
		setSmartAccountAddress(null)
		setCredentialId(null)
		setPublicKey(null)
	}

	const handleRegister = async () => {
		if (!identifier || identifier.trim() === '') return

		setIsCreatingPasskey(true)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
		toast.info(
			smartAccountEnabled ? 'Creating passkey and Smart Account...' : 'Creating passkey...',
		)

		try {
			const registrationOptionsResp = await fetch('/api/passkey/generate-registration-options', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin,
					userId,
				}),
			})

			if (!registrationOptionsResp.ok) {
				const opts = await registrationOptionsResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, opts.error)
			}

			const registrationOptions = await registrationOptionsResp.json()

			if (
				!registrationOptions.pubKeyCredParams ||
				registrationOptions.pubKeyCredParams.length === 0
			) {
				registrationOptions.pubKeyCredParams = [
					{ alg: -7, type: 'public-key' },
					{ alg: -257, type: 'public-key' },
					{ alg: -8, type: 'public-key' },
				]
			}

			const registrationResponse = await startRegistration({
				optionsJSON: registrationOptions,
			})

			const verificationResp = await fetch('/api/passkey/verify-registration', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					registrationResponse,
					identifier,
					origin: window.location.origin,
					userId,
				}),
			})

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()

			if (verificationJSON?.verified) {
				if (verificationJSON.credentialId) {
					setCredentialId(verificationJSON.credentialId)
				}
				if (verificationJSON.publicKey) {
					setPublicKey(verificationJSON.publicKey)
				}

				if (verificationJSON.smartAccountAddress) {
					const message = 'Passkey registered and Smart Account created!'
					setRegSuccess(message)
					setSmartAccountAddress(verificationJSON.smartAccountAddress)
					toast.success(message)
				} else if (smartAccountEnabled) {
					const warning = verificationJSON.warning || 'Smart Account creation failed'
					logger.warn('Smart Account creation failed:', warning)
					setRegSuccess('Passkey registered successfully')
					setSmartAccountAddress(null)
					toast.warning(warning)
				} else {
					const message = 'Passkey registered successfully!'
					setRegSuccess(message)
					setSmartAccountAddress(null)
					toast.success(message)
				}
			} else {
				const message = `Registration failed: ${JSON.stringify(verificationJSON)}`
				setRegError(message)
				toast.error(message)
			}
		} catch (error) {
			const err = error as Error
			if (err.name === 'InvalidStateError') {
				const message = 'Error: Authenticator was probably already registered by user'
				setRegError(message)
				setIsAlreadyRegistered(true)
				toast.error(message)
			} else {
				let message = err.toString()
				if (err.message.includes('The operation either timed out or was not allowed.')) {
					message = 'Operation cancelled or not allowed'
				}
				setRegError(message)
				toast.error(message)
			}
		} finally {
			setIsCreatingPasskey(false)
		}
	}

	return {
		isCreatingPasskey,
		regSuccess,
		regError,
		isRegistered: Boolean(regSuccess),
		isAlreadyRegistered,
		smartAccountAddress,
		credentialId,
		publicKey,
		handleRegister,
		reset,
	}
}

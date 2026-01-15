'use client'

import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	type RegistrationResponseJSON,
	startRegistration,
} from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

/**
 * Hook for Smart Account registration using WebAuthn passkeys
 * Replaces the KYC server-based registration flow
 */
export const useSmartAccountRegistration = (
	identifier: string,
	userId?: string,
) => {
	const appConfig: AppEnvInterface = appEnvConfig('web')
	const [isCreatingPasskey, setIsCreatingPasskey] = useState<boolean>(false)
	const [regSuccess, setRegSuccess] = useState<string>('')
	const [regError, setRegError] = useState<string>('')
	const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false)
	const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
		null,
	)

	const reset = () => {
		setIsCreatingPasskey(false)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
		setSmartAccountAddress(null)
	}

	const handleRegister = async () => {
		if (!identifier || identifier.trim() === '') return

		setIsCreatingPasskey(true)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
		toast.info('Creating passkey and Smart Account...')

		try {
			// Step 1: Generate registration options
			// This should be done server-side
			const registrationOptionsResp = await fetch(
				'/api/passkey/generate-registration-options',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
						origin: window.location.origin,
						userId,
					}),
				},
			)

			if (!registrationOptionsResp.ok) {
				const opts = await registrationOptionsResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, opts.error)
			}

			const registrationOptions = await registrationOptionsResp.json()

			// Ensure required algorithms are present
			if (
				!registrationOptions.pubKeyCredParams ||
				registrationOptions.pubKeyCredParams.length === 0
			) {
				registrationOptions.pubKeyCredParams = [
					{ alg: -7, type: 'public-key' }, // ES256 (secp256r1)
					{ alg: -257, type: 'public-key' }, // RS256
					{ alg: -8, type: 'public-key' }, // EdDSA
				]
			}

			// Step 2: Perform WebAuthn registration
			const registrationResponse = await startRegistration({
				optionsJSON: registrationOptions,
			})

			// Step 3: Verify registration and create Smart Account
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
				if (verificationJSON.smartAccountAddress) {
					const message = 'Passkey registered and Smart Account created!'
					setRegSuccess(message)
					setSmartAccountAddress(verificationJSON.smartAccountAddress)
					toast.success(message)
				} else {
					// Passkey registered but Smart Account creation failed
					const warning =
						verificationJSON.warning || 'Smart Account creation failed'
					console.warn('⚠️ Smart Account creation failed:', warning)
					setRegSuccess('Passkey registered successfully')
					setSmartAccountAddress(null)
					toast.warning(warning)
					// Still show success for passkey registration, but log the warning
				}
			} else {
				const message = `Registration failed: ${JSON.stringify(verificationJSON)}`
				setRegError(message)
				toast.error(message)
			}
		} catch (error) {
			const err = error as Error
			if (err.name === 'InvalidStateError') {
				const message =
					'Error: Authenticator was probably already registered by user'
				setRegError(message)
				setIsAlreadyRegistered(true)
				toast.error(message)
			} else {
				let message = err.toString()
				if (
					err.message.includes(
						'The operation either timed out or was not allowed.',
					)
				) {
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
		handleRegister,
		reset,
	}
}

import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	type RegistrationResponseJSON,
	startRegistration,
} from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

export const usePasskeyRegistration = (
	identifier: string,
	{
		onRegister,
		userId,
	}: {
		onRegister: (res: RegistrationResponseJSON, userId: string) => void
		userId?: string
	},
) => {
	const appConfig: AppEnvInterface = appEnvConfig('web')
	const baseUrl = appConfig.externalApis.kyc.baseUrl
	const [isCreatingPasskey, setIsCreatingPasskey] = useState<boolean>(false)
	const [regSuccess, setRegSuccess] = useState<string>('')
	const [regError, setRegError] = useState<string>('')
	const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false)
	const [deviceData, setDeviceData] = useState<{
		credentialId: string
		publicKey: string
		address?: string
		contractSalt?: string
	} | null>(null)

	const reset = () => {
		setIsCreatingPasskey(false)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
	}

	const handleRegister = async () => {
		if (!identifier || identifier.trim() === '') return
		// Initiates the registration process with WebAuthn and Stellar
		setIsCreatingPasskey(true)
		setRegSuccess('')
		setRegError('')
		setIsAlreadyRegistered(false)
		toast.info('Creando autenticación biométrica...')

		try {
			const registrationOptionsResp = await fetch(
				`${baseUrl}/api/passkey/generate-registration-options`,
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

			// Ensure required algorithms are present to prevent registration failures
			if (
				!registrationOptions.pubKeyCredParams ||
				registrationOptions.pubKeyCredParams.length === 0
			) {
				registrationOptions.pubKeyCredParams = [
					{ alg: -7, type: 'public-key' }, // ES256
					{ alg: -257, type: 'public-key' }, // RS256
					{ alg: -8, type: 'public-key' }, // EdDSA
				]
			} else {
				// Check if ES256, RS256, and EdDSA are present, add them if missing
				const hasES256 = registrationOptions.pubKeyCredParams.some(
					(param: Record<string, unknown>) => param.alg === -7,
				)
				const hasRS256 = registrationOptions.pubKeyCredParams.some(
					(param: Record<string, unknown>) => param.alg === -257,
				)
				const hasEdDSA = registrationOptions.pubKeyCredParams.some(
					(param: Record<string, unknown>) => param.alg === -8,
				)

				if (!hasES256) {
					registrationOptions.pubKeyCredParams.push({
						alg: -7,
						type: 'public-key',
					})
				}
				if (!hasRS256) {
					registrationOptions.pubKeyCredParams.push({
						alg: -257,
						type: 'public-key',
					})
				}
				if (!hasEdDSA) {
					registrationOptions.pubKeyCredParams.push({
						alg: -8,
						type: 'public-key',
					})
				}
			}

			const registrationResponse = await startRegistration({
				optionsJSON: registrationOptions,
			})

			const verificationResp = await fetch(
				`${baseUrl}/api/passkey/verify-registration`,
				{
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
				},
			)

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()
			if (verificationJSON?.verified) {
				// Extract stellar data using existing getPublicKeys function
				if (registrationResponse?.rawId) {
					try {
						// Call the onRegister callback for any additional processing (without blockchain deployment)
						await onRegister(registrationResponse, userId as string)
					} catch (stellarError) {
						console.warn('Failed to extract stellar data:', stellarError)
					}
				}
				const message = 'Authenticator registered!'
				setRegSuccess(message)
				toast.success(message)
			} else {
				const message = `Oh no, something went wrong! Response: ${JSON.stringify(verificationJSON)}`
				setRegError(message)
				toast.error(message)
			}
		} catch (_error) {
			const error = _error as Error
			if (error.name === 'InvalidStateError') {
				const message =
					'Error: Authenticator was probably already registered by user'
				setRegError(message)
				setIsAlreadyRegistered(true)
				toast.error(message)
			} else {
				let message = error.toString()
				if (
					error.message.includes(
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
		deviceData,
		handleRegister,
		reset,
	}
}

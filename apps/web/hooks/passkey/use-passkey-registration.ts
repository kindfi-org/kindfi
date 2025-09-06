import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	type RegistrationResponseJSON,
	startRegistration,
} from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { generateStellarAddress } from '~/lib/passkey/deploy'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import { getPublicKeys } from '~/lib/passkey/stellar'

export const usePasskeyRegistration = (
	identifier: string,
	{
		onRegister,
		userId,
	}: { onRegister?: (res: RegistrationResponseJSON) => void; userId?: string },
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
						const stellarData = await getPublicKeys(registrationResponse)

						// Generate stellar address without deploying to blockchain
						const stellarAddress = generateStellarAddress(
							stellarData.contractSalt,
						)
						const deviceData = {
							credentialId: registrationResponse.id,
							publicKey: stellarData.publicKey?.toString('base64') || '',
							address: stellarAddress,
							contractSalt: stellarData.contractSalt?.toString('hex') || '',
						}

						console.log('PRE Stellar Address', stellarAddress)

						// Set device data with extracted stellar information
						setDeviceData(deviceData)

						// Call the onRegister callback for any additional processing (without blockchain deployment)
						await onRegister?.(registrationResponse, deviceData)
					} catch (stellarError) {
						console.warn('Failed to extract stellar data:', stellarError)
						// Fallback to basic credential data
						setDeviceData({
							credentialId: registrationResponse.id,
							publicKey: registrationResponse.response?.attestationObject || '',
							address: verificationJSON?.address as string | undefined,
						})
						// Still call onRegister for any additional processing
						await onRegister?.(registrationResponse)
					}
				}
				const message = 'Authenticator registered!'
				setRegSuccess(message)
				toast.success(message)
				onRegister?.(registrationResponse)
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

import { appEnvConfig } from '@packages/lib/config/app-env.config'
import {
	type RegistrationResponseJSON,
	startRegistration,
} from '@simplewebauthn/browser'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

export const usePasskeyRegistration = (
	identifier: string,
	{ onRegister }: { onRegister?: (res: RegistrationResponseJSON) => void },
) => {
	const appConfig = appEnvConfig('web')
	const baseUrl = appConfig.externalApis.kyc.baseUrl
	const [isCreatingPasskey, setIsCreatingPasskey] = useState<boolean>(false)
	const [regSuccess, setRegSuccess] = useState<string>('')
	const [regError, setRegError] = useState<string>('')
	const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false)

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
					}),
				},
			)

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await verificationResp.json()

			if (verificationJSON?.verified) {
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
		handleRegister,
		isRegistered: Boolean(regSuccess),
		isAlreadyRegistered,
		reset,
	}
}

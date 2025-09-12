import { appEnvConfig } from '@packages/lib/config'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { AppEnvInterface } from '@packages/lib/types'
import type { RegistrationResponseJSON } from '@simplewebauthn/browser'
import { Horizon, Keypair } from '@stellar/stellar-sdk'
import type { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Logger } from '~/lib/logger'
import { handleDeploy } from '~/lib/passkey/deploy'
import { getPublicKeys } from '~/lib/passkey/stellar'
import type { PresignResponse, SignParams } from '~/lib/types'

const logger = new Logger()

const getStoredDeployee = () => {
	return localStorage.getItem('sp:deployee')
}

const setStoredDeployee = (deployee: string) => {
	localStorage.setItem('sp:deployee', deployee)
}

const removeStoredDeployee = () => {
	localStorage.removeItem('sp:deployee')
}

const getStoredBundler = () => {
	return localStorage.getItem('sp:bundler')
}

const setStoredBundler = (bundler: string) => {
	localStorage.setItem('sp:bundler', bundler)
}

const removeStoredBundler = () => {
	localStorage.removeItem('sp:bundler')
}

const setStoredCredentialId = (credentials: string) => {
	localStorage.setItem('sp:id', credentials)
}

const removeStoredCredentialId = () => {
	localStorage.removeItem('sp:id')
}

export const useStellar = () => {
	// Manages Stellar operations such as deploying contracts and signing transactions
	const [loadingDeployee, setLoadingDeployee] = useState(true)
	const [deployee, setDeployee] = useState<string | null>(null)
	const bundlerKey = useRef<Keypair | null>(null)
	const [loadingRegister, setLoadingRegister] = useState(false)
	const [loadingSign, setLoadingSign] = useState(false)
	const [contractData, setContractData] = useState<unknown | null>(null) // TODO:Just for testing, add type
	const [creatingDeployee, setCreatingDeployee] = useState(false)
	const { data: session } = useSession()
	console.log('session', session)
	const onRegister = async (registerRes: RegistrationResponseJSON) => {
		// Handles registration with Stellar by deploying a contract
		if (deployee) return
		try {
			setLoadingRegister(true)
			setStoredCredentialId(registerRes.id)
			const { contractSalt, publicKey, aaguid } =
				await getPublicKeys(registerRes)
			if (!bundlerKey.current) throw new Error('Bundler key not found')
			if (!contractSalt || !publicKey) throw new Error('Invalid public keys')
			setCreatingDeployee(true)
			const deployee = await handleDeploy(
				bundlerKey.current,
				contractSalt,
				publicKey,
			)
			setStoredDeployee(deployee)
			setDeployee(deployee)

			// Update device with deployee address and AAGUID
			if (deployee && aaguid) {
				await updateDeviceWithDeployee({
					deployeeAddress: deployee,
					aaguid,
					credentialId: registerRes.id,
				})
			}
		} catch (error) {
			logger.error({
				eventType: 'Stellar Registration Error',
				error: error instanceof Error ? error.message : 'Unknown error',
				details: error,
			})
		} finally {
			setLoadingRegister(false)
			setCreatingDeployee(false)
		}
	}

	const updateDeviceWithDeployee = async ({
		deployeeAddress,
		aaguid,
		credentialId,
	}: {
		deployeeAddress: string
		aaguid: string
		credentialId: string
	}) => {
		// Get current user from session or context
		const userId = (session?.user as User).id
		try {
			if (!userId) {
				throw new Error('User not authenticated')
			}

			const supabase = createSupabaseBrowserClient()
			// Validate input parameters
			if (!userId || !credentialId || !deployeeAddress || !aaguid) {
				return {
					success: false,
					message: 'Missing required parameters',
					error: 'Invalid input parameters',
				}
			}

			// Verify the device exists and belongs to the user
			const { data: existingDevice, error: deviceError } = await supabase
				.from('devices')
				.select('id, user_id, credential_id')
				.eq('user_id', userId)
				.eq('credential_id', credentialId)
				.single()

			if (deviceError || !existingDevice) {
				return {
					success: false,
					message: 'Device not found or does not belong to user',
					error: 'Device verification failed',
				}
			}

			// Update the device with deployee address and AAGUID
			const { data: updatedDevice, error: updateError } = await supabase
				.from('devices')
				.update({
					address: deployeeAddress,
					aaguid: aaguid,
					updated_at: new Date().toISOString(),
				})
				.eq('id', existingDevice.id)
				.select()
				.single()

			if (updateError) {
				logger.error({
					eventType: 'DEVICE_UPDATE_ERROR',
					error: updateError.message,
					userId,
					credentialId,
				})
				return {
					success: false,
					message: 'Failed to update device information',
					error: updateError.message,
				}
			}

			logger.info({
				eventType: 'DEVICE_UPDATED',
				userId,
				credentialId,
				deployeeAddress,
				aaguid,
			})

			return {
				success: true,
				message: 'Device updated successfully',
				data: updatedDevice,
			}
		} catch (error) {
			logger.error({
				eventType: 'DEVICE_UPDATE_EXCEPTION',
				error: error instanceof Error ? error.message : 'Unknown error',
				userId,
				credentialId,
			})

			return {
				success: false,
				message: 'An error occurred while updating the device',
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	console.log('deployee', deployee)

	const prepareSign = async (): Promise<PresignResponse> => {
		// Prepares data for signing a transaction on the Stellar network
		// TODO: disable for now, enable the signing logic when the transaction is ready
		// if (!bundlerKey.current) throw new Error('Bundler key not found')
		// if (!deployee) throw new Error('Deployee not found')
		// TODO: Implement the logic to prepare the data for signing a transaction on the Stellar network
		return {} as PresignResponse
	}

	// biome-ignore lint/correctness/noUnusedFunctionParameters: any
	const onSign = async ({ signRes, authTxn, lastLedger }: SignParams) => {
		// Handles the signing of a transaction and sends it to the Stellar network
		try {
			setLoadingSign(true)
			console.log('{ signRes, authTxn, lastLedger }::onSign from use-stellar', {
				signRes,
				authTxn,
				lastLedger,
			})
			// TODO: disable for now, enable the signing logic when the transaction is ready
			// if (!bundlerKey.current) throw new Error('Bundler key not found')
			// if (!deployee) throw new Error('Deployee not found')
			// TODO: Implement the logic to send the transaction to the Stellar network
			// TODO: enable the logic to send the transaction to the Stellar network
			setContractData({})
		} catch (error) {
			logger.error({
				eventType: 'Stellar Signing Error',
				error: error instanceof Error ? error.message : 'Unknown error',
				details: error,
			})
		} finally {
			setLoadingSign(false)
		}
	}

	const reset = () => {
		// TODO: Implement the logic to remove the passkey from the db
		removeStoredDeployee()
		removeStoredBundler()
		removeStoredCredentialId()
	}

	useEffect(() => {
		const init = async () => {
			const appConfig: AppEnvInterface = appEnvConfig('web')
			try {
				const storedBundler = getStoredBundler()
				if (storedBundler) {
					bundlerKey.current = Keypair.fromSecret(storedBundler)
				} else {
					bundlerKey.current = Keypair.random()
					setStoredBundler(bundlerKey.current.secret())
					const horizon = new Horizon.Server(appConfig.stellar.networkUrl)
					await horizon.friendbot(bundlerKey.current.publicKey()).call()
				}
				const storedDeployee = getStoredDeployee()
				if (storedDeployee) {
					setDeployee(storedDeployee)
				}
			} catch (error) {
				logger.error({
					eventType: 'Stellar Initialization Error',
					error: error instanceof Error ? error.message : 'Unknown error',
					details: error,
				})
			} finally {
				setLoadingDeployee(false)
			}
		}

		init()
	}, [])

	return {
		onRegister,
		onSign,
		prepareSign,
		deployee,
		loadingRegister,
		loadingSign,
		creatingDeployee,
		loadingDeployee,
		contractData,
		reset,
	}
}

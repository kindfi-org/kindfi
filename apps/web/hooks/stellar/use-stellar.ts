import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { RegistrationResponseJSON } from '@simplewebauthn/browser'
import { Horizon, Keypair } from '@stellar/stellar-sdk'
import { useEffect, useRef, useState } from 'react'
import { updateDeviceWithDeployee } from '~/app/actions/auth'
import { handleDeploy } from '~/app/actions/passkey-deploy'
import { Logger } from '~/lib/logger'
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

	const onRegister = async (
		registerRes: RegistrationResponseJSON,
		userId: string,
	) => {
		// Handles registration with Stellar by deploying a contract
		if (deployee) return deployee
		try {
			setLoadingRegister(true)
			setStoredCredentialId(registerRes.id)
			const { contractSalt, publicKey, aaguid } =
				await getPublicKeys(registerRes)
			if (!bundlerKey.current) throw new Error('Bundler key not found')
			if (!contractSalt || !publicKey) throw new Error('Invalid public keys')

			setCreatingDeployee(true)

			// Send raw data, not base64 - the server action will handle Buffer conversion
			const deployData = {
				bundlerKey: {
					publicKey: bundlerKey.current.publicKey(),
					secretKey: bundlerKey.current.secret(),
				},
				contractSalt: Array.from(contractSalt), // Convert Buffer to array for JSON transport
				publicKey: Array.from(publicKey), // Convert Buffer to array for JSON transport
			}

			const deployee = await handleDeploy(JSON.stringify(deployData))
			setStoredDeployee(deployee)
			setDeployee(deployee)
			console.log('Deployee address:', deployee)
			// Update device with deployee address and AAGUID
			const { success, message, error } = await updateDeviceWithDeployee(
				JSON.stringify({
					deployeeAddress: deployee,
					aaguid,
					credentialId: registerRes.id,
					userId,
				}),
			)

			if (error && !success) {
				throw new Error(`${error}:::${message}`)
			}

			return deployee
		} catch (error) {
			console.error('❌ useStellar::onRegister::>', error)
		} finally {
			setLoadingRegister(false)
			setCreatingDeployee(false)
		}
		return ''
	}

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
			console.error(error)
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
				console.error(error)
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

import { appEnvConfig } from '@packages/lib/config'
import { useStellarSignature } from '@packages/lib/hooks'
import type { AppEnvInterface } from '@packages/lib/types'
import type { RegistrationResponseJSON } from '@simplewebauthn/browser'
import { Horizon, Keypair } from '@stellar/stellar-sdk'
import { useEffect, useRef, useState } from 'react'
import { updateDeviceWithDeployee } from '~/app/actions/auth'
import { Logger } from '~/lib/logger'
import { getPublicKeys } from '~/lib/passkey/stellar'
import type { PresignResponse, SignParams } from '~/lib/types'

const _logger = new Logger()

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
	const stellarSignature = useStellarSignature({
		onSuccess: (result) => {
			console.log('✅ Transaction successful:', result)
			// Refresh account info after successful transaction
			if (deployee) {
				stellarSignature.getAccountInfo(deployee)
			}
		},
		onError: (error) => {
			console.error('❌ Transaction failed:', error)
		},
	})

	const onRegister = async (
		registerRes: RegistrationResponseJSON,
		userId: string,
	) => {
		// Handles registration by preparing Stellar data WITHOUT deploying the contract
		// Contract deployment should only happen after KYC approval
		if (deployee) return deployee
		try {
			setLoadingRegister(true)
			setStoredCredentialId(registerRes.id)
			const { contractSalt, publicKey, aaguid } =
				await getPublicKeys(registerRes)
			if (!bundlerKey.current) throw new Error('Bundler key not found')
			if (!contractSalt || !publicKey) throw new Error('Invalid public keys')

			console.log(
				'📋 Registration: Preparing Stellar account data (NOT deploying yet)',
			)

			// Update device with PREPARED address and AAGUID
			// This address will be deployed later during approval
			const { success, message, error } = await updateDeviceWithDeployee(
				JSON.stringify({
					aaguid,
					credentialId: registerRes.id,
					userId,
				}),
			)

			if (error && !success) {
				throw new Error(`${error}:::${message}`)
			}

			console.log(
				'✅ Registration complete: Device data saved, account prepared for future deployment',
			)
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

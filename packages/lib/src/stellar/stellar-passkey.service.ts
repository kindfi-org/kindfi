import { Buffer } from 'node:buffer'
import { Address, Contract, hash, Keypair, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import { appEnvConfig } from '../config'
import { logger } from '../logger'
import {
	computeDeviceIdFromCoseKey,
	convertCoseToUncompressedPublicKey,
} from '../passkey/webauthn-keys'
import type { AppEnvInterface } from '../types'
import { getPublicKeyForContract, verifySECP256R1Signature } from './passkey-signature.utils'
import {
	executeAddDevice,
	executeContractInvocation,
	executeRemoveDevice,
	type PasskeyOperation,
	type PasskeyTxContext,
} from './passkey-transaction.utils'
import { type RateLimitConfig, SignatureRateLimiter } from './rate-limiter'

/**
 * KindFi Smart Wallet Service
 * Deploys auth-contracts smart wallets with passkey authentication
 */
export class StellarPasskeyService {
	private server: Server
	private networkPassphrase: string
	private factoryContractId: string
	private controllerContractId: string
	private fundingKeypair?: Keypair
	private rateLimiter: SignatureRateLimiter

	private readonly STANDARD_FEE = '100000' // Higher fee for contract deployment

	constructor(networkPassphrase?: string, rpcUrl?: string, fundingSecretKey?: string) {
		const config: AppEnvInterface = appEnvConfig('kyc-server')

		this.networkPassphrase = networkPassphrase || config.stellar.networkPassphrase
		this.server = new Server(rpcUrl || config.stellar.rpcUrl)
		this.factoryContractId = config.stellar.factoryContractId
		this.controllerContractId = config.stellar.controllerContractId

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
		}

		// Initialize rate limiter with configuration
		const rateLimitConfig: RateLimitConfig = {
			maxAttempts: config.stellar.signatureVerification?.maxAttempts ?? 5,
			windowMs: config.stellar.signatureVerification?.windowMs ?? 60000, // 1 minute default
			redisUrl: config.redis?.url,
			redisToken: config.redis?.token,
		}

		this.rateLimiter = new SignatureRateLimiter(rateLimitConfig)
	}

	/**
	 * Deploys smart wallet contract via account-factory
	 * Returns the ACTUAL contract address from the on-chain response
	 *
	 * @param params.publicKey - Can be either COSE format (will be converted) or already uncompressed base64
	 */
	async deployPasskeyAccount(
		params: PasskeyAccountCreationParams & { salt?: string; deviceId?: string },
	): Promise<PasskeyAccountResult> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for smart wallet deployment')
		}

		try {
			// Use provided salt or generate from credential
			const salt = params.salt
				? Buffer.from(params.salt, 'hex')
				: hash(Buffer.from(params.credentialId, 'base64'))

			// Process public key to uncompressed secp256r1 format using shared utility
			// The publicKey parameter should be COSE format from WebAuthn
			const publicKeyBuffer = convertCoseToUncompressedPublicKey(
				Buffer.from(params.publicKey, 'base64'),
			)

			// ! CRITICAL: Compute device_id using the SAME method as submit route
			// device_id = SHA256(uncompressed_public_key)
			// NOT SHA256(credential_id)
			let deviceId: Buffer
			if (params.deviceId) {
				deviceId = Buffer.from(params.deviceId, 'hex')
			} else {
				// Compute device_id from public key (same as submit route)
				const deviceIdHex = computeDeviceIdFromCoseKey(params.publicKey)
				deviceId = Buffer.from(deviceIdHex, 'hex')
			}

			// Deploy via account-factory
			const contractAddress = await this.deployViaFactory(salt, deviceId, publicKeyBuffer)

			return {
				address: contractAddress,
				isExisting: false,
			}
		} catch (error) {
			logger.error(
				'Error deploying smart wallet',
				error instanceof Error ? error : new Error(String(error)),
			)
			throw new Error(`Failed to deploy smart wallet: ${error}`)
		}
	}

	/**
	 * Gets contract information for a smart wallet
	 */
	async getAccountInfo(contractAddress: string): Promise<PasskeyAccountInfo> {
		try {
			// Check if contract exists
			const contract = new Contract(contractAddress)

			// Try to call a read-only method to verify existence
			// Using 'get_devices' or similar contract method
			const ledgerKey = contract.getFootprint()

			try {
				const _ledgerEntries = await this.server.getLedgerEntries(ledgerKey)
				return {
					address: contractAddress,
					balance: '0', // Contracts don't have balances directly
					sequence: '0',
					status: 'active',
				}
			} catch {
				return {
					address: contractAddress,
					balance: '0',
					sequence: '0',
					status: 'not_found',
				}
			}
		} catch (_error) {
			return {
				address: contractAddress,
				balance: '0',
				sequence: '0',
				status: 'not_found',
			}
		}
	}

	/**
	 * Deploys smart wallet via account-factory contract
	 * Returns the ACTUAL contract address from the on-chain event/response
	 */
	private async deployViaFactory(
		salt: Buffer,
		deviceId: Buffer,
		publicKey: Buffer,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for factory deployment')
		}

		try {
			// Verify factory contract exists (non-blocking - will fail during deployment if missing)
			try {
				await this.verifyContractExists(this.factoryContractId, 'Account Factory')
			} catch {
				logger.warn('Factory contract verification failed – continuing with deployment attempt')
			}

			// Verify controller contract exists (non-blocking)
			try {
				await this.verifyContractExists(this.controllerContractId, 'Auth Controller')
			} catch {
				logger.warn('Controller contract verification failed – continuing with deployment attempt')
			}

			const fundingAccount = await this.server.getAccount(this.fundingKeypair.publicKey())

			// Build factory.deploy() call
			const factory = new Contract(this.factoryContractId)
			const deployOp = factory.call(
				'deploy',
				xdr.ScVal.scvBytes(salt),
				xdr.ScVal.scvBytes(deviceId),
				xdr.ScVal.scvBytes(publicKey),
			)

			const transaction = new TransactionBuilder(fundingAccount, {
				fee: this.STANDARD_FEE,
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(deployOp)
				.setTimeout(60)
				.build()

			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				throw new Error(`Simulation failed: ${simulation.error || 'unknown error'}`)
			}

			const assembledTx = assembleTransaction(transaction, simulation).build()
			assembledTx.sign(this.fundingKeypair)

			const result = await this.server.sendTransaction(assembledTx)

			if (result.status === 'ERROR') {
				throw new Error(`Deployment failed: ${JSON.stringify(result)}`)
			}

			let attempts = 0
			const maxAttempts = 60

			while (attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
				attempts++

				try {
					const txResult = await this.server.getTransaction(result.hash)

					if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
						// Extract contract address from result
						// The factory.deploy() returns Address type
						const returnValue = txResult.returnValue

						if (!returnValue) {
							throw new Error('No return value from deployment')
						}

						// Parse the Address from ScVal
						const contractAddress = Address.fromScVal(returnValue).toString()

						return contractAddress
					}

					if (txResult.status === Api.GetTransactionStatus.FAILED) {
						throw new Error(
							'Deployment failed. Check if auth-controller contract is properly deployed and initialized.',
						)
					}
				} catch (error) {
					if (attempts === maxAttempts) {
						throw error
					}
				}
			}

			throw new Error('Deployment timeout')
		} catch (error) {
			// Provide actionable error message
			if (
				error instanceof Error &&
				(error.message.includes('scecMissingValue') ||
					error.message.includes('HostContextError') ||
					error.message.includes('HostStorageError'))
			) {
				throw new Error(
					'Factory deployment failed: Auth controller contract not properly configured. ' +
						'Please verify that:\n' +
						'1. The controller contract is deployed and initialized on this network\n' +
						'2. The factory contract is registered in the auth controller\n' +
						'3. The admin signer public key is correctly added to the auth controller',
				)
			}

			throw new Error(`Factory deployment failed: ${error}`)
		}
	}

	/**
	 * Verifies that a contract exists on-chain
	 */
	private async verifyContractExists(contractId: string, contractName: string): Promise<void> {
		try {
			const contract = new Contract(contractId)
			const ledgerKey = contract.getFootprint()
			const ledgerEntries = await this.server.getLedgerEntries(ledgerKey)

			if (!ledgerEntries.entries || ledgerEntries.entries.length === 0) {
				throw new Error(
					`${contractName} (${contractId}) not found on network. Please deploy the contract first.`,
				)
			}
		} catch (error) {
			logger.error(
				`Failed to verify ${contractName}`,
				error instanceof Error ? error : new Error(String(error)),
				{ contractId },
			)
			throw new Error(
				`${contractName} (${contractId}) verification failed: ${error}. ` +
					'Please ensure the contract is deployed on this network.',
			)
		}
	}

	/**
	 * Verifies a passkey signature for transaction authentication
	 * This is essential for the `/api/stellar/verify-signature` endpoint
	 */
	async verifyPasskeySignature(
		address: string,
		signature: string,
		transactionHash: string,
	): Promise<boolean> {
		try {
			// Rate limit check BEFORE any verification work

			const rateLimitResult = await this.rateLimiter.checkLimit(address)

			if (!rateLimitResult.allowed) {
				// Log potential brute-force attempt

				return false
			}

			// Parse the signature data (should be WebAuthn assertion response)
			const signatureData = JSON.parse(signature)

			// Extract signature components
			const { authenticatorData, clientDataJSON, signature: rawSignature } = signatureData

			if (!authenticatorData || !clientDataJSON || !rawSignature) {
				throw new Error('Missing required signature components')
			}

			// Verify client data challenge matches transaction hash
			const clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64').toString('utf-8'))

			if (clientData.challenge !== transactionHash) {
				return false
			}

			// Verify origin (optional but recommended)

			// Get the public key for this address
			const publicKey = await getPublicKeyForContract(address)
			if (!publicKey) {
				throw new Error('Public key not found for address')
			}

			// Verify the signature using secp256r1
			const isValid = await verifySECP256R1Signature(
				authenticatorData,
				clientDataJSON,
				rawSignature,
				publicKey,
			)

			// Reset rate limit counter on successful verification
			if (isValid) {
				await this.rateLimiter.reset(address)
			}

			return isValid
		} catch (error) {
			logger.error(
				'Error verifying signature',
				error instanceof Error ? error : new Error(String(error)),
			)
			return false
		}
	}

	/**
	 * Executes a passkey transaction on the smart contract
	 * This handles operations after signature verification
	 */
	async executePasskeyTransaction(
		address: string,
		operation: string,
		signature: string,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for transaction execution')
		}
		const fundingKeypair = this.fundingKeypair

		try {
			// Parse operation details
			const operationData: PasskeyOperation = JSON.parse(operation)

			// Verify signature before execution
			const isValidSignature = await this.verifyPasskeySignature(
				address,
				signature,
				operationData.challenge || `op_${Date.now()}`,
			)

			if (!isValidSignature) {
				throw new Error('Invalid signature for transaction')
			}

			const ctx: PasskeyTxContext = {
				server: this.server,
				fundingKeypair,
				networkPassphrase: this.networkPassphrase,
				fee: this.STANDARD_FEE,
			}

			// Execute the specific operation
			switch (operationData.type) {
				case 'add_device':
					return await executeAddDevice(ctx, address, operationData)
				case 'remove_device':
					return await executeRemoveDevice(ctx, address, operationData)
				case 'invoke_contract':
					return await executeContractInvocation(ctx, address, operationData)
				default:
					throw new Error('Unsupported operation type')
			}
		} catch (error) {
			logger.error(
				'Error executing transaction',
				error instanceof Error ? error : new Error(String(error)),
				{ address },
			)
			throw new Error(`Transaction execution failed: ${error}`)
		}
	}

	/**
	 * Cleanup resources when service is destroyed
	 */
	async disconnect(): Promise<void> {
		await this.rateLimiter.disconnect()
	}
}

/**
 * Query devices registered in smart wallet contract
 */
export async function queryContractDevices(
	server: Server,
	contractAddress: string,
	fundingKeypair: Keypair,
	networkPassphrase: string,
): Promise<Array<{ device_id: string; public_key: string }>> {
	try {
		const contract = new Contract(contractAddress)
		const fundingAccount = await server.getAccount(fundingKeypair.publicKey())

		const getDevicesOp = contract.call('get_devices')

		const tx = new TransactionBuilder(fundingAccount, {
			fee: '100',
			networkPassphrase,
		})
			.addOperation(getDevicesOp)
			.setTimeout(30)
			.build()

		const simulation = await server.simulateTransaction(tx)

		if (Api.isSimulationSuccess(simulation) && simulation.result) {
			// Parse the result - it should be a Vec<DevicePublicKey>
			const devicesScVal = simulation.result.retval

			// The result is a Vec, parse it
			if (devicesScVal.switch().name === 'scvVec' && devicesScVal.vec()) {
				const devices = []
				for (const deviceScVal of devicesScVal.vec() || []) {
					// Each device is a struct with device_id and public_key
					if (deviceScVal.switch().name === 'scvMap' && deviceScVal.map()) {
						const deviceMap: Record<string, Buffer> = {}
						for (const entry of deviceScVal.map() || []) {
							const key = entry.key().sym().toString()
							const valBytes = entry.val().bytes()
							if (valBytes) {
								deviceMap[key] = Buffer.from(valBytes)
							}
						}

						if (deviceMap.device_id && deviceMap.public_key) {
							devices.push({
								device_id: deviceMap.device_id.toString('hex'),
								public_key: deviceMap.public_key.toString('hex'),
							})
						}
					}
				}
				return devices
			}
		}

		logger.warn('Failed to query contract devices')
		return []
	} catch (error) {
		logger.error(
			'Error querying contract devices',
			error instanceof Error ? error : new Error(String(error)),
			{ contractAddress },
		)
		return []
	}
}

export interface PasskeyAccountCreationParams {
	credentialId: string
	publicKey: string // Base64 encoded CBOR public key (for WebAuthn verification)
	userId?: string
}

export interface PasskeyAccountResult {
	address: string // Smart wallet contract address (C... format)
	transactionHash?: string
	isExisting?: boolean
	salt?: string // Deployment salt (hex string)
	deviceId?: string // Device ID (hex string)
}

export interface PasskeyAccountInfo {
	address: string
	balance: string
	sequence: string
	status: 'active' | 'not_found' | 'inactive'
}

export type {
	AddDeviceOperation,
	ContractInvocationOperation,
	PasskeyOperation,
	RemoveDeviceOperation,
} from './passkey-transaction.utils'

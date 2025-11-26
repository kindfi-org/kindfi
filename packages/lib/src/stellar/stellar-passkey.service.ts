import { Buffer } from 'node:buffer'
import { createHash, createPublicKey, createVerify } from 'node:crypto'
import { db, devices } from '@packages/drizzle'
import {
	Account,
	Address,
	Contract,
	hash,
	Keypair,
	Operation,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import { eq } from 'drizzle-orm'
import { appEnvConfig } from '../config'
import {
	computeDeviceIdFromCoseKey,
	convertCoseToUncompressedPublicKey,
} from '../passkey'
import type { AppEnvInterface } from '../types'
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

	constructor(
		networkPassphrase?: string,
		rpcUrl?: string,
		fundingSecretKey?: string,
	) {
		const config: AppEnvInterface = appEnvConfig('kyc-server')

		this.networkPassphrase =
			networkPassphrase || config.stellar.networkPassphrase
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
			console.log('🚀 Deploying smart wallet for passkey:', params.credentialId)

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

			console.log('📝 Deployment parameters:', {
				salt: salt.toString('hex').substring(0, 16) + '...',
				deviceId: deviceId.toString('hex').substring(0, 16) + '...',
				publicKey: publicKeyBuffer.toString('hex').substring(0, 32) + '...',
			})

			// Deploy via account-factory
			const contractAddress = await this.deployViaFactory(
				salt,
				deviceId,
				publicKeyBuffer,
			)

			console.log('✅ Smart wallet deployed:', contractAddress)

			return {
				address: contractAddress,
				isExisting: false,
			}
		} catch (error) {
			console.error('❌ Error deploying smart wallet:', error)
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
				console.log('ℹ️ Got account info from contractAddress', contractAddress)
				const ledgerEntries = await this.server.getLedgerEntries(ledgerKey)
				// console.log(
				// 	'ℹ️ LedgerEntries for webauthn account',
				// 	JSON.stringify(ledgerEntries.entries, null, 2),
				// )
				// TODO: Substract contract balances... to get smart wallet user balances
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
		} catch (error) {
			console.log('Contract not found:', contractAddress, error)
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
			console.log('🏭 Deploying via account-factory...')
			console.log('📍 Factory Contract ID:', this.factoryContractId)
			console.log('📍 Controller Contract ID:', this.controllerContractId)

			// Verify factory contract exists
			await this.verifyContractExists(this.factoryContractId, 'Account Factory')

			// Verify controller contract exists
			await this.verifyContractExists(
				this.controllerContractId,
				'Auth Controller',
			)

			const fundingAccount = await this.server.getAccount(
				this.fundingKeypair.publicKey(),
			)

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

			console.log('🔄 Simulating deployment transaction...')
			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				console.error('❌ Simulation failed:', simulation)

				// Enhanced error reporting for diagnostic events
				if (simulation.error) {
					console.error('🔍 Simulation error details:', {
						error: simulation.error,
					})
				}

				// Parse diagnostic events if available
				// biome-ignore lint/suspicious/noExplicitAny: SDK types not fully typed
				const diagnosticEvents = (simulation as any).events || []
				if (diagnosticEvents.length > 0) {
					console.error('🔍 Diagnostic events:')
					for (const event of diagnosticEvents) {
						try {
							const decoded = this.decodeDiagnosticEvent(event)
							console.error('  -', decoded)
						} catch {
							console.error('  - Raw event:', event)
						}
					}
				}

				throw new Error(
					`Simulation failed: ${simulation.error || JSON.stringify(simulation)}`,
				)
			}

			console.log('✅ Simulation successful, assembling transaction...')
			const assembledTx = assembleTransaction(transaction, simulation).build()
			assembledTx.sign(this.fundingKeypair)

			console.log('🚀 Submitting deployment transaction...')
			const result = await this.server.sendTransaction(assembledTx)

			if (result.status === 'ERROR') {
				throw new Error(`Deployment failed: ${JSON.stringify(result)}`)
			}

			console.log('⏳ Waiting for transaction confirmation...')
			let attempts = 0
			const maxAttempts = 60

			while (attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
				attempts++

				try {
					const txResult = await this.server.getTransaction(result.hash)

					if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
						console.log('✅ Deployment successful!')

						// Extract contract address from result
						// The factory.deploy() returns Address type
						const returnValue = txResult.returnValue

						if (!returnValue) {
							throw new Error('No return value from deployment')
						}

						// Parse the Address from ScVal
						const contractAddress = Address.fromScVal(returnValue).toString()

						console.log('📋 Deployed contract address:', contractAddress)
						return contractAddress
					}

					if (txResult.status === Api.GetTransactionStatus.FAILED) {
						console.error('❌ Transaction failed with details:', {
							status: txResult.status,
							hash: result.hash,
							ledger: txResult.ledger,
						})

						// Extract diagnostic information
						// biome-ignore lint/suspicious/noExplicitAny: SDK types not fully typed
						const diagnosticEvents = (txResult as any).diagnosticEventsXdr || []
						if (diagnosticEvents.length > 0) {
							console.error('🔍 Transaction diagnostic events:')
							for (const event of diagnosticEvents) {
								try {
									const decoded = this.decodeDiagnosticEvent(event)
									console.error('  -', decoded)
								} catch {
									// Ignore decoding errors
								}
							}
						}

						throw new Error(
							`Deployment failed - Transaction hash: ${result.hash}. Check if auth-controller contract is properly deployed and initialized.`,
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
			console.error('❌ Factory deployment failed:', error)

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
	private async verifyContractExists(
		contractId: string,
		contractName: string,
	): Promise<void> {
		try {
			const contract = new Contract(contractId)
			const ledgerKey = contract.getFootprint()
			const ledgerEntries = await this.server.getLedgerEntries(ledgerKey)

			if (!ledgerEntries.entries || ledgerEntries.entries.length === 0) {
				throw new Error(
					`${contractName} (${contractId}) not found on network. Please deploy the contract first.`,
				)
			}

			console.log(`✅ ${contractName} verified on network`)
		} catch (error) {
			console.error(`❌ Failed to verify ${contractName}:`, error)
			throw new Error(
				`${contractName} (${contractId}) verification failed: ${error}. ` +
					'Please ensure the contract is deployed on this network.',
			)
		}
	}

	/**
	 * Decodes diagnostic events from XDR for debugging
	 */
	// biome-ignore lint/suspicious/noExplicitAny: XDR event types are complex and not fully typed
	private decodeDiagnosticEvent(eventXdr: any): string {
		try {
			// Extract event data for logging
			const event = eventXdr._attributes?.event || eventXdr
			const topics = event._attributes?.body?._value?._attributes?.topics || []
			const data = event._attributes?.body?._value?._attributes?.data

			const topicStrings = topics
				// biome-ignore lint/suspicious/noExplicitAny: XDR topic types vary
				.map((topic: any) => {
					try {
						if (topic._arm === 'sym') {
							return topic._value?.toString('utf-8') || ''
						}
						if (topic._arm === 'str') {
							return topic._value?.toString('utf-8') || ''
						}
						return ''
					} catch {
						return ''
					}
				})
				.filter(Boolean)

			let dataString = ''
			if (data?._arm === 'str') {
				dataString = data._value?.toString('utf-8') || ''
			} else if (data?._arm === 'vec') {
				const vecItems = data._value || []
				dataString = vecItems
					// biome-ignore lint/suspicious/noExplicitAny: XDR data types vary
					.map((item: any) => {
						if (item._arm === 'str') {
							return item._value?.toString('utf-8')
						}
						return ''
					})
					.filter(Boolean)
					.join(' ')
			}

			if (topicStrings.length > 0 || dataString) {
				return `[${topicStrings.join(', ')}] ${dataString}`.trim()
			}

			return 'Unable to decode event'
		} catch {
			return 'Unable to decode event'
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
			console.log('🔒 Checking rate limit for address:', address)

			const rateLimitResult = await this.rateLimiter.checkLimit(address)

			if (!rateLimitResult.allowed) {
				console.warn('⚠️ Rate limit exceeded for signature verification:', {
					address,
					remaining: rateLimitResult.remaining,
					resetAt: new Date(rateLimitResult.resetAt).toISOString(),
				})

				// Log potential brute-force attempt
				console.error('🚨 Potential brute-force attack detected:', {
					address,
					timestamp: new Date().toISOString(),
				})

				return false
			}

			console.log('✅ Rate limit check passed:', {
				remaining: rateLimitResult.remaining,
				resetAt: new Date(rateLimitResult.resetAt).toISOString(),
			})

			console.log('🔍 Verifying passkey signature for address:', address)

			// Parse the signature data (should be WebAuthn assertion response)
			const signatureData = JSON.parse(signature)
			console.log('📝 Signature data:', signatureData)

			// Extract signature components
			const {
				authenticatorData,
				clientDataJSON,
				signature: rawSignature,
			} = signatureData

			if (!authenticatorData || !clientDataJSON || !rawSignature) {
				throw new Error('Missing required signature components')
			}

			// Verify client data challenge matches transaction hash
			const clientData = JSON.parse(
				Buffer.from(clientDataJSON, 'base64').toString('utf-8'),
			)

			if (clientData.challenge !== transactionHash) {
				console.error('❌ Challenge mismatch:', {
					expected: transactionHash,
					received: clientData.challenge,
				})
				return false
			}

			// Verify origin (optional but recommended)
			// TODO: Add proper origin verification based on your environment config
			console.log('🔍 Client origin:', clientData.origin)

			// Get the public key for this address
			const publicKey = await this.getPublicKeyForContract(address)
			if (!publicKey) {
				throw new Error('Public key not found for address')
			}

			// Verify the signature using secp256r1
			const isValid = await this.verifySECP256R1Signature(
				authenticatorData,
				clientDataJSON,
				rawSignature,
				publicKey,
			)

			// Reset rate limit counter on successful verification
			if (isValid) {
				console.log('✅ Signature valid, resetting rate limit counter')
				await this.rateLimiter.reset(address)
			}

			console.log(isValid ? '✅ Signature valid' : '❌ Signature invalid')
			return isValid
		} catch (error) {
			console.error('❌ Error verifying signature:', error)
			return false
		}
	}

	/**
	 * Verifies SECP256R1 signature using Node.js crypto
	 */
	private async verifySECP256R1Signature(
		authenticatorData: string,
		clientDataJSON: string,
		signature: string,
		publicKey: Buffer,
	): Promise<boolean> {
		try {
			// Create the signed data (authenticator data + client data hash)
			const authDataBuffer = Buffer.from(authenticatorData, 'base64')
			const clientDataBuffer = Buffer.from(clientDataJSON, 'base64')
			const clientDataHash = createHash('sha256')
				.update(clientDataBuffer)
				.digest()

			const signedData = Buffer.concat([authDataBuffer, clientDataHash])
			const signatureBuffer = Buffer.from(signature, 'base64')

			// Convert uncompressed public key to DER format for verification
			const publicKeyDER = this.convertUncompressedToDER(publicKey)

			// Create public key object
			const publicKeyObj = createPublicKey({
				key: publicKeyDER,
				format: 'der',
				type: 'spki',
			})

			// Verify signature
			const verify = createVerify('SHA256')
			verify.update(signedData)
			const isValid = verify.verify(publicKeyObj, signatureBuffer)

			return isValid
		} catch (error) {
			console.error('❌ SECP256R1 verification failed:', error)
			return false
		}
	}

	/**
	 * Converts uncompressed public key to DER format for crypto verification
	 */
	private convertUncompressedToDER(uncompressedKey: Buffer): Buffer {
		// DER format for SECP256R1 public key
		// This is the standard ASN.1 DER encoding for P-256 public keys
		const derPrefix = Buffer.from([
			0x30,
			0x59, // SEQUENCE, length
			0x30,
			0x13, // SEQUENCE, length
			0x06,
			0x07,
			0x2a,
			0x86,
			0x48,
			0xce,
			0x3d,
			0x02,
			0x01, // OID for EC public key
			0x06,
			0x08,
			0x2a,
			0x86,
			0x48,
			0xce,
			0x3d,
			0x03,
			0x01,
			0x07, // OID for P-256 curve
			0x03,
			0x42,
			0x00, // BIT STRING, length, unused bits
		])

		return Buffer.concat([derPrefix, uncompressedKey])
	}

	/**
	 * Gets the public key for a contract
	 */
	private async getPublicKeyForContract(
		contractId: string,
	): Promise<Buffer | null> {
		try {
			console.log('🔍 Looking up public key for contract:', contractId)

			// Query database for device record with this contract address
			const deviceRecord = await db
				.select({
					publicKey: devices.publicKey,
					deviceName: devices.deviceName,
					credentialId: devices.credentialId,
				})
				.from(devices)
				.where(eq(devices.address, contractId))
				.limit(1)

			if (deviceRecord.length === 0) {
				console.log('❌ No device found for contract:', contractId)
				return null
			}

			const device = deviceRecord[0]
			console.log('✅ Found device:', {
				name: device.deviceName,
				credentialId: device.credentialId?.substring(0, 16) + '...',
			})

			// The publicKey field should contain the CBOR-encoded public key
			// Convert from base64 string to Buffer for processing
			if (!device.publicKey) {
				console.log('⚠️ Device found but no public key stored')
				return null
			}

			// Check if the public key is already a hex string or base64
			let publicKeyBuffer: Buffer
			try {
				// Try to decode as base64 first (most common format)
				publicKeyBuffer = Buffer.from(device.publicKey, 'base64')
			} catch {
				try {
					// Try as hex string
					publicKeyBuffer = Buffer.from(device.publicKey, 'hex')
				} catch {
					// Assume it's already a raw string
					publicKeyBuffer = Buffer.from(device.publicKey, 'utf8')
				}
			}

			console.log('🔑 Retrieved public key buffer:', {
				length: publicKeyBuffer.length,
				preview: publicKeyBuffer.toString('hex').substring(0, 32) + '...',
			})

			return publicKeyBuffer
		} catch (error) {
			console.error('❌ Error retrieving public key from database:', error)
			return null
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

		try {
			console.log('🚀 Executing passkey transaction:', {
				address,
				operation,
			})

			// Parse operation details
			const operationData: PasskeyOperation = JSON.parse(operation)
			console.log('📋 Operation data:', operationData)

			// Verify signature before execution
			const isValidSignature = await this.verifyPasskeySignature(
				address,
				signature,
				operationData.challenge || `op_${Date.now()}`,
			)

			if (!isValidSignature) {
				throw new Error('Invalid signature for transaction')
			}

			// Execute the specific operation
			switch (operationData.type) {
				case 'add_device':
					return await this.executeAddDevice(address, operationData)
				case 'remove_device':
					return await this.executeRemoveDevice(address, operationData)
				case 'invoke_contract':
					return await this.executeContractInvocation(
						address,
						address,
						operationData,
					)
				default:
					throw new Error('Unsupported operation type')
			}
		} catch (error) {
			console.error('❌ Error executing transaction:', error)
			throw new Error(`Transaction execution failed: ${error}`)
		}
	}

	/**
	 * Executes add device operation on the passkey contract
	 */
	private async executeAddDevice(
		address: string,
		operationData: AddDeviceOperation,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for add device operation')
		}

		const { deviceId, publicKey, isAdmin = false } = operationData

		// Get funding account
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		// Build transaction for adding device
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.STANDARD_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: address,
					function: 'add',
					args: [
						xdr.ScVal.scvBytes(Buffer.from(deviceId, 'utf-8')),
						xdr.ScVal.scvBytes(Buffer.from(publicKey, 'base64')),
						xdr.ScVal.scvBool(isAdmin),
					],
				}),
			)
			.setTimeout(60)
			.build()

		return await this.submitTransaction(transaction)
	}

	/**
	 * Executes remove device operation on the passkey contract
	 */
	private async executeRemoveDevice(
		address: string,
		operationData: RemoveDeviceOperation,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for remove device operation')
		}

		const { deviceId } = operationData

		// Get funding account
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		// Build transaction for removing device
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.STANDARD_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: address,
					function: 'remove',
					args: [xdr.ScVal.scvBytes(Buffer.from(deviceId, 'utf-8'))],
				}),
			)
			.setTimeout(60)
			.build()

		return await this.submitTransaction(transaction)
	}

	/**
	 * Executes general contract invocation
	 */
	private async executeContractInvocation(
		_address: string,
		contractId: string,
		operationData: ContractInvocationOperation,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for contract invocation')
		}

		const { contractAddress, functionName, args = [] } = operationData

		// Get funding account
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		// Convert arguments to ScVal format
		const scArgs = args.map((arg: unknown) => {
			if (typeof arg === 'string') {
				return xdr.ScVal.scvString(arg)
			}
			if (typeof arg === 'number') {
				return xdr.ScVal.scvU64(xdr.Uint64.fromString(arg.toString()))
			}
			if (typeof arg === 'boolean') {
				return xdr.ScVal.scvBool(arg)
			}
			// Default to bytes for complex types
			return xdr.ScVal.scvBytes(Buffer.from(JSON.stringify(arg), 'utf-8'))
		})

		// Build transaction for contract invocation
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.STANDARD_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: contractAddress || contractId,
					function: functionName,
					args: scArgs,
				}),
			)
			.setTimeout(60)
			.build()

		return await this.submitTransaction(transaction)
	}

	/**
	 * Helper to submit transactions with proper error handling and authorization
	 */
	private async submitTransaction(
		builtTransaction: Transaction,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for transaction submission')
		}

		console.log('🔄 Simulating transaction for authorization requirements...')

		// Simulate transaction to get authorization requirements
		const simulation = await this.server.simulateTransaction(builtTransaction)

		if (Api.isSimulationError(simulation)) {
			console.error('❌ Simulation failed:', simulation)
			throw new Error(`Simulation failed: ${JSON.stringify(simulation)}`)
		}

		if (Api.isSimulationRestore(simulation)) {
			console.error('❌ Transaction requires restore:', simulation)
			throw new Error(
				`Transaction requires restore: ${JSON.stringify(simulation)}`,
			)
		}

		console.log('✅ Simulation successful, assembling transaction...')

		// Assemble transaction with authorization entries from simulation
		const assembledTransaction = assembleTransaction(
			builtTransaction,
			simulation,
		).build()

		// Sign the transaction with our funding account
		// The assembleTransaction function handles authorization entries automatically
		console.log('🖊️ Signing transaction with funding account...')
		assembledTransaction.sign(this.fundingKeypair)

		console.log('🚀 Submitting transaction to Soroban RPC...')

		// Submit transaction to Soroban RPC (NOT Horizon - this was the bug!)
		// Soroban transactions with authorization entries must use sendTransaction
		const sendResult = await this.server.sendTransaction(assembledTransaction)

		if (sendResult.status === 'ERROR') {
			console.error('❌ Transaction submission failed:', sendResult)
			throw new Error(`Transaction failed: ${JSON.stringify(sendResult)}`)
		}

		if (sendResult.status === 'PENDING') {
			console.log('⏳ Transaction pending, waiting for confirmation...')

			// Wait for transaction to be included in a ledger
			let attempts = 0
			const maxAttempts = 120 // 2 minutes for complex auth transactions

			console.log(
				`⏳ Waiting for transaction confirmation (hash: ${sendResult.hash})...`,
			)

			while (attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 1 second
				attempts++

				try {
					const txResult = await this.server.getTransaction(sendResult.hash)

					console.log(
						`🔍 Attempt ${attempts}/${maxAttempts} - Status: ${txResult.status}`,
					)

					if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
						console.log('✅ Transaction successful:', sendResult.hash)
						// console.log('📋 Transaction result:', JSON.stringify(txResult.resultMetaXdr, null, 2))
						return sendResult.hash
					}

					if (txResult.status === Api.GetTransactionStatus.FAILED) {
						console.error('❌ Transaction failed:', {
							envelopeXdr: txResult.envelopeXdr.toXDR().toBase64(),
							metaXdr: txResult.resultMetaXdr.toXDR().toBase64(),
							results: txResult.resultXdr.toXDR().toBase64(),
							trnx: txResult.txHash,
							status: txResult.status,
						})
						throw new Error(`Transaction failed: ${JSON.stringify(txResult)}`)
					}

					if (txResult.status === Api.GetTransactionStatus.NOT_FOUND) {
						console.log(
							`⏳ Transaction not yet included in ledger (attempt ${attempts}/${maxAttempts})`,
						)
					}

					// Still pending, continue waiting
				} catch (_error) {
					console.log(
						`⏳ Waiting for transaction to appear (attempt ${attempts}/${maxAttempts})...`,
					)
				}
			}

			throw new Error('Transaction timed out waiting for confirmation')
		}

		console.log('✅ Transaction successful:', sendResult.hash)
		return sendResult.hash
	}

	/**
	 * Cleanup resources when service is destroyed
	 */
	async disconnect(): Promise<void> {
		await this.rateLimiter.disconnect()
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

export interface AddDeviceOperation {
	type: 'add_device'
	deviceId: string
	publicKey: string
	isAdmin?: boolean
	challenge?: string
}

export interface RemoveDeviceOperation {
	type: 'remove_device'
	deviceId: string
	challenge?: string
}

export interface ContractInvocationOperation {
	type: 'invoke_contract'
	contractAddress?: string
	functionName: string
	args?: unknown[]
	challenge?: string
}

export type PasskeyOperation =
	| AddDeviceOperation
	| RemoveDeviceOperation
	| ContractInvocationOperation

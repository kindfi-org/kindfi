import { Buffer } from 'node:buffer'
import { createHash, createPublicKey, createVerify } from 'node:crypto'
import { devices } from '@packages/drizzle'
import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	hash,
	Keypair,
	Operation,
	StrKey,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import * as CBOR from 'cbor-x/decode'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { type RateLimitConfig, SignatureRateLimiter } from './rate-limiter'

/**
 * Simplified Stellar Passkey Account Service V2
 * This service follows the recommended approach using Stellar's passkey patterns
 * without the overdeveloped complexity of the previous implementation
 */
export class StellarPasskeyService {
	private server: Server
	private networkPassphrase: string
	private factoryContractId: string
	private fundingKeypair?: Keypair
	private rateLimiter: SignatureRateLimiter

	private readonly DEPLOYMENT_FEE = '1000000' // High fee for complex auth and deployment
	private readonly STANDARD_FEE = '1000'

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
	 * Creates or retrieves a Stellar account for a passkey
	 * This method only creates the account address and checks if it exists
	 * It does NOT deploy the contract - that should be done separately on approval
	 */
	async preparePasskeyAccount(
		params: PasskeyAccountCreationParams,
	): Promise<PasskeyAccountResult> {
		try {
			console.log(
				'🔍 Preparing Stellar account for passkey:',
				params.credentialId,
			)

			// Generate deterministic salt from credential ID
			const contractSalt = hash(Buffer.from(params.credentialId, 'base64'))

			// Pre-calculate the contract address that would be created
			const contractAddress = this.calculateContractAddress(contractSalt)

			// Check if the contract already exists
			const exists = await this.contractExists(contractAddress)

			if (exists) {
				console.log('✅ Contract already exists:', contractAddress)
				return {
					address: contractAddress,
					contractId: contractAddress,
					isExisting: true,
				}
			}

			console.log('📋 Contract address prepared:', contractAddress)
			return {
				address: contractAddress,
				contractId: contractAddress,
				isExisting: false,
			}
		} catch (error) {
			console.error('❌ Error preparing passkey account:', error)
			throw new Error(`Failed to prepare passkey account: ${error}`)
		}
	}

	/**
	 * Actually deploys the passkey contract to Stellar
	 * This should only be called after user approval/verification
	 */
	async deployPasskeyAccount(
		params: PasskeyAccountCreationParams,
	): Promise<PasskeyAccountResult> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for contract deployment')
		}

		try {
			console.log(
				'🚀 Deploying Stellar account for passkey:',
				params.credentialId,
			)

			// Generate deterministic parameters
			const contractSalt = hash(Buffer.from(params.credentialId, 'base64'))
			const accountId = hash(
				Buffer.from(`${params.credentialId}_account`, 'utf-8'),
			)
			const contractAddress = this.calculateContractAddress(contractSalt)

			// Check if already deployed
			if (await this.contractExists(contractAddress)) {
				console.log('✅ Contract already deployed:', contractAddress)
				return {
					address: contractAddress,
					contractId: contractAddress,
					isExisting: true,
				}
			}

			// Convert public key to proper format
			const publicKeyBuffer = this.processPublicKey(params.publicKey)

			// Deploy the contract
			const transactionHash = await this.executeDeployment(
				contractSalt,
				accountId,
				publicKeyBuffer,
			)

			console.log('✅ Contract deployed successfully:', {
				address: contractAddress,
				transactionHash,
			})

			return {
				address: contractAddress,
				contractId: contractAddress,
				transactionHash,
				isExisting: false,
			}
		} catch (error) {
			console.error('❌ Error deploying passkey account:', error)
			throw new Error(`Failed to deploy passkey account: ${error}`)
		}
	}

	/**
	 * Gets account information for a passkey-controlled account
	 */
	async getAccountInfo(contractId: string): Promise<PasskeyAccountInfo> {
		try {
			// Try to get contract data to see if it exists
			await this.server.getContractData(
				contractId,
				xdr.ScVal.scvLedgerKeyContractInstance(),
			)

			// If we get here, the contract exists
			// For now, return basic info - in a real implementation,
			// you'd query the contract for balance and other details
			return {
				address: contractId,
				balance: '0', // TODO: Query actual balance
				sequence: '0', // TODO: Query actual sequence
				status: 'active',
			}
		} catch {
			console.log('Contract not found:', contractId)
			return {
				address: contractId,
				balance: '0',
				sequence: '0',
				status: 'not_found',
			}
		}
	}

	/**
	 * Calculates the contract address that would be created with the given salt
	 */
	private calculateContractAddress(contractSalt: Buffer): string {
		return StrKey.encodeContract(
			hash(
				xdr.HashIdPreimage.envelopeTypeContractId(
					new xdr.HashIdPreimageContractId({
						networkId: hash(Buffer.from(this.networkPassphrase, 'utf-8')),
						contractIdPreimage:
							xdr.ContractIdPreimage.contractIdPreimageFromAddress(
								new xdr.ContractIdPreimageFromAddress({
									address: Address.fromString(
										this.factoryContractId,
									).toScAddress(),
									salt: contractSalt,
								}),
							),
					}),
				).toXDR(),
			),
		)
	}

	/**
	 * Checks if a contract exists on the network
	 */
	private async contractExists(contractAddress: string): Promise<boolean> {
		try {
			await this.server.getContractData(
				contractAddress,
				xdr.ScVal.scvLedgerKeyContractInstance(),
			)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Processes the public key from base64 CBOR to the required format
	 * Converts CBOR-encoded WebAuthn public key to uncompressed format (65 bytes)
	 * Expected format: 0x04 + 32 bytes X coordinate + 32 bytes Y coordinate
	 */
	private processPublicKey(publicKeyBase64: string): Buffer {
		try {
			const cborPublicKey = Buffer.from(publicKeyBase64, 'base64')

			console.log(
				'🔧 Processing CBOR public key:',
				cborPublicKey.toString('hex'),
				'Length:',
				cborPublicKey.length,
			)

			// If already uncompressed format (65 bytes with 0x04 prefix)
			if (cborPublicKey.length === 65 && cborPublicKey[0] === 0x04) {
				console.log('✅ Public key already in uncompressed format')
				return cborPublicKey
			}

			// Parse CBOR to extract coordinates
			return this.convertCborToUncompressedKey(cborPublicKey)
		} catch (error) {
			console.error('❌ Error processing public key:', error)
			throw new Error(`Failed to process public key: ${error}`)
		}
	}

	/**
	 * Converts CBOR-encoded public key to uncompressed format
	 */
	private convertCborToUncompressedKey(cborPublicKey: Buffer): Buffer {
		try {
			// Parse CBOR data
			const parsedData = CBOR.decode(cborPublicKey)
			console.log('🔍 Parsed CBOR data:', parsedData)

			// Handle Map structure (common in CBOR)
			let coseKey: Record<string | number, unknown>
			if (parsedData instanceof Map) {
				coseKey = {}
				for (const [key, value] of parsedData.entries()) {
					coseKey[key] = value
				}
			} else {
				coseKey = parsedData
			}

			// Extract coordinates according to COSE Key format
			// Debug: Log all key-value pairs to understand the structure
			console.log('🔍 COSE Key structure:')
			for (const [key, value] of Object.entries(coseKey)) {
				console.log(
					`  ${key}:`,
					value instanceof Buffer ? `Buffer(${value.length})` : value,
				)
			}

			// Standard COSE Key parameters:
			// -1: curve identifier (1 for P-256)
			// -2: x coordinate (32 bytes)
			// -3: y coordinate (32 bytes)
			const curve = coseKey[-1] as number
			const xCoord = coseKey[-2] as Buffer
			const yCoord = coseKey[-3] as Buffer

			console.log('🔍 Extracted values:', {
				curve,
				xCoordType: typeof xCoord,
				xCoordLength: xCoord?.length,
				yCoordType: typeof yCoord,
				yCoordLength: yCoord?.length,
			})

			if (!xCoord || !yCoord) {
				throw new Error('Missing X or Y coordinates in COSE key')
			}

			if (curve !== 1) {
				console.warn(
					'⚠️ Unexpected curve value:',
					curve,
					'(expected 1 for P-256)',
				)
			}

			// Ensure coordinates are Buffers
			if (!(xCoord instanceof Buffer) || !(yCoord instanceof Buffer)) {
				throw new Error('Coordinates must be Buffer objects')
			}

			// Validate coordinate lengths
			if (xCoord.length !== 32 || yCoord.length !== 32) {
				throw new Error(
					`Invalid coordinate lengths: X=${xCoord.length}, Y=${yCoord.length} (expected 32 each)`,
				)
			}

			// Construct uncompressed public key: 0x04 + X + Y
			const uncompressedKey = Buffer.concat([
				Buffer.from([0x04]), // Uncompressed point indicator
				xCoord,
				yCoord,
			])

			console.log('✅ Converted to uncompressed format:', {
				length: uncompressedKey.length,
				hex: uncompressedKey.toString('hex'),
			})

			return uncompressedKey
		} catch (error) {
			console.error('❌ CBOR conversion failed:', error)
			throw new Error(`CBOR conversion failed: ${error}`)
		}
	}

	/**
	 * Verifies a passkey signature for transaction authentication
	 * This is essential for the `/api/stellar/verify-signature` endpoint
	 */
	async verifyPasskeySignature(
		contractId: string,
		signature: string,
		transactionHash: string,
	): Promise<boolean> {
		try {
			// Rate limit check BEFORE any verification work
			console.log('🔒 Checking rate limit for contract:', contractId)

			const rateLimitResult = await this.rateLimiter.checkLimit(contractId)

			if (!rateLimitResult.allowed) {
				console.warn('⚠️ Rate limit exceeded for signature verification:', {
					contractId,
					remaining: rateLimitResult.remaining,
					resetAt: new Date(rateLimitResult.resetAt).toISOString(),
				})

				// Log potential brute-force attempt
				console.error('🚨 Potential brute-force attack detected:', {
					contractId,
					timestamp: new Date().toISOString(),
				})

				return false
			}

			console.log('✅ Rate limit check passed:', {
				remaining: rateLimitResult.remaining,
				resetAt: new Date(rateLimitResult.resetAt).toISOString(),
			})

			console.log('🔍 Verifying passkey signature for contract:', contractId)

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

			// Get the public key for this contract
			const publicKey = await this.getPublicKeyForContract(contractId)
			if (!publicKey) {
				throw new Error('Public key not found for contract')
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
				await this.rateLimiter.reset(contractId)
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
	 * Gets the public key for a contract (placeholder - implement based on your storage)
	 */
	private async getPublicKeyForContract(
		contractId: string,
	): Promise<Buffer | null> {
		try {
			console.log('🔍 Looking up public key for contract:', contractId)

			// Query database for device record with this contract address
			const db = getDb
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
		contractId: string,
		operation: string,
		signature: string,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for transaction execution')
		}

		try {
			console.log('🚀 Executing passkey transaction:', {
				contractId,
				operation,
			})

			// Parse operation details
			const operationData: PasskeyOperation = JSON.parse(operation)
			console.log('📋 Operation data:', operationData)

			// Verify signature before execution
			const isValidSignature = await this.verifyPasskeySignature(
				contractId,
				signature,
				operationData.challenge || `op_${Date.now()}`,
			)

			if (!isValidSignature) {
				throw new Error('Invalid signature for transaction')
			}

			// Execute the specific operation
			switch (operationData.type) {
				case 'add_device':
					return await this.executeAddDevice(contractId, operationData)
				case 'remove_device':
					return await this.executeRemoveDevice(contractId, operationData)
				case 'invoke_contract':
					return await this.executeContractInvocation(contractId, operationData)
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
		contractId: string,
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
					contract: contractId,
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
		contractId: string,
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
					contract: contractId,
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
	 * Executes the actual contract deployment with auth-controller integration
	 */
	private async executeDeployment(
		contractSalt: Buffer,
		accountId: Buffer,
		publicKey: Buffer,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required')
		}

		try {
			// Step 1: Ensure auth controller is properly configured
			await this.ensureAuthControllerConfiguration()

			// Step 2: Deploy the passkey account via factory
			const deployTxHash = await this.deployViaFactory(
				contractSalt,
				accountId,
				publicKey,
			)

			// Step 3: Add the account to auth-controller storage
			const contractAddress = this.calculateContractAddress(contractSalt)
			const authTxHash = await this.addAccountToAuthController(contractAddress)

			console.log('✅ Deployment complete:', {
				deployTxHash,
				authTxHash,
				contractAddress,
			})

			return deployTxHash
		} catch (error) {
			console.error('❌ Deployment failed:', error)
			throw error
		}
	}

	/**
	 * Deploys the account via factory contract (following Passkey Kit pattern)
	 */
	private async deployViaFactory(
		contractSalt: Buffer,
		accountId: Buffer,
		publicKey: Buffer,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for deployment')
		}

		console.log('🔧 Building factory deployment transaction...')
		console.log('📋 Parameters:', {
			contractSalt: contractSalt.toString('hex'),
			accountId: accountId.toString('hex'),
			publicKeyLength: publicKey.length,
			factoryContract: this.factoryContractId,
		})

		// First, check that the factory contract is properly configured
		try {
			console.log('🔍 Checking factory contract configuration...')
			const factoryData = await this.server.getContractData(
				this.factoryContractId,
				xdr.ScVal.scvLedgerKeyContractInstance(),
			)
			console.log('✅ Factory contract exists and is accessible')
		} catch (error) {
			console.error('❌ Factory contract not accessible:', error)
			throw new Error(
				`Factory contract not accessible: ${this.factoryContractId}`,
			)
		}

		// Get funding account
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		console.log('💰 Funding account:', {
			publicKey: this.fundingKeypair.publicKey(),
			sequence: fundingAccount.sequenceNumber(),
		})

		// Build transaction for factory deployment
		// NOTE: The factory contract requires auth_contract.require_auth()
		// This means we need to let the transaction simulation handle the authorization
		// The auth controller will sign the transaction during simulation/assembly
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.DEPLOYMENT_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: this.factoryContractId,
					function: 'deploy',
					args: [
						xdr.ScVal.scvBytes(contractSalt),
						xdr.ScVal.scvBytes(accountId),
						xdr.ScVal.scvBytes(publicKey),
					],
				}),
			)
			.setTimeout(60)
			.build()

		return await this.submitTransaction(transaction)
	}

	/**
	 * Adds the newly deployed account to auth-controller storage
	 */
	private async addAccountToAuthController(
		contractAddress: string,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for auth controller operation')
		}

		const config: AppEnvInterface = appEnvConfig('kyc-server')

		// Get funding account for auth operation
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		// Build transaction to add account to auth-controller
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.STANDARD_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: config.stellar.controllerContractId,
					function: 'add_account',
					args: [
						Address.fromString(contractAddress).toScVal(),
						xdr.ScVal.scvVec([Address.fromString(contractAddress).toScVal()]), // context
					],
				}),
			)
			.setTimeout(60)
			.build()

		return await this.submitTransaction(transaction)
	}

	/**
	 * Ensures the auth controller is properly configured for deployments
	 */
	private async ensureAuthControllerConfiguration(): Promise<void> {
		if (!this.fundingKeypair) {
			throw new Error(
				'Funding keypair required for auth controller configuration',
			)
		}

		const config: AppEnvInterface = appEnvConfig('kyc-server')

		try {
			console.log('🔍 Checking auth controller configuration...')

			// Check if auth controller is initialized by trying to get signers
			const fundingAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			const checkTxn = new TransactionBuilder(fundingAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: config.stellar.controllerContractId,
						function: 'get_signers',
						args: [],
					}),
				)
				.setTimeout(30)
				.build()

			const simulation = await this.server.simulateTransaction(checkTxn)

			if (Api.isSimulationError(simulation)) {
				console.log(
					'❌ Auth controller not initialized, attempting to initialize...',
				)
				await this.initializeAuthController()
			} else {
				console.log('✅ Auth controller is properly initialized')

				// Check if factory is registered
				await this.ensureFactoryIsRegistered()
			}
		} catch (error) {
			console.error('❌ Auth controller configuration check failed:', error)
			throw new Error(`Auth controller configuration failed: ${error}`)
		}
	}

	/**
	 * Initializes the auth controller with proper signers
	 */
	private async initializeAuthController(): Promise<void> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for initialization')
		}

		const config: AppEnvInterface = appEnvConfig('kyc-server')

		try {
			console.log('🔧 Initializing auth controller...')

			const fundingAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			// Create signer hash from funding account public key
			const signerHash = hash(this.fundingKeypair.rawPublicKey())

			const initTxn = new TransactionBuilder(fundingAccount, {
				fee: '100000',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: config.stellar.controllerContractId,
						function: 'init',
						args: [
							xdr.ScVal.scvVec([xdr.ScVal.scvBytes(signerHash)]),
							xdr.ScVal.scvU32(1), // threshold
						],
					}),
				)
				.setTimeout(60)
				.build()

			const txHash = await this.submitTransaction(initTxn)
			console.log('✅ Auth controller initialized:', txHash)
		} catch (error) {
			console.error('❌ Auth controller initialization failed:', error)
			throw error
		}
	}

	/**
	 * Ensures the factory contract is registered with the auth controller
	 */
	private async ensureFactoryIsRegistered(): Promise<void> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for factory registration')
		}

		const config: AppEnvInterface = appEnvConfig('kyc-server')

		try {
			console.log('🔍 Ensuring factory is registered with auth controller...')

			const fundingAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			const addFactoryTxn = new TransactionBuilder(fundingAccount, {
				fee: '100000',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: config.stellar.controllerContractId,
						function: 'add_factory',
						args: [Address.fromString(this.factoryContractId).toScVal()],
					}),
				)
				.setTimeout(60)
				.build()

			// Try to simulate first - if it fails, factory might already be registered
			const simulation = await this.server.simulateTransaction(addFactoryTxn)

			if (!Api.isSimulationError(simulation)) {
				const txHash = await this.submitTransaction(addFactoryTxn)
				console.log('✅ Factory registered with auth controller:', txHash)
			} else {
				console.log('✅ Factory already registered or registration not needed')
			}
		} catch (error) {
			console.log(
				'⚠️ Factory registration check completed (might already be registered)',
			)
		}
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
						console.error('❌ Transaction failed:', txResult)
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
	publicKey: string // Base64 encoded CBOR public key
	userId?: string
}

export interface PasskeyAccountResult {
	address: string
	contractId: string
	transactionHash?: string
	isExisting?: boolean
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

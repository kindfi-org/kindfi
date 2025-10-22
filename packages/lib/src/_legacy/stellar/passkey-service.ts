import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	hash,
	Keypair,
	Operation,
	StrKey,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import * as CBOR from 'cbor-x/decode'

/**
 * Simplified Stellar Passkey Account Service
 * This service follows the recommended approach using Stellar's passkey patterns
 * without the overdeveloped complexity of the previous implementation
 */
export class StellarPasskeyService {
	private server: Server
	private networkPassphrase: string
	private factoryContractId: string
	private fundingKeypair?: Keypair

	private static config: AppEnvInterface = appEnvConfig('kyc-server')

	private readonly STANDARD_FEE = '1000'

	constructor(
		networkPassphrase?: string,
		rpcUrl?: string,
		fundingSecretKey?: string,
	) {
		this.networkPassphrase =
			networkPassphrase ||
			StellarPasskeyService.config.stellar.networkPassphrase
		this.server = new Server(
			rpcUrl || StellarPasskeyService.config.stellar.rpcUrl,
		)
		this.factoryContractId =
			StellarPasskeyService.config.stellar.factoryContractId

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
		}
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
	 * Converts COSE/CBOR public key to uncompressed 65-byte EC point (0x04 || X || Y)
	 */
	private processPublicKey(publicKeyBase64: string): Buffer {
		try {
			const rawPublicKey = Buffer.from(publicKeyBase64, 'base64')

			console.log(
				'🔧 Processing CBOR public key:',
				rawPublicKey.toString('hex'),
				'Length:',
				rawPublicKey.length,
			)

			// If already uncompressed format (65 bytes with 0x04 prefix)
			if (rawPublicKey.length === 65 && rawPublicKey[0] === 0x04) {
				console.log('✅ Public key already in uncompressed format')
				return rawPublicKey
			}

			// Parse CBOR to extract coordinates
			return this.convertCborToUncompressedKey(rawPublicKey)
		} catch (error) {
			console.error('❌ Error processing public key:', error)
			throw new Error(`Failed to process public key: ${error}`)
		}
	}

	/**
	 * Converts CBOR-encoded public key to uncompressed format
	 * Extracts X and Y coordinates from COSE key and builds 0x04 || X || Y
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

			if (uncompressedKey.length !== 65) {
				throw new Error(
					`Invalid uncompressed key length: ${uncompressedKey.length} (expected 65)`,
				)
			}

			return uncompressedKey
		} catch (error) {
			console.error('❌ CBOR conversion failed:', error)
			throw new Error(`CBOR conversion failed: ${error}`)
		}
	}

	/**
	 * Executes the actual contract deployment
	 */
	private async executeDeployment(
		contractSalt: Buffer,
		accountId: Buffer,
		publicKey: Buffer,
	): Promise<string> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required')
		}

		// Get funding account
		const fundingAccount = await this.server
			.getAccount(this.fundingKeypair.publicKey())
			.then((res) => new Account(res.accountId(), res.sequenceNumber()))

		// Build transaction
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: this.STANDARD_FEE,
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
			.setTimeout(30) // 30 second timeout
			.build()

		// Simulate transaction
		const simulation = await this.server.simulateTransaction(transaction)

		if (Api.isSimulationError(simulation)) {
			throw new Error(`Simulation failed: ${JSON.stringify(simulation)}`)
		}

		if (Api.isSimulationRestore(simulation)) {
			throw new Error(
				`Transaction requires restore: ${JSON.stringify(simulation)}`,
			)
		}

		// Assemble and sign transaction
		const assembledTransaction = assembleTransaction(transaction, simulation)
			.setTimeout(30)
			.build()

		assembledTransaction.sign(this.fundingKeypair)
		console.log('📡 Submitting transaction to Stellar network...')
		const result = await this.server.sendTransaction(assembledTransaction)

		if (result?.errorResult) {
			throw new Error(`Transaction failed: ${JSON.stringify(result)}`)
		}

		console.log('✅ Transaction successful:', result)
		return result.hash
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

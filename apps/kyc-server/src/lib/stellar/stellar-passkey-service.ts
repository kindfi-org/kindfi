import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	hash,
	Keypair,
	Networks,
	Operation,
	StrKey,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import * as cbor from 'cbor'
import * as cbor2 from 'cbor2'

interface StellarAccountCreationParams {
	credentialId: string
	publicKey: string
	networkPassphrase?: string
	sorobanRpcUrl?: string
}

interface StellarAccountResult {
	address: string
	sequence: string
	contractId?: string
	transactionHash?: string
}

interface PasskeyAccountInfo {
	contractId: string
	balance: string
	sequence: string
	status: string
	error: string
}

interface StellarOperation {
	type: string
	destination?: string
	amount?: string
	asset?: string
}

const appConfig = appEnvConfig('kyc-server')

/**
 * Stellar account management service for Passkey integration
 * Handles creation of Stellar accounts that are controlled by Passkey devices
 * Contract deployments from auth-deployment-info.txt
 */
export class StellarPasskeyAccountService {
	private networkPassphrase: string
	private fundingKeypair?: Keypair
	private server: Server

	// Auth contract IDs from deployment
	private readonly AUTH_CONTROLLER_CONTRACT_ID =
		appConfig.stellar.controllerContractId
	private readonly ACCOUNT_FACTORY_CONTRACT_ID =
		appConfig.stellar.factoryContractId

	constructor(
		networkPassphrase: string = Networks.FUTURENET,
		sorobanRpcUrl: string = 'https://rpc-futurenet.stellar.org',
		fundingSecretKey?: string,
	) {
		this.networkPassphrase = networkPassphrase
		this.server = new Server(sorobanRpcUrl)

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
			console.log(
				'💰 Funding Account Public Key:',
				this.fundingKeypair.publicKey(),
			)
		} else {
			console.warn(
				'⚠️ No funding account provided - contract operations will fail',
			)
		}
	}

	/**
	 * Creates a new Stellar account associated with a Passkey device
	 * This account will be controlled through WebAuthn signatures using auth contract deployment
	 */
	async createPasskeyAccount(
		params: StellarAccountCreationParams,
	): Promise<StellarAccountResult> {
		try {
			console.log(
				'🌟 Creating Stellar account for Passkey:',
				params.credentialId,
			)
			console.log(
				'🔧 Using Factory Contract ID:',
				this.ACCOUNT_FACTORY_CONTRACT_ID,
			)
			console.log(
				'🔧 Using Controller Contract ID:',
				this.AUTH_CONTROLLER_CONTRACT_ID,
			)
			console.log('🔧 Using Network:', this.networkPassphrase)
			console.log('🔧 Using RPC URL:', this.server.serverURL)

			// First, verify that the Factory Contract exists
			try {
				console.log('🔍 Verifying Factory Contract exists...')
				await this.server.getContractData(
					this.ACCOUNT_FACTORY_CONTRACT_ID,
					xdr.ScVal.scvLedgerKeyContractInstance(),
				)
				console.log(
					'✅ Factory Contract verified:',
					this.ACCOUNT_FACTORY_CONTRACT_ID,
				)
			} catch (factoryError) {
				console.error(
					'❌ Factory Contract not found:',
					this.ACCOUNT_FACTORY_CONTRACT_ID,
				)
				console.error('Factory Error Details:', factoryError)
				throw new Error(
					`Factory Contract ${this.ACCOUNT_FACTORY_CONTRACT_ID} does not exist on network ${this.networkPassphrase}. Please deploy the auth contracts first.`,
				)
			}

			// Verify funding account exists and has balance
			if (!this.fundingKeypair) {
				throw new Error(
					'No funding account configured. Cannot deploy contracts.',
				)
			}

			try {
				console.log('💰 Checking funding account balance...')
				const fundingAccount = await this.server.getAccount(
					this.fundingKeypair.publicKey(),
				)
				console.log(
					'✅ Funding account found with sequence:',
					fundingAccount.sequenceNumber(),
				)

				// Check if funding account is a signer in the Auth Controller
				try {
					await this.ensureFundingAccountIsAuthorized()
				} catch (authError) {
					console.error(
						'❌ Auth Controller not properly initialized:',
						authError,
					)
					console.log('🔧 Attempting to initialize Auth Controller...')
					await this.initializeAuthController()
				}
			} catch (error) {
				console.error(
					'❌ Funding account not found:',
					this.fundingKeypair.publicKey(),
				)
				console.error('Funding account error:', error)
				throw new Error(
					`Funding account ${this.fundingKeypair.publicKey()} does not exist or has no balance. Please fund the account first.`,
				)
			}

			// Generate contract salt from credential ID (similar to existing implementation)
			const contractSalt = hash(Buffer.from(params.credentialId, 'base64'))

			// Generate a unique ID for this account (can be derived from credential ID)
			const accountId = hash(
				Buffer.from(`${params.credentialId}_account`, 'utf-8'),
			)

			console.log('🔧 Contract Salt:', contractSalt.toString('hex'))
			console.log('🔧 Account ID:', accountId.toString('hex'))
			console.log(
				'🔧 Public Key length:',
				Buffer.from(params.publicKey, 'base64').length,
			)

			// Calculate the contract address that will be created
			const contractAddress = StrKey.encodeContract(
				hash(
					xdr.HashIdPreimage.envelopeTypeContractId(
						new xdr.HashIdPreimageContractId({
							networkId: hash(Buffer.from(this.networkPassphrase, 'utf-8')),
							contractIdPreimage:
								xdr.ContractIdPreimage.contractIdPreimageFromAddress(
									new xdr.ContractIdPreimageFromAddress({
										address: Address.fromString(
											this.ACCOUNT_FACTORY_CONTRACT_ID,
										).toScAddress(),
										salt: contractSalt,
									}),
								),
						}),
					).toXDR(),
				),
			)

			// Check if contract already exists
			try {
				await this.server.getContractData(
					contractAddress,
					xdr.ScVal.scvLedgerKeyContractInstance(),
				)

				// Contract exists, return existing account
				console.log('✅ Contract already exists:', contractAddress)
				return {
					address: contractAddress,
					sequence: '0',
					contractId: contractAddress,
					transactionHash: 'existing',
				}
			} catch {
				// Contract doesn't exist, proceed with deployment
				console.log('📦 Deploying new Passkey contract...')
			}

			// Deploy new Passkey contract using Account Factory
			const deployResult = await this.deployPasskeyContract(
				contractSalt,
				accountId,
				Buffer.from(params.publicKey, 'base64'),
			)

			return {
				address: contractAddress,
				sequence: '0',
				contractId: contractAddress,
				transactionHash: deployResult.transactionHash,
			}
		} catch (error) {
			console.error('❌ Error creating Passkey account:', error)
			throw new Error(`Failed to create Passkey account: ${error}`)
		}
	}

	/**
	 * Deploys a Passkey-controlled smart contract using the Account Factory
	 * This contract will require WebAuthn signatures for transaction authorization
	 */
	private async deployPasskeyContract(
		contractSalt: Buffer,
		accountId: Buffer,
		publicKey: Buffer,
	): Promise<{ contractId: string; transactionHash: string }> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for contract deployment')
		}

		try {
			console.log('🔐 Deploying Passkey contract with Account Factory...')

			// Convert CBOR public key to uncompressed format (65 bytes)
			const uncompressedPublicKey =
				this.convertToUncompressedPublicKey(publicKey)
			console.log(
				'🔧 Converted public key length:',
				uncompressedPublicKey.length,
			)

			// Get the funding account
			const bundlerKeyAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			console.log('🔍 Funding account details:', {
				publicKey: this.fundingKeypair.publicKey(),
				sequence: bundlerKeyAccount.sequenceNumber(),
				accountId: bundlerKeyAccount.accountId(),
			})

			// Let's try a different approach - check if we need to authorize the factory deployment
			// First, let's see what the Auth Controller expects
			console.log('🔍 Checking Auth Controller authorization requirements...')

			try {
				// Try to get the current signers from Auth Controller
				const signerCheckTxn = new TransactionBuilder(bundlerKeyAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(
						Operation.invokeContractFunction({
							contract: this.AUTH_CONTROLLER_CONTRACT_ID,
							function: 'get_signers',
							args: [],
						}),
					)
					.setTimeout(0)
					.build()

				const signerSim = await this.server.simulateTransaction(signerCheckTxn)

				if (!Api.isSimulationError(signerSim)) {
					console.log('✅ Auth Controller signers accessible')
				} else {
					console.log(
						'❌ Auth Controller signers check failed:',
						signerSim.error,
					)
				}
			} catch (authCheckError) {
				console.log(
					'⚠️ Could not check Auth Controller signers:',
					authCheckError,
				)
			}

			// Build transaction to invoke Account Factory deploy function
			const simTxn = new TransactionBuilder(bundlerKeyAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: this.ACCOUNT_FACTORY_CONTRACT_ID,
						function: 'deploy',
						args: [
							xdr.ScVal.scvBytes(contractSalt),
							xdr.ScVal.scvBytes(accountId),
							xdr.ScVal.scvBytes(uncompressedPublicKey),
						],
					}),
				)
				.setTimeout(0)
				.build()

			// Simulate the transaction
			const sim = await this.server.simulateTransaction(simTxn)

			console.log('🔍 Transaction simulation result:', {
				success: !Api.isSimulationError(sim) && !Api.isSimulationRestore(sim),
				type: Api.isSimulationError(sim)
					? 'error'
					: Api.isSimulationRestore(sim)
						? 'restore'
						: 'success',
				error: Api.isSimulationError(sim) ? sim.error : undefined,
			})

			if (Api.isSimulationError(sim)) {
				console.error(
					'❌ Simulation error details:',
					JSON.stringify(sim, null, 2),
				)
				throw new Error(`Simulation failed: ${JSON.stringify(sim)}`)
			}

			if (Api.isSimulationRestore(sim)) {
				console.error(
					'❌ Simulation restore needed:',
					JSON.stringify(sim, null, 2),
				)
				throw new Error(`Simulation requires restore: ${JSON.stringify(sim)}`)
			}

			// Assemble and sign the transaction
			console.log('🔧 Assembling transaction with fresh account data...')

			// Get fresh account data to ensure correct sequence number
			const freshFundingAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			console.log(
				'🔧 Fresh funding account sequence:',
				freshFundingAccount.sequenceNumber(),
			)
			console.log(
				'🔧 Original account sequence:',
				bundlerKeyAccount.sequenceNumber(),
			)

			// Rebuild the transaction with fresh account if sequence number has changed
			let finalTransaction: ReturnType<
				typeof TransactionBuilder.prototype.build
			>
			if (
				freshFundingAccount.sequenceNumber() !==
				bundlerKeyAccount.sequenceNumber()
			) {
				console.log('🔧 Sequence number changed, rebuilding transaction...')

				// Rebuild the transaction with fresh account
				const freshSimTxn = new TransactionBuilder(freshFundingAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(
						Operation.invokeContractFunction({
							contract: this.ACCOUNT_FACTORY_CONTRACT_ID,
							function: 'deploy',
							args: [
								xdr.ScVal.scvBytes(contractSalt),
								xdr.ScVal.scvBytes(accountId),
								xdr.ScVal.scvBytes(uncompressedPublicKey),
							],
						}),
					)
					.setTimeout(0)
					.build()

				finalTransaction = assembleTransaction(freshSimTxn, sim)
					.setTimeout(0)
					.build()
			} else {
				finalTransaction = assembleTransaction(simTxn, sim)
					.setTimeout(0)
					.build()
			}

			finalTransaction.sign(this.fundingKeypair)

			// Submit the transaction using Horizon
			const appConfig: AppEnvInterface = appEnvConfig('kyc-server')
			const txResp = await (
				await fetch(`${appConfig.stellar.horizonUrl}/transactions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ tx: finalTransaction.toXDR() }),
				})
			).json()

			if (!txResp.successful) {
				throw new Error(`Transaction failed: ${JSON.stringify(txResp)}`)
			}

			// Calculate the deployed contract ID
			const contractId = StrKey.encodeContract(
				hash(
					xdr.HashIdPreimage.envelopeTypeContractId(
						new xdr.HashIdPreimageContractId({
							networkId: hash(Buffer.from(this.networkPassphrase, 'utf-8')),
							contractIdPreimage:
								xdr.ContractIdPreimage.contractIdPreimageFromAddress(
									new xdr.ContractIdPreimageFromAddress({
										address: Address.fromString(
											this.ACCOUNT_FACTORY_CONTRACT_ID,
										).toScAddress(),
										salt: contractSalt,
									}),
								),
						}),
					).toXDR(),
				),
			)

			console.log('✅ Passkey contract deployed successfully:', {
				contractId,
				transactionHash: txResp.hash,
			})

			return {
				contractId,
				transactionHash: txResp.hash,
			}
		} catch (error) {
			console.error('❌ Error deploying Passkey contract:', error)
			throw error
		}
	}

	/**
	 * Verifies a WebAuthn signature for a Stellar transaction using the Auth Controller contract
	 */
	async verifyPasskeySignature(
		contractId: string,
		signature: string,
		transactionHash: string,
	): Promise<boolean> {
		try {
			console.log('🔍 Verifying Passkey signature with Auth Controller:', {
				contractId,
				transactionHash,
			})

			// Parse the WebAuthn signature
			const webauthnSignature = JSON.parse(signature)

			// Create a dummy account for simulation (we only need to simulate, not submit)
			const dummyKeypair = Keypair.random()
			const dummyAccount = new Account(dummyKeypair.publicKey(), '0')

			// Build a transaction to call the verify_signature function
			const transaction = new TransactionBuilder(dummyAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: this.AUTH_CONTROLLER_CONTRACT_ID,
						function: 'verify_signature',
						args: [
							xdr.ScVal.scvString(contractId),
							xdr.ScVal.scvString(JSON.stringify(webauthnSignature)),
							xdr.ScVal.scvString(transactionHash),
						],
					}),
				)
				.setTimeout(0)
				.build()

			// Simulate the verification (read-only operation)
			const simResult = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simResult)) {
				console.error('❌ Signature verification failed:', simResult)
				return false
			}

			// Extract the result from simulation
			const isValid = !!simResult.result?.retval

			console.log('✅ Signature verification result:', isValid)
			return isValid
		} catch (error) {
			console.error('❌ Error verifying Passkey signature:', error)
			return false
		}
	}

	/**
	 * Executes a transaction on behalf of a Passkey-controlled account using auth contract interaction
	 */
	async executePasskeyTransaction(
		contractId: string,
		operation: StellarOperation,
		webauthnSignature: string,
	): Promise<string> {
		try {
			// Verify the WebAuthn signature first
			const isValidSignature = await this.verifyPasskeySignature(
				contractId,
				webauthnSignature,
				'pending_tx_hash', // Using a placeholder for now
			)

			if (!isValidSignature) {
				throw new Error('Invalid WebAuthn signature')
			}

			if (!this.fundingKeypair) {
				throw new Error('Funding keypair required for transaction execution')
			}

			console.log('⚡ Executing Passkey transaction with auth contract:', {
				contractId,
				operation,
			})

			// Get the funding account for transaction building
			const bundlerKeyAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			// Build transaction to execute operation through the Passkey contract
			const simTxn = new TransactionBuilder(bundlerKeyAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: contractId,
						function: 'execute_transaction',
						args: [
							xdr.ScVal.scvString(JSON.stringify(operation)),
							xdr.ScVal.scvString(webauthnSignature),
						],
					}),
				)
				.setTimeout(0)
				.build()

			// Simulate the transaction
			const sim = await this.server.simulateTransaction(simTxn)

			if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) {
				throw new Error(`Transaction simulation failed: ${JSON.stringify(sim)}`)
			}

			// Assemble and sign the transaction
			const transaction = assembleTransaction(simTxn, sim).setTimeout(0).build()
			transaction.sign(this.fundingKeypair)

			// Submit the transaction
			const appConfig: AppEnvInterface = appEnvConfig('kyc-server')
			const txResp = await (
				await fetch(`${appConfig.stellar.horizonUrl}/transactions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ tx: transaction.toXDR() }),
				})
			).json()

			if (!txResp.successful) {
				throw new Error(
					`Transaction execution failed: ${JSON.stringify(txResp)}`,
				)
			}

			console.log('✅ Passkey transaction executed successfully:', txResp.hash)
			return txResp.hash
		} catch (error) {
			console.error('❌ Error executing Passkey transaction:', error)
			throw error
		}
	}

	/**
	 * Gets account information for a Passkey-controlled account using auth contract state
	 */
	async getPasskeyAccountInfo(contractId: string): Promise<PasskeyAccountInfo> {
		try {
			console.log('📊 Getting Passkey account info from contract:', contractId)

			// Query the contract state to get account information
			const contractDataKey = xdr.ScVal.scvLedgerKeyContractInstance()

			try {
				const contractData = await this.server.getContractData(
					contractId,
					contractDataKey,
				)

				console.log('getPasskeyAccountInfo —> getContractData', contractData)

				// For now, return default values since we don't have the exact contract interface
				// This would need to be adapted based on the actual contract interface
				// TODO: log and test
				return {
					contractId,
					balance: '0',
					sequence: '0',
					status: 'active',
					error: '',
				}
			} catch (error) {
				// If contract doesn't exist, return default values
				console.log('Contract not found or inactive:', error)

				return {
					contractId,
					balance: '0',
					sequence: '0',
					status: 'not_found',
					error: (error as Error).message,
				}
			}
		} catch (error) {
			console.error('❌ Error getting Passkey account info:', error)
			throw error
		}
	}

	/**
	 * Converts CBOR-encoded WebAuthn public key to uncompressed format (65 bytes)
	 * Expected format: 0x04 + 32 bytes X coordinate + 32 bytes Y coordinate
	 */
	private convertToUncompressedPublicKey(cborPublicKey: Buffer): Buffer {
		try {
			console.log(
				'🔧 Converting CBOR public key:',
				cborPublicKey.toString('hex'),
			)

			if (cborPublicKey.length === 65 && cborPublicKey[0] === 0x04) {
				// Already uncompressed format
				console.log('✅ Public key already in uncompressed format')
				return cborPublicKey
			}

			// Try multiple CBOR parsing approaches
			let parsedData: Record<string | number, unknown>
			let parsingMethod = ''

			try {
				// Method 1: Using cbor library
				const rawParsedData = cbor.decode(cborPublicKey)
				parsingMethod = 'cbor'

				console.log('🔍 Raw parsed data type:', typeof rawParsedData)
				console.log('🔍 Is Map?', rawParsedData instanceof Map)
				console.log('🔍 Raw parsed data:', rawParsedData)

				// Handle Map structure properly
				if (rawParsedData instanceof Map) {
					console.log('🔄 Converting Map to object...')
					parsedData = {}
					for (const [key, value] of rawParsedData.entries()) {
						parsedData[key] = value
					}
					console.log(
						'✅ Converted Map to object:',
						JSON.stringify(parsedData, null, 2),
					)
				} else {
					parsedData = rawParsedData
				}

				console.log(
					'✅ Parsed with cbor library:',
					JSON.stringify(parsedData, null, 2),
				)

				if (Object.keys(parsedData).length === 0) {
					console.log(
						'⚠️ Empty object from cbor library, trying alternative approach...',
					)
					throw new Error('CBOR library returned empty object')
				}
			} catch (error1) {
				console.log('❌ cbor library failed:', error1)

				try {
					// Method 2: Using cbor2 library
					parsedData = cbor2.decode(cborPublicKey)
					parsingMethod = 'cbor2'
					console.log(
						'✅ Parsed with cbor2 library:',
						JSON.stringify(parsedData, null, 2),
					)

					// Handle Map structure if needed
					if (
						Object.keys(parsedData).length === 0 &&
						parsedData instanceof Map
					) {
						console.log('🔄 Converting Map to object (cbor2)...')
						const mapObj: Record<string | number, unknown> = {}
						for (const [key, value] of parsedData.entries()) {
							mapObj[key] = value
						}
						parsedData = mapObj
						console.log(
							'✅ Converted Map to object (cbor2):',
							JSON.stringify(parsedData, null, 2),
						)
					}

					if (Object.keys(parsedData).length === 0) {
						throw new Error('CBOR2 library returned empty object')
					}
				} catch (error2) {
					console.log('❌ cbor2 library failed:', error2)

					// Method 3: Try to decode raw CBOR manually by checking the structure
					console.log('🔄 Attempting advanced manual parsing...')
					try {
						// Let's try to parse the CBOR structure manually with proper understanding
						const result = this.advancedCborParsing(cborPublicKey)
						if (result) {
							return result
						}
					} catch (error3) {
						console.log('❌ Advanced manual parsing failed:', error3)
					}

					// Method 4: Fallback to original manual parsing
					console.log('🔄 Falling back to original manual parsing...')
					return this.manualCborParsing(cborPublicKey)
				}
			}

			// Extract coordinates from parsed CBOR data
			if (!parsedData || typeof parsedData !== 'object') {
				throw new Error('Invalid CBOR data structure')
			}

			console.log('🔍 Parsed CBOR structure:', {
				keys: Object.keys(parsedData),
				values: Object.entries(parsedData).map(([k, v]) => [
					k,
					v instanceof Buffer ? v.toString('hex') : v,
				]),
				dataType: typeof parsedData,
				constructor: parsedData.constructor.name,
			})

			// WebAuthn COSE key format:
			// 1 (kty): 2 (EC2)
			// 3 (alg): -7 (ES256)
			// -1 (crv): 1 (P-256)
			// -2 (x): X coordinate as bytes
			// -3 (y): Y coordinate as bytes

			// Try different ways to access the keys
			const kty = parsedData[1] || parsedData['1'] || parsedData[0x01]
			const alg = parsedData[3] || parsedData['3'] || parsedData[0x03]
			const crv =
				parsedData[-1] ||
				parsedData['-1'] ||
				parsedData[255] ||
				parsedData['255'] // -1 as unsigned byte is 255
			const xCoord =
				parsedData[-2] ||
				parsedData['-2'] ||
				parsedData[254] ||
				parsedData['254'] // -2 as unsigned byte is 254
			const yCoord =
				parsedData[-3] ||
				parsedData['-3'] ||
				parsedData[253] ||
				parsedData['253'] // -3 as unsigned byte is 253

			console.log('🔍 CBOR key components:', {
				kty,
				alg,
				crv,
				xCoordType: typeof xCoord,
				yCoordType: typeof yCoord,
				xLength: xCoord instanceof Buffer ? xCoord.length : 'not buffer',
				yLength: yCoord instanceof Buffer ? yCoord.length : 'not buffer',
				allKeys: Object.keys(parsedData),
				rawKeys: Object.getOwnPropertyNames(parsedData),
			})

			// Validate key type and algorithm
			if (kty !== 2) {
				throw new Error(`Invalid key type: ${kty}, expected 2 (EC2)`)
			}

			if (alg !== -7) {
				throw new Error(`Invalid algorithm: ${alg}, expected -7 (ES256)`)
			}

			if (crv !== 1) {
				throw new Error(`Invalid curve: ${crv}, expected 1 (P-256)`)
			}

			// Extract coordinates
			let xBuffer: Buffer
			let yBuffer: Buffer

			if (xCoord instanceof Buffer) {
				xBuffer = xCoord
			} else if (xCoord instanceof Uint8Array) {
				xBuffer = Buffer.from(xCoord)
			} else {
				throw new Error('X coordinate is not a buffer or Uint8Array')
			}

			if (yCoord instanceof Buffer) {
				yBuffer = yCoord
			} else if (yCoord instanceof Uint8Array) {
				yBuffer = Buffer.from(yCoord)
			} else {
				throw new Error('Y coordinate is not a buffer or Uint8Array')
			}

			// Validate coordinate lengths
			if (xBuffer.length !== 32) {
				throw new Error(
					`Invalid X coordinate length: ${xBuffer.length}, expected 32`,
				)
			}

			if (yBuffer.length !== 32) {
				throw new Error(
					`Invalid Y coordinate length: ${yBuffer.length}, expected 32`,
				)
			}

			console.log('✅ Extracted X coordinate:', xBuffer.toString('hex'))
			console.log('✅ Extracted Y coordinate:', yBuffer.toString('hex'))

			// Basic validation: ensure coordinates are not all zeros
			const allZeroX = xBuffer.every((byte) => byte === 0)
			const allZeroY = yBuffer.every((byte) => byte === 0)

			if (allZeroX || allZeroY) {
				throw new Error('Invalid public key: coordinates cannot be all zeros')
			}

			console.log('🔍 X coordinate validation:', {
				firstBytes: xBuffer.subarray(0, 4).toString('hex'),
				lastBytes: xBuffer.subarray(-4).toString('hex'),
				allZero: allZeroX,
			})

			console.log('🔍 Y coordinate validation:', {
				firstBytes: yBuffer.subarray(0, 4).toString('hex'),
				lastBytes: yBuffer.subarray(-4).toString('hex'),
				allZero: allZeroY,
			})

			// Create uncompressed format: 0x04 + X (32 bytes) + Y (32 bytes)
			const uncompressed = Buffer.alloc(65)
			uncompressed[0] = 0x04 // Uncompressed point indicator

			// Copy X and Y coordinates
			xBuffer.copy(uncompressed, 1)
			yBuffer.copy(uncompressed, 33)

			console.log(
				'✅ Created uncompressed public key:',
				uncompressed.toString('hex'),
			)
			console.log('🔍 Key structure validation:', {
				prefix: uncompressed[0].toString(16),
				xStart: uncompressed.subarray(1, 5).toString('hex'),
				yStart: uncompressed.subarray(33, 37).toString('hex'),
				totalLength: uncompressed.length,
				parsingMethod,
			})

			return uncompressed
		} catch (error) {
			console.error('❌ Error converting public key:', error)
			console.error('❌ Original key length:', cborPublicKey.length)
			console.error('❌ Original key hex:', cborPublicKey.toString('hex'))

			throw new Error(
				`Public key conversion failed: ${error}. Original key: ${cborPublicKey.toString('hex')}`,
			)
		}
	}

	/**
	 * Advanced manual CBOR parsing that understands the byte structure
	 */
	private advancedCborParsing(cborPublicKey: Buffer): Buffer | null {
		try {
			const hex = cborPublicKey.toString('hex')
			console.log('🔧 Advanced CBOR parsing, analyzing structure...')

			// CBOR format analysis:
			// a5 = map with 5 entries
			// 01 = key 1 (kty)
			// 02 = value 2 (EC2)
			// 03 = key 3 (alg)
			// 26 = value -7 (ES256)
			// 20 = key -1 (crv)
			// 01 = value 1 (P-256)
			// 21 = key -2 (x coordinate)
			// 5820 = byte string, 32 bytes
			// [32 bytes x coordinate]
			// 22 = key -3 (y coordinate)
			// 5820 = byte string, 32 bytes
			// [32 bytes y coordinate]

			// Parse the structure manually
			if (!hex.startsWith('a5')) {
				throw new Error('Not a CBOR map with 5 entries')
			}

			console.log('✅ Valid CBOR map with 5 entries detected')

			// Parse each key-value pair
			let offset = 2 // Skip 'a5'
			const parsedData: Record<number, unknown> = {}

			for (let i = 0; i < 5; i++) {
				// Read key
				const keyByte = parseInt(hex.substr(offset, 2), 16)
				offset += 2

				let key: number
				if (keyByte === 0x01) {
					key = 1
				} else if (keyByte === 0x03) {
					key = 3
				} else if (keyByte === 0x20) {
					key = -1
				} else if (keyByte === 0x21) {
					key = -2
				} else if (keyByte === 0x22) {
					key = -3
				} else {
					console.log(`⚠️ Unknown key byte: ${keyByte.toString(16)}`)
					continue
				}

				// Read value based on key
				if (key === 1) {
					// kty: should be 02
					const value = parseInt(hex.substr(offset, 2), 16)
					parsedData[key] = value
					offset += 2
					console.log(`✅ Key ${key} (kty): ${value}`)
				} else if (key === 3) {
					// alg: should be 26 (-7)
					const valueByte = parseInt(hex.substr(offset, 2), 16)
					const value = valueByte === 0x26 ? -7 : valueByte
					parsedData[key] = value
					offset += 2
					console.log(`✅ Key ${key} (alg): ${value}`)
				} else if (key === -1) {
					// crv: should be 01
					const value = parseInt(hex.substr(offset, 2), 16)
					parsedData[key] = value
					offset += 2
					console.log(`✅ Key ${key} (crv): ${value}`)
				} else if (key === -2 || key === -3) {
					// x or y coordinate: should be 5820 followed by 32 bytes
					const lengthMarker = hex.substr(offset, 4)
					if (lengthMarker !== '5820') {
						throw new Error(
							`Expected byte string marker 5820, got ${lengthMarker}`,
						)
					}
					offset += 4

					const coordHex = hex.substr(offset, 64) // 32 bytes = 64 hex chars
					const coordBuffer = Buffer.from(coordHex, 'hex')
					parsedData[key] = coordBuffer
					offset += 64
					console.log(
						`✅ Key ${key} (${key === -2 ? 'x' : 'y'} coord): ${coordHex}`,
					)
				}
			}

			console.log('✅ Advanced parsing completed:', {
				kty: parsedData[1],
				alg: parsedData[3],
				crv: parsedData[-1],
				xLength:
					parsedData[-2] instanceof Buffer
						? (parsedData[-2] as Buffer).length
						: 'not buffer',
				yLength:
					parsedData[-3] instanceof Buffer
						? (parsedData[-3] as Buffer).length
						: 'not buffer',
			})

			// Validate and create uncompressed key
			if (parsedData[1] !== 2) {
				throw new Error(`Invalid kty: ${parsedData[1]}, expected 2`)
			}
			if (parsedData[3] !== -7) {
				throw new Error(`Invalid alg: ${parsedData[3]}, expected -7`)
			}
			if (parsedData[-1] !== 1) {
				throw new Error(`Invalid crv: ${parsedData[-1]}, expected 1`)
			}

			const xCoord = parsedData[-2] as Buffer
			const yCoord = parsedData[-3] as Buffer

			if (!xCoord || !yCoord || xCoord.length !== 32 || yCoord.length !== 32) {
				throw new Error('Invalid coordinate buffers')
			}

			// Create uncompressed format
			const uncompressed = Buffer.alloc(65)
			uncompressed[0] = 0x04
			xCoord.copy(uncompressed, 1)
			yCoord.copy(uncompressed, 33)

			console.log(
				'✅ Advanced parsing created uncompressed key:',
				uncompressed.toString('hex'),
			)
			return uncompressed
		} catch (error) {
			console.log('❌ Advanced CBOR parsing failed:', error)
			return null
		}
	}

	/**
	 * Fallback manual CBOR parsing when libraries fail
	 */
	private manualCborParsing(cborPublicKey: Buffer): Buffer {
		// This is the previous manual parsing implementation as fallback
		const cborHex = cborPublicKey.toString('hex')
		console.log('🔧 Manual CBOR parsing, hex:', cborHex)

		// Find X coordinate: look for "21 5820" (key -2, byte string 32 bytes)
		const xCoordMarker = '215820'
		const xIndex = cborHex.indexOf(xCoordMarker)

		if (xIndex === -1) {
			throw new Error('X coordinate marker not found in CBOR data')
		}

		// Extract 32-byte X coordinate (64 hex chars after the marker)
		const xCoordStart = xIndex + xCoordMarker.length
		const xCoordHex = cborHex.substring(xCoordStart, xCoordStart + 64)

		if (xCoordHex.length !== 64) {
			throw new Error(
				`Invalid X coordinate length: ${xCoordHex.length}, expected 64`,
			)
		}

		// Find Y coordinate: look for "22 5820" (key -3, byte string 32 bytes)
		const yCoordMarker = '225820'
		const yIndex = cborHex.indexOf(yCoordMarker)

		if (yIndex === -1) {
			throw new Error('Y coordinate marker not found in CBOR data')
		}

		// Extract 32-byte Y coordinate (64 hex chars after the marker)
		const yCoordStart = yIndex + yCoordMarker.length
		const yCoordHex = cborHex.substring(yCoordStart, yCoordStart + 64)

		if (yCoordHex.length !== 64) {
			throw new Error(
				`Invalid Y coordinate length: ${yCoordHex.length}, expected 64`,
			)
		}

		console.log('✅ Manual parsing - X coordinate:', xCoordHex)
		console.log('✅ Manual parsing - Y coordinate:', yCoordHex)

		// Create uncompressed format: 0x04 + X (32 bytes) + Y (32 bytes)
		const uncompressed = Buffer.alloc(65)
		uncompressed[0] = 0x04 // Uncompressed point indicator

		// Copy X and Y coordinates
		Buffer.from(xCoordHex, 'hex').copy(uncompressed, 1)
		Buffer.from(yCoordHex, 'hex').copy(uncompressed, 33)

		return uncompressed
	}

	/**
	 * Ensures the funding account is authorized to deploy contracts via the Auth Controller
	 */
	private async ensureFundingAccountIsAuthorized(): Promise<void> {
		if (!this.fundingKeypair) {
			throw new Error('No funding account available')
		}

		try {
			// Check if Auth Controller is initialized by calling get_signers
			const signerCheckTxn = new TransactionBuilder(
				new Account(this.fundingKeypair.publicKey(), '0'),
				{
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				},
			)
				.addOperation(
					Operation.invokeContractFunction({
						contract: this.AUTH_CONTROLLER_CONTRACT_ID,
						function: 'get_signers',
						args: [],
					}),
				)
				.setTimeout(0)
				.build()

			const signerCheckSim =
				await this.server.simulateTransaction(signerCheckTxn)

			if (Api.isSimulationError(signerCheckSim)) {
				throw new Error('Auth Controller not initialized')
			}

			console.log('✅ Auth Controller is initialized')
		} catch (error) {
			console.error('❌ Auth Controller check failed:', error)
			throw error
		}
	}

	/**
	 * Initializes the Auth Controller with the funding account as a signer
	 */
	private async initializeAuthController(): Promise<void> {
		if (!this.fundingKeypair) {
			throw new Error('No funding account available for initialization')
		}

		try {
			console.log('🔧 Initializing Auth Controller...')

			// Get funding account hash for the signer
			const fundingAccountHash = hash(this.fundingKeypair.rawPublicKey())

			// Get the funding account for transaction building
			const fundingAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			// Build initialization transaction
			const initTxn = new TransactionBuilder(fundingAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(
					Operation.invokeContractFunction({
						contract: this.AUTH_CONTROLLER_CONTRACT_ID,
						function: 'init',
						args: [
							// signers: Vec<BytesN<32>>
							xdr.ScVal.scvVec([xdr.ScVal.scvBytes(fundingAccountHash)]),
							// default_threshold: u32
							xdr.ScVal.scvU32(1),
						],
					}),
				)
				.setTimeout(0)
				.build()

			// Simulate the transaction
			const sim = await this.server.simulateTransaction(initTxn)

			if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) {
				throw new Error(
					`Auth Controller initialization simulation failed: ${JSON.stringify(sim)}`,
				)
			}

			// Assemble and sign the transaction
			const transaction = assembleTransaction(initTxn, sim)
				.setTimeout(0)
				.build()
			transaction.sign(this.fundingKeypair)

			// Submit the transaction
			const appConfig: AppEnvInterface = appEnvConfig('kyc-server')
			const txResp = await (
				await fetch(`${appConfig.stellar.horizonUrl}/transactions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ tx: transaction.toXDR() }),
				})
			).json()

			if (!txResp.successful) {
				throw new Error(
					`Auth Controller initialization failed: ${JSON.stringify(txResp)}`,
				)
			}

			console.log('✅ Auth Controller initialized successfully:', txResp.hash)
		} catch (error) {
			console.error('❌ Error initializing Auth Controller:', error)
			throw error
		}
	}
}

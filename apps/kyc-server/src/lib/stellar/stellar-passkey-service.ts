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
		networkPassphrase: string = Networks.TESTNET,
		sorobanRpcUrl: string = 'https://soroban-testnet.stellar.org:443',
		fundingSecretKey?: string,
	) {
		this.networkPassphrase = networkPassphrase
		this.server = new Server(sorobanRpcUrl)

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
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

			// Generate contract salt from credential ID (similar to existing implementation)
			const contractSalt = hash(Buffer.from(params.credentialId, 'base64'))

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
		publicKey: Buffer,
	): Promise<{ contractId: string; transactionHash: string }> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for contract deployment')
		}

		try {
			console.log('🔐 Deploying Passkey contract with real Account Factory...')

			// Get the funding account
			const bundlerKeyAccount = await this.server
				.getAccount(this.fundingKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

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
							xdr.ScVal.scvBytes(publicKey),
						],
					}),
				)
				.setTimeout(0)
				.build()

			// Simulate the transaction
			const sim = await this.server.simulateTransaction(simTxn)

			if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) {
				throw new Error(`Simulation failed: ${JSON.stringify(sim)}`)
			}

			// Assemble and sign the transaction
			const transaction = assembleTransaction(simTxn, sim).setTimeout(0).build()
			transaction.sign(this.fundingKeypair)

			// Submit the transaction using Horizon
			const appConfig: AppEnvInterface = appEnvConfig('kyc-server')
			const txResp = await (
				await fetch(`${appConfig.stellar.horizonUrl}/transactions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ tx: transaction.toXDR() }),
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
				}
			} catch (error) {
				// If contract doesn't exist, return default values
				console.log('Contract not found or inactive:', error)

				return {
					contractId,
					balance: '0',
					sequence: '0',
					status: 'not_found',
				}
			}
		} catch (error) {
			console.error('❌ Error getting Passkey account info:', error)
			throw error
		}
	}
}

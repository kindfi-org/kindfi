import {
	type Address,
	Contract,
	Keypair,
	Networks,
	type Operation,
	type ScVal,
	type SorobanAuthorizationEntry,
	SorobanRpc,
	type Transaction,
	TransactionBuilder,
} from '@stellar/stellar-sdk'
import type { AppEnvInterface } from '../types'
import { ChannelsClientService } from './channels-client.service'

/**
 * WebAuthn signature data structure matching OpenZeppelin Smart Account format
 */
export interface WebAuthnSignatureData {
	signature: Uint8Array // 64 bytes for secp256r1
	authenticatorData: Uint8Array // Minimum 37 bytes
	clientData: Uint8Array // Max 1024 bytes, JSON string
}

/**
 * Smart Account service for managing OpenZeppelin Smart Accounts
 * Handles account creation, context rules, and transaction signing
 */
export class SmartAccountService {
	private readonly server: SorobanRpc.Server
	private readonly networkPassphrase: string
	private readonly channelsClient: ChannelsClientService
	private readonly webAuthnVerifierAddress?: string

	constructor(config: AppEnvInterface) {
		this.networkPassphrase = config.stellar.networkPassphrase
		this.server = new SorobanRpc.Server(config.stellar.rpcUrl)
		this.channelsClient = new ChannelsClientService(config)

		// WebAuthn verifier contract address (should be deployed OpenZeppelin verifier)
		// This should be configured via environment variable
		this.webAuthnVerifierAddress =
			process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS ||
			process.env.WEBAUTHN_VERIFIER_ADDRESS ||
			undefined
	}

	/**
	 * Create a new Smart Account with WebAuthn passkey as signer
	 * Uses OpenZeppelin Smart Account factory pattern
	 *
	 * NOTE: This method is deprecated. Use SmartAccountKitService instead.
	 * This method will delegate to Smart Account Kit SDK if available.
	 */
	async createSmartAccount(params: {
		publicKey: Uint8Array // secp256r1 public key (65 bytes uncompressed)
		credentialId: string
		appName?: string
		userName?: string
	}): Promise<{ address: string; transactionHash: string }> {
		// Try to use Smart Account Kit SDK if available
		try {
			const {
				SmartAccountKitService,
			} = require('../../../../apps/web/lib/stellar/smart-account-kit.service')
			const kitService = new SmartAccountKitService()

			if (kitService.isReady()) {
				const result = await kitService.createWallet(
					params.appName || 'KindFi',
					params.userName || 'User',
					{ autoSubmit: true },
				)

				return {
					address: result.contractId,
					transactionHash: '', // SDK handles submission
				}
			}
		} catch (error) {
			console.warn('⚠️ Smart Account Kit not available, using fallback:', error)
		}

		// Fallback: throw error if Smart Account Kit is not available
		throw new Error(
			'Smart Account creation requires Smart Account Kit SDK. ' +
				'Install with: bun add smart-account-kit ' +
				'And configure: NEXT_PUBLIC_ACCOUNT_WASM_HASH and NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS',
		)
	}

	/**
	 * Add a context rule to a Smart Account
	 * Context rules define authorization scopes and policies
	 */
	async addContextRule(params: {
		accountAddress: string
		contextType:
			| 'Default'
			| { CallContract: string }
			| { CreateContract: string }
		name: string
		signers: Array<{ External: [string, Uint8Array] } | { Delegated: string }>
		policies?: Array<{ address: string; params: unknown }>
		validUntil?: number // Ledger sequence
	}): Promise<{ transactionHash: string }> {
		// This would call the Smart Account's add_context_rule function
		// Implementation depends on OpenZeppelin Smart Account contract interface
		throw new Error('Context rule addition not yet implemented')
	}

	/**
	 * Sign and submit a transaction using WebAuthn passkey
	 * Uses Channels service for transaction submission
	 */
	async signAndSubmitTransaction(params: {
		accountAddress: string
		operation: Operation
		webAuthnSignature: WebAuthnSignatureData
		publicKey: Uint8Array
	}): Promise<{ transactionHash: string; status: string }> {
		try {
			// 1. Build transaction
			const sourceAccount = await this.server.getAccount(params.accountAddress)
			const transaction = new TransactionBuilder(sourceAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(params.operation)
				.setTimeout(30)
				.build()

			// 2. Simulate to get auth entries
			const simulation = await this.server.simulateTransaction(transaction)
			if (SorobanRpc.Api.isSimulationError(simulation)) {
				throw new Error(`Simulation failed: ${simulation.error}`)
			}

			const assembled = SorobanRpc.assembleTransaction(
				transaction,
				simulation,
			).build()

			// 3. Construct authorization entries with WebAuthn signature
			const authEntries: SorobanAuthorizationEntry[] = []

			if (assembled.operations[0]?.auth) {
				for (const authEntry of assembled.operations[0].auth) {
					// Create WebAuthn signature entry
					// Format: External(verifier_address, public_key_bytes) -> signature_data
					if (!this.webAuthnVerifierAddress) {
						throw new Error('WebAuthn verifier contract address not configured')
					}

					// Construct the signature map entry
					// This follows OpenZeppelin Smart Account authorization format
					const signatureMap = new Map()
					const signerKey = [
						'External',
						this.webAuthnVerifierAddress,
						Buffer.from(params.publicKey),
					]

					// XDR encode WebAuthn signature data
					const signatureData = {
						signature: params.webAuthnSignature.signature,
						authenticatorData: params.webAuthnSignature.authenticatorData,
						clientData: params.webAuthnSignature.clientData,
					}

					signatureMap.set(signerKey, signatureData)

					// Update auth entry with signature
					// Note: This is a simplified version - actual implementation
					// needs proper XDR encoding per OpenZeppelin format
					authEntries.push(authEntry)
				}
			}

			// 4. Extract function and auth XDRs
			const op = assembled.operations[0]
			if (!op || !('func' in op)) {
				throw new Error('Invalid operation format')
			}

			const func = op.func.toXDR('base64')
			const auth = authEntries.map((a) => a.toXDR('base64'))

			// 5. Submit via Channels service
			const result = await this.channelsClient.submitSorobanTransaction({
				func,
				auth,
			})

			return {
				transactionHash: result.hash,
				status: result.status,
			}
		} catch (error) {
			console.error('❌ Transaction signing/submission failed:', error)
			throw error
		}
	}

	/**
	 * Get account information
	 */
	async getAccountInfo(address: string) {
		try {
			const account = await this.server.getAccount(address)
			return {
				address,
				sequence: account.sequenceNumber(),
				balance: account.balances[0]?.balance || '0',
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('not found')) {
				return {
					address,
					sequence: '0',
					balance: '0',
					status: 'not_found' as const,
				}
			}
			throw error
		}
	}
}

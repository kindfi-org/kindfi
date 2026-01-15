import { Buffer } from 'node:buffer'
import { appEnvConfig } from '@packages/lib/config'
import { deriveSignaturePayload } from '@packages/lib/passkey'
import type { WebAuthnSignatureData } from '@packages/lib/stellar'
import { ChannelsClientService } from '@packages/lib/stellar'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	Asset,
	Contract,
	Keypair,
	nativeToScVal,
	type Operation,
	scValToNative,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

const appConfig: AppEnvInterface = appEnvConfig('web')

/**
 * Smart Wallet Transaction Service
 *
 * Handles transaction building and submission for WebAuthn-authenticated smart wallets
 * Supports:
 * - XLM transfers (native lumens)
 * - Stellar Asset transfers (USDC, EURC, etc.)
 * - Contract invocations (DeFi, NFTs, etc.)
 * - Fee sponsorship (optional)
 */
export class SmartWalletTransactionService {
	private server: Server
	private networkPassphrase: string
	private fundingKeypair?: Keypair
	private channelsClient: ChannelsClientService

	// ? WebAuthn Signatures requires a lot of GAS
	private readonly STANDARD_FEE = '5000000' // 0.41 XLM

	constructor(
		networkPassphrase?: string,
		rpcUrl?: string,
		fundingSecretKey?: string,
	) {
		this.networkPassphrase =
			networkPassphrase || appConfig.stellar.networkPassphrase
		this.server = new Server(rpcUrl || appConfig.stellar.rpcUrl)

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
		}

		// Initialize Channels client
		this.channelsClient = new ChannelsClientService(appConfig)
	}

	/**
	 * Transfer XLM (native lumens) from smart wallet to another address
	 *
	 * @param params Transfer parameters
	 * @returns Transaction hash and WebAuthn challenge for signing
	 */
	async transferXLM(params: TransferXLMParams): Promise<TransactionChallenge> {
		const { from, to, amount, sponsorFees = false } = params

		console.log('💸 Building XLM transfer transaction:', {
			from,
			to,
			amount: `${amount / 10_000_000} XLM`,
			sponsorFees,
		})

		// Build contract invocation for transfer_xlm
		const contract = new Contract(from)
		const transferOp = contract.call(
			'transfer_xlm',
			nativeToScVal(Address.fromString(to), { type: 'address' }),
			nativeToScVal(amount, { type: 'i128' }),
		)

		// Build and return transaction for signing
		return await this.buildTransaction({
			smartWalletAddress: from,
			operations: [transferOp],
			sponsorFees,
		})
	}

	/**
	 * Transfer Stellar Asset (SAC token) from smart wallet
	 *
	 * @param params Transfer parameters
	 * @returns Transaction hash and WebAuthn challenge for signing
	 */
	async transferToken(
		params: TransferTokenParams,
	): Promise<TransactionChallenge> {
		const { from, to, tokenAddress, amount, sponsorFees = false } = params

		console.log('💸 Building token transfer transaction:', {
			from,
			to,
			token: tokenAddress,
			amount,
			sponsorFees,
		})

		// Build contract invocation for transfer_token
		const contract = new Contract(from)
		const transferOp = contract.call(
			'transfer_token',
			nativeToScVal(Address.fromString(tokenAddress), { type: 'address' }),
			nativeToScVal(Address.fromString(to), { type: 'address' }),
			nativeToScVal(amount, { type: 'i128' }),
		)

		return await this.buildTransaction({
			smartWalletAddress: from,
			operations: [transferOp],
			sponsorFees,
		})
	}

	/**
	 * Invoke arbitrary contract function from smart wallet
	 * Enables DeFi interactions, NFT minting, etc.
	 *
	 * @param params Invocation parameters
	 * @returns Transaction hash and WebAuthn challenge for signing
	 */
	async invokeContract(
		params: InvokeContractParams,
	): Promise<TransactionChallenge> {
		const {
			from,
			contractAddress,
			functionName,
			args = [],
			sponsorFees = false,
		} = params

		console.log('🔧 Building contract invocation transaction:', {
			from,
			contract: contractAddress,
			function: functionName,
			sponsorFees,
		})

		// Convert arguments to ScVal format
		const scArgs = args.map((arg) => {
			if (typeof arg === 'string' && arg.startsWith('G')) {
				// Stellar address
				return nativeToScVal(Address.fromString(arg), { type: 'address' })
			}
			if (typeof arg === 'string' && arg.startsWith('C')) {
				// Contract address
				return nativeToScVal(Address.fromString(arg), { type: 'address' })
			}
			if (typeof arg === 'number' || typeof arg === 'bigint') {
				return nativeToScVal(arg, { type: 'i128' })
			}
			if (typeof arg === 'boolean') {
				return xdr.ScVal.scvBool(arg)
			}
			if (typeof arg === 'string') {
				return xdr.ScVal.scvString(arg)
			}
			// Default to bytes for complex types
			return xdr.ScVal.scvBytes(Buffer.from(JSON.stringify(arg), 'utf-8'))
		})

		// Build invoke_contract operation
		const contract = new Contract(from)
		const invokeOp = contract.call(
			'invoke_contract',
			nativeToScVal(Address.fromString(contractAddress), { type: 'address' }),
			xdr.ScVal.scvSymbol(functionName),
			xdr.ScVal.scvVec(scArgs),
		)

		return await this.buildTransaction({
			smartWalletAddress: from,
			operations: [invokeOp],
			sponsorFees,
		})
	}

	/**
	 * Get balances for a smart wallet
	 *
	 * @param smartWalletAddress Contract address of smart wallet
	 * @returns Balances for XLM and tokens
	 */
	async getBalances(smartWalletAddress: string): Promise<SmartWalletBalances> {
		console.log('📊 Fetching balances for:', smartWalletAddress)

		try {
			// Get Native XLM SAC contract address
			const nativeAsset = Asset.native()
			const xlmSacAddress = nativeAsset.contractId(this.networkPassphrase)
			const xlmSacContract = new Contract(xlmSacAddress)

			console.log('🔍 Querying XLM SAC:', xlmSacAddress)
			console.log('   For address:', smartWalletAddress)

			// Use funding account for simulation (required for read operations)
			const sourceAccount = this.fundingKeypair
				? await this.getFundingAccount()
				: new Account(smartWalletAddress, '0')

			// Query balance from Native XLM SAC
			const balanceOp = xlmSacContract.call(
				'balance',
				nativeToScVal(Address.fromString(smartWalletAddress), {
					type: 'address',
				}),
			)

			const balanceTx = new TransactionBuilder(sourceAccount, {
				fee: this.STANDARD_FEE,
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(balanceOp)
				.setTimeout(30)
				.build()

			const simulation = await this.server.simulateTransaction(balanceTx)

			let xlmBalance = '0'
			if (!Api.isSimulationError(simulation) && simulation.result?.retval) {
				// Parse i128 result from SAC using scValToNative
				const retval = simulation.result.retval
				const nativeValue = scValToNative(retval)
				xlmBalance = nativeValue.toString()
				console.log('✅ Balance retrieved:', xlmBalance, 'stroops')
			} else if (Api.isSimulationError(simulation)) {
				console.warn('⚠️ Simulation error:', simulation.error)
				// Return 0 balance if simulation fails (contract not funded yet)
			}

			return {
				xlm: xlmBalance,
				tokens: [], // TODO: Query known token balances
			}
		} catch (error) {
			console.error('❌ Error fetching balances:', error)
			// Return zero balance instead of throwing for better UX
			return {
				xlm: '0',
				tokens: [],
			}
		}
	}

	/**
	 * Submit a signed transaction using WebAuthn signature via Channels service
	 * This uses OpenZeppelin Channels for automatic fee payment and parallel processing
	 *
	 * NOTE: This method requires Smart Account Kit SDK to be properly configured.
	 * For now, use the legacy submitTransaction method or configure Smart Account Kit.
	 *
	 * @param params Transaction submission parameters with WebAuthn signature
	 * @returns Transaction hash and status
	 */
	async submitTransactionWithWebAuthn(params: {
		smartWalletAddress: string
		operation: Operation
		webAuthnSignature: WebAuthnSignatureData
		publicKey: Uint8Array
	}): Promise<{ transactionHash: string; status: string }> {
		console.log('🚀 Submitting transaction via Channels service...')
		console.warn(
			'⚠️ submitTransactionWithWebAuthn requires Smart Account Kit SDK. ' +
				'Use SmartAccountKitService.signAndSubmit() instead, or use legacy submitTransaction() method.',
		)

		// This would require Smart Account Kit SDK integration
		// For now, throw helpful error
		throw new Error(
			'WebAuthn transaction submission via Channels requires Smart Account Kit SDK. ' +
				'Install smart-account-kit and use SmartAccountKitService.signAndSubmit() instead.',
		)
	}

	/**
	 * Submit a signed transaction to the network (legacy method)
	 * For backward compatibility - consider using submitTransactionWithWebAuthn instead
	 *
	 * @param signedTransaction Fully signed and assembled transaction
	 * @returns Transaction hash
	 */
	async submitTransaction(signedTransaction: Transaction): Promise<string> {
		console.log('🚀 Submitting signed transaction...')

		const result = await this.server.sendTransaction(signedTransaction)

		if (result.status === 'ERROR') {
			throw new Error(`Transaction failed: ${JSON.stringify(result)}`)
		}

		console.log('⏳ Waiting for transaction confirmation...')
		let attempts = 0
		const maxAttempts = 120

		while (attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			attempts++

			try {
				const txResult = await this.server.getTransaction(result.hash)

				if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
					console.log('✅ Transaction successful:', result.hash)
					return result.hash
				}

				if (txResult.status === Api.GetTransactionStatus.FAILED) {
					throw new Error(`Transaction failed: ${JSON.stringify(txResult)}`)
				}
			} catch (error) {
				if (attempts === maxAttempts) {
					throw error
				}
			}
		}

		throw new Error('Transaction timeout')
	}

	/**
	 * Builds a transaction for WebAuthn signing
	 * @returns the transaction envelope and challenge hash
	 */
	private async buildTransaction(
		params: BuildTransactionParams,
	): Promise<TransactionChallenge> {
		const { smartWalletAddress, operations, sponsorFees } = params

		// Determine source account (funding account if sponsoring fees, otherwise smart wallet)
		const sourceAccount = sponsorFees
			? await this.getFundingAccount()
			: await this.getSmartWalletAccount(smartWalletAddress)
		// Build transaction
		let txBuilder = new TransactionBuilder(sourceAccount, {
			fee: this.STANDARD_FEE,
			networkPassphrase: this.networkPassphrase,
		})

		// Add operations
		for (const op of operations) {
			txBuilder = txBuilder.addOperation(op)
		}

		const transaction = txBuilder.setTimeout(300).build()

		// If sponsoring fees, sign with funding account before simulation
		if (sponsorFees && this.fundingKeypair) {
			transaction.sign(this.fundingKeypair)
		}

		console.log('🔄 Simulating transaction to extract signature_payload...')

		// Simulate to get auth entry with signature_payload
		const simulation = await this.server.simulateTransaction(transaction, {
			// TODO: Dynamic cpu calculation according to action to execute in the Soroban Contracts
			cpuInstructions: 3_500_000,
		})

		if (Api.isSimulationError(simulation)) {
			console.error('❌ Simulation error:', simulation.error)
			throw new Error(
				`Transaction simulation failed: ${simulation.error || 'Unknown error'}`,
			)
		}
		// Get current ledger to set valid signature expiration
		const latestLedger = await this.server.getLatestLedger()
		const validityWindow = 300 // ~25 minutes (300 ledgers × 5 seconds)
		const signatureExpirationLedger = latestLedger.sequence + validityWindow

		console.log('📅 Setting signature expiration:', {
			currentLedger: latestLedger.sequence,
			validityWindow,
			signatureExpirationLedger,
		})

		// CRITICAL FIX: Modify the simulation result BEFORE assembling
		// The simulation.result.auth contains the auth entries that will be used
		// We need to update the signatureExpirationLedger in the simulation BEFORE calling assembleTransaction
		if (
			!Api.isSimulationError(simulation) &&
			simulation.result?.auth &&
			simulation.result.auth.length > 0
		) {
			// Get the first auth entry from simulation
			const simAuthEntry = simulation.result.auth[0]

			console.log('🔍 PRE-MODIFICATION: Original simulation auth entry:', {
				hasAuth: true,
				credentialsType: simAuthEntry.credentials().switch().name,
			})

			// Check if it's an address credentials type
			if (
				simAuthEntry.credentials().switch() ===
				xdr.SorobanCredentialsType.sorobanCredentialsAddress()
			) {
				const addressCredentials = simAuthEntry.credentials().address()

				console.log('🔍 PRE-MODIFICATION: Simulation auth entry values:', {
					nonce: addressCredentials.nonce().toString(),
					signatureExpirationLedger: addressCredentials
						.signatureExpirationLedger()
						.toString(),
				})

				// Create NEW credentials with valid expiration
				const newCredentials = new xdr.SorobanAddressCredentials({
					address: addressCredentials.address(),
					nonce: addressCredentials.nonce(),
					signatureExpirationLedger: signatureExpirationLedger,
					signature: addressCredentials.signature(),
				})

				// Create new auth entry with updated credentials
				const newAuthEntry = new xdr.SorobanAuthorizationEntry({
					credentials:
						xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials),
					rootInvocation: simAuthEntry.rootInvocation(),
				})

				// Replace the auth entry in the simulation result
				simulation.result.auth[0] = newAuthEntry

				console.log(
					'✅ Updated simulation auth entry with signatureExpirationLedger:',
					signatureExpirationLedger,
				)

				// VERIFY: Check that modification worked
				const verifyCredentials = simulation.result.auth[0]
					.credentials()
					.address()
				console.log(
					'🔍 POST-MODIFICATION: Simulation auth entry (should match new value):',
					{
						nonce: verifyCredentials.nonce().toString(),
						signatureExpirationLedger: verifyCredentials
							.signatureExpirationLedger()
							.toString(),
						expectedExpiration: signatureExpirationLedger,
						matches:
							verifyCredentials.signatureExpirationLedger().toString() ===
							signatureExpirationLedger.toString(),
					},
				)
			}
		}

		// NOW assemble the transaction with our modified simulation
		// This will bake in the correct signatureExpirationLedger
		console.log('🔧 Calling assembleTransaction() with modified simulation...')
		const assembledTx = assembleTransaction(transaction, simulation)
			// .setSorobanData(sorobanData)
			.build()
		console.log('✅ Transaction assembled successfully', {
			assembledTx: {
				...assembledTx,
				xdr: assembledTx.toXDR(),
				signatures: assembledTx.signatures.map((s) => s.toXDR('base64')),
				signatureBase: assembledTx.signatureBase().toString('base64'),
				operations: assembledTx.operations.map((opt) => ({
					...opt,
				})),
				source: assembledTx.source,
				hash: assembledTx.hash().toString('base64'),
				sequence: assembledTx.sequence,
				fee: assembledTx.fee,
				ledgerBounds: assembledTx.ledgerBounds,
				memo: assembledTx.memo.toXDRObject().toXDR('base64'),
			},
		})

		// IMPORTANT: Extract signature_payload from the SIMULATION transaction
		// The assembly process will have the definitive auth entry values, so we must use the values linked to the transaction (simulation)
		const signaturePayloadResult = deriveSignaturePayload({
			transactionResult:
				simulation?.result as unknown as DeriveSignaturePayloadParams['transactionResult'],
			networkPassphrase: this.networkPassphrase,
		})

		if (!signaturePayloadResult) {
			// Fallback to transaction hash if we can't extract signature_payload
			console.warn(
				'⚠️  Could not extract signature_payload, falling back to tx hash',
			)
			throw new Error('⚠️  Could not extract signature_payload')
		}

		// Use signature_payload as the WebAuthn challenge
		const challenge = Buffer.from(
			signaturePayloadResult.payloadHex,
			'hex',
		).toString('base64url')
		const txHash = assembledTx.hash()

		console.log('✅ Transaction prepared for signing')
		console.log(
			'🔑 Signature Payload (hex):',
			signaturePayloadResult.payloadHex,
		)
		console.log('   nonce:', signaturePayloadResult.nonce)
		console.log(
			'   signatureExpirationLedger:',
			signaturePayloadResult.signatureExpirationLedger,
		)
		console.log('📋 Transaction hash:', txHash.toString('hex'))

		// DIAGNOSTIC: Verify XDR encoding contains correct values
		const transactionXDR = assembledTx.toXDR()
		console.log('🔍 XDR CHECK: Verifying XDR encoding...')
		try {
			const xdrCheck = TransactionBuilder.fromXDR(
				transactionXDR,
				this.networkPassphrase,
			) as Transaction
			const checkOp = xdrCheck
				.operations[0] as unknown as Api.SimulateHostFunctionResult
			const checkAuthEntries = checkOp?.auth || []
			if (checkAuthEntries.length > 0) {
				const checkAuthEntry = checkAuthEntries[0]
				if (
					checkAuthEntry.credentials().switch() ===
					xdr.SorobanCredentialsType.sorobanCredentialsAddress()
				) {
					const checkCredentials = checkAuthEntry.credentials().address()
					console.log('🔍 XDR CHECK: Decoded values from returned XDR:', {
						nonce: checkCredentials.nonce().toString(),
						signatureExpirationLedger: checkCredentials
							.signatureExpirationLedger()
							.toString(),
						expectedExpiration: signatureExpirationLedger,
						matches:
							checkCredentials.signatureExpirationLedger().toString() ===
							signatureExpirationLedger.toString(),
					})

					if (
						checkCredentials.signatureExpirationLedger().toString() !==
						signatureExpirationLedger.toString()
					) {
						console.error(
							'❌ CRITICAL: XDR bytes do NOT contain correct expiration!',
						)
					}
				}
			}
		} catch (error) {
			console.error('❌ Error verifying XDR:', error)
		}

		return {
			transactionXDR,
			challenge,
			hash: txHash.toString('hex'),
		}
	}

	/**
	 * Get funding account for fee sponsorship
	 */
	private async getFundingAccount(): Promise<Account> {
		if (!this.fundingKeypair) {
			throw new Error('Funding keypair required for fee sponsorship')
		}

		const accountResponse = await this.server.getAccount(
			this.fundingKeypair.publicKey(),
		)

		return new Account(
			accountResponse.accountId(),
			accountResponse.sequenceNumber(),
		)
	}

	/**
	 * Get smart wallet account (for self-paying transactions)
	 */
	private async getSmartWalletAccount(address: string): Promise<Account> {
		// Smart wallets use sequence number 0 for contract invocations
		return new Account(address, '0')
	}
}

// ===== TYPES =====

export interface TransferXLMParams {
	/** Smart wallet contract address (sender) */
	from: string
	/** Recipient address (G or C address) */
	to: string
	/** Amount in stroops (1 XLM = 10,000,000 stroops) */
	amount: number
	/** Whether funding account should pay fees (default: false) */
	sponsorFees?: boolean
}

export interface TransferTokenParams {
	/** Smart wallet contract address (sender) */
	from: string
	/** Recipient address (G or C address) */
	to: string
	/** Token contract address (SAC-wrapped asset) */
	tokenAddress: string
	/** Amount in token's smallest unit */
	amount: number
	/** Whether funding account should pay fees (default: false) */
	sponsorFees?: boolean
}

export interface InvokeContractParams {
	/** Smart wallet contract address (caller) */
	from: string
	/** Target contract address */
	contractAddress: string
	/** Function name to invoke */
	functionName: string
	/** Function arguments */
	args?: unknown[]
	/** Whether funding account should pay fees (default: false) */
	sponsorFees?: boolean
}

export interface TransactionChallenge {
	/** Transaction envelope in XDR format */
	transactionXDR: string
	/** Base64URL-encoded challenge hash for WebAuthn */
	challenge: string
	/** Transaction hash (hex) */
	hash: string
}

export interface SmartWalletBalances {
	/** XLM balance in stroops */
	xlm: string
	/** Token balances */
	tokens: Array<{
		address: string
		balance: string
		symbol?: string
		decimals?: number
	}>
}

interface BuildTransactionParams {
	smartWalletAddress: string
	operations: xdr.Operation[]
	sponsorFees: boolean
}

type DeriveSignaturePayloadParams = Parameters<typeof deriveSignaturePayload>[0]

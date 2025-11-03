import { Buffer } from 'node:buffer'
import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	Contract,
	Keypair,
	nativeToScVal,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

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

	private readonly STANDARD_FEE = '100000' // 0.01 XLM

	constructor(
		networkPassphrase?: string,
		rpcUrl?: string,
		fundingSecretKey?: string,
	) {
		const config: AppEnvInterface = appEnvConfig('web')

		this.networkPassphrase =
			networkPassphrase || config.stellar.networkPassphrase
		this.server = new Server(rpcUrl || config.stellar.rpcUrl)

		if (fundingSecretKey) {
			this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
		}
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
			const contract = new Contract(smartWalletAddress)

			// Get XLM balance
			const xlmBalanceOp = contract.call('get_xlm_balance')
			const xlmTx = new TransactionBuilder(
				new Account(smartWalletAddress, '0'),
				{
					fee: this.STANDARD_FEE,
					networkPassphrase: this.networkPassphrase,
				},
			)
				.addOperation(xlmBalanceOp)
				.setTimeout(30)
				.build()

			const xlmSimulation = await this.server.simulateTransaction(xlmTx)

			let xlmBalance = '0'
			if (
				!Api.isSimulationError(xlmSimulation) &&
				xlmSimulation.result?.retval
			) {
				// Parse i128 result
				const retval = xlmSimulation.result.retval
				xlmBalance = retval.toString()
			}

			return {
				xlm: xlmBalance,
				tokens: [], // TODO: Query known token balances
			}
		} catch (error) {
			console.error('❌ Error fetching balances:', error)
			throw error
		}
	}

	/**
	 * Submit a signed transaction to the network
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
	 * Returns the transaction envelope and challenge hash
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

		// Simulate to get auth requirements
		console.log('🔄 Simulating transaction...')
		const simulation = await this.server.simulateTransaction(transaction)

		if (Api.isSimulationError(simulation)) {
			throw new Error(`Simulation failed: ${JSON.stringify(simulation)}`)
		}

		// Assemble with auth entries
		const assembledTx = assembleTransaction(transaction, simulation).build()

		// Generate challenge hash for WebAuthn
		const txHash = assembledTx.hash()
		const challenge = txHash.toString('base64url')

		console.log('✅ Transaction built successfully')
		console.log('🔑 WebAuthn challenge:', challenge)

		return {
			transactionXDR: assembledTx.toXDR(),
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

import { appEnvConfig } from '@packages/lib/config'
import { ChannelsClientService } from '@packages/lib/stellar'
import type { WebAuthnSignatureData } from '@packages/lib/stellar/types'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Address,
	Asset,
	Contract,
	nativeToScVal,
	type Operation,
	scValToNative,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'

const appConfig: AppEnvInterface = appEnvConfig('web')

/**
 * Smart Wallet Transaction Service V2
 *
 * Updated to use OpenZeppelin Smart Accounts and Channels service
 * Handles transaction building and submission for WebAuthn-authenticated smart wallets
 * Supports:
 * - XLM transfers (native lumens)
 * - Stellar Asset transfers (USDC, EURC, etc.)
 * - Contract invocations (DeFi, NFTs, etc.)
 * - Automatic fee payment via Channels service
 */
export class SmartWalletTransactionServiceV2 {
	private server: Server
	private networkPassphrase: string
	private channelsClient: ChannelsClientService

	constructor(networkPassphrase?: string, rpcUrl?: string) {
		this.networkPassphrase =
			networkPassphrase || appConfig.stellar.networkPassphrase
		this.server = new Server(rpcUrl || appConfig.stellar.rpcUrl)

		// Initialize Channels client
		this.channelsClient = new ChannelsClientService(appConfig)
	}

	/**
	 * Transfer XLM (native lumens) from smart wallet to another address
	 * Uses OpenZeppelin Smart Account and Channels service
	 *
	 * @param params Transfer parameters
	 * @returns Transaction challenge for WebAuthn signing
	 */
	async transferXLM(
		params: TransferXLMParamsV2,
	): Promise<TransactionChallengeV2> {
		const { from, to, amount } = params

		console.log('💸 Building XLM transfer transaction:', {
			from,
			to,
			amount: `${amount / 10_000_000} XLM`,
		})

		// Build contract invocation for transfer_xlm
		const contract = new Contract(from)
		const transferOp = contract.call(
			'transfer_xlm',
			nativeToScVal(Address.fromString(to), { type: 'address' }),
			nativeToScVal(amount, { type: 'i128' }),
		)

		return await this.buildTransactionForSigning({
			smartWalletAddress: from,
			operation: transferOp,
		})
	}

	/**
	 * Transfer Stellar Asset (SAC token) from smart wallet
	 * Uses OpenZeppelin Smart Account and Channels service
	 *
	 * @param params Transfer parameters
	 * @returns Transaction challenge for WebAuthn signing
	 */
	async transferToken(
		params: TransferTokenParamsV2,
	): Promise<TransactionChallengeV2> {
		const { from, to, tokenAddress, amount } = params

		console.log('💸 Building token transfer transaction:', {
			from,
			to,
			token: tokenAddress,
			amount,
		})

		// Build contract invocation for transfer_token
		const contract = new Contract(from)
		const transferOp = contract.call(
			'transfer_token',
			nativeToScVal(Address.fromString(tokenAddress), { type: 'address' }),
			nativeToScVal(Address.fromString(to), { type: 'address' }),
			nativeToScVal(amount, { type: 'i128' }),
		)

		return await this.buildTransactionForSigning({
			smartWalletAddress: from,
			operation: transferOp,
		})
	}

	/**
	 * Invoke arbitrary contract function from smart wallet
	 * Enables DeFi interactions, NFT minting, etc.
	 * Uses OpenZeppelin Smart Account and Channels service
	 *
	 * @param params Invocation parameters
	 * @returns Transaction challenge for WebAuthn signing
	 */
	async invokeContract(
		params: InvokeContractParamsV2,
	): Promise<TransactionChallengeV2> {
		const { from, contractAddress, functionName, args = [] } = params

		console.log('🔧 Building contract invocation transaction:', {
			from,
			contract: contractAddress,
			function: functionName,
		})

		// Convert arguments to ScVal format
		const scArgs = args.map((arg) => {
			if (
				typeof arg === 'string' &&
				(arg.startsWith('G') || arg.startsWith('C'))
			) {
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

		return await this.buildTransactionForSigning({
			smartWalletAddress: from,
			operation: invokeOp,
		})
	}

	/**
	 * Submit transaction with WebAuthn signature via Channels service
	 *
	 * NOTE: This method requires Smart Account Kit SDK to be properly configured.
	 * Use SmartAccountKitService.signAndSubmit() instead.
	 *
	 * @param params Transaction submission parameters
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
				'Use SmartAccountKitService.signAndSubmit() instead.',
		)

		// This would require Smart Account Kit SDK integration
		throw new Error(
			'WebAuthn transaction submission via Channels requires Smart Account Kit SDK. ' +
				'Install smart-account-kit and use SmartAccountKitService.signAndSubmit() instead.',
		)
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

			// Query balance from Native XLM SAC
			const balanceOp = xlmSacContract.call(
				'balance',
				nativeToScVal(Address.fromString(smartWalletAddress), {
					type: 'address',
				}),
			)

			// Use a dummy account for simulation
			const dummyAccount = new Account(smartWalletAddress, '0')
			const balanceTx = new TransactionBuilder(dummyAccount, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(balanceOp)
				.setTimeout(30)
				.build()

			const simulation = await this.server.simulateTransaction(balanceTx)

			let xlmBalance = '0'
			if (!Api.isSimulationError(simulation) && simulation.result?.retval) {
				const retval = simulation.result.retval
				const nativeValue = scValToNative(retval)
				xlmBalance = nativeValue.toString()
				console.log('✅ Balance retrieved:', xlmBalance, 'stroops')
			}

			return {
				xlm: xlmBalance,
				tokens: [], // TODO: Query known token balances
			}
		} catch (error) {
			console.error('❌ Error fetching balances:', error)
			return {
				xlm: '0',
				tokens: [],
			}
		}
	}

	/**
	 * Builds a transaction for WebAuthn signing
	 * Returns the operation and necessary data for signature construction
	 */
	private async buildTransactionForSigning(
		params: BuildTransactionParamsV2,
	): Promise<TransactionChallengeV2> {
		const { smartWalletAddress, operation } = params

		console.log('🔧 Building transaction for Smart Account signing...')

		// Simulate transaction to get auth requirements
		const dummyAccount = new Account(smartWalletAddress, '0')
		const transaction = new TransactionBuilder(dummyAccount, {
			fee: '100',
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(operation)
			.setTimeout(30)
			.build()

		const simulation = await this.server.simulateTransaction(transaction, {
			cpuInstructions: 3_500_000,
		})

		if (Api.isSimulationError(simulation)) {
			console.error('❌ Simulation error:', simulation.error)
			throw new Error(
				`Transaction simulation failed: ${simulation.error || 'Unknown error'}`,
			)
		}

		// Get current ledger for signature expiration
		const latestLedger = await this.server.getLatestLedger()
		const validityWindow = 300 // ~25 minutes
		const signatureExpirationLedger = latestLedger.sequence + validityWindow

		// Extract signature payload from simulation
		// This will be used as the WebAuthn challenge
		const authEntry = simulation.result?.auth?.[0]
		if (!authEntry) {
			throw new Error('No authorization entry found in simulation')
		}

		// Extract nonce and other auth data
		const addressCredentials = authEntry.credentials().address()
		const nonce = addressCredentials.nonce()
		const rootInvocation = authEntry.rootInvocation()

		// Construct signature payload hash (this becomes the WebAuthn challenge)
		// Format: SHA256(network_id || nonce || signature_expiration_ledger || invocation)
		const networkId = Buffer.from(this.networkPassphrase, 'utf-8').toString(
			'hex',
		)

		console.log('✅ Transaction prepared for signing')
		console.log('   Nonce:', nonce.toString())
		console.log('   Signature expiration ledger:', signatureExpirationLedger)

		return {
			operation,
			nonce: nonce.toString(),
			signatureExpirationLedger,
			rootInvocation: rootInvocation.toXDR('base64'),
			networkPassphrase: this.networkPassphrase,
		}
	}
}

// ===== TYPES =====

export interface TransferXLMParamsV2 {
	/** Smart wallet contract address (sender) */
	from: string
	/** Recipient address (G or C address) */
	to: string
	/** Amount in stroops (1 XLM = 10,000,000 stroops) */
	amount: number
}

export interface TransferTokenParamsV2 {
	/** Smart wallet contract address (sender) */
	from: string
	/** Recipient address (G or C address) */
	to: string
	/** Token contract address (SAC-wrapped asset) */
	tokenAddress: string
	/** Amount in token's smallest unit */
	amount: number
}

export interface InvokeContractParamsV2 {
	/** Smart wallet contract address (caller) */
	from: string
	/** Target contract address */
	contractAddress: string
	/** Function name to invoke */
	functionName: string
	/** Function arguments */
	args?: unknown[]
}

export interface TransactionChallengeV2 {
	/** Operation to execute */
	operation: Operation
	/** Nonce for signature */
	nonce: string
	/** Ledger sequence when signature expires */
	signatureExpirationLedger: number
	/** Root invocation XDR */
	rootInvocation: string
	/** Network passphrase */
	networkPassphrase: string
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

interface BuildTransactionParamsV2 {
	smartWalletAddress: string
	operation: Operation
}

// Import Account and TransactionBuilder for balance queries
import { Account, TransactionBuilder } from '@stellar/stellar-sdk'
import { Api } from '@stellar/stellar-sdk/rpc'

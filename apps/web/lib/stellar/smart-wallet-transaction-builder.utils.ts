import { Buffer } from 'node:buffer'
import { deriveSignaturePayload } from '@packages/lib/passkey'
import {
	Account,
	type Keypair,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, type Server } from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'

/** Runtime dependencies supplied by SmartWalletTransactionService. */
export interface SmartWalletTxContext {
	server: Server
	networkPassphrase: string
	fundingKeypair?: Keypair
	fee: string
}

export interface BuildTransactionParams {
	smartWalletAddress: string
	operations: xdr.Operation[]
	sponsorFees: boolean
}

export interface TransactionChallenge {
	/** Transaction envelope in XDR format */
	transactionXDR: string
	/** Base64URL-encoded challenge hash for WebAuthn */
	challenge: string
	/** Transaction hash (hex) */
	hash: string
}

type DeriveSignaturePayloadParams = Parameters<typeof deriveSignaturePayload>[0]

/** Get funding account for fee sponsorship. */
export async function getFundingAccount(ctx: SmartWalletTxContext): Promise<Account> {
	if (!ctx.fundingKeypair) {
		throw new Error('Funding keypair required for fee sponsorship')
	}
	const accountResponse = await ctx.server.getAccount(ctx.fundingKeypair.publicKey())
	return new Account(accountResponse.accountId(), accountResponse.sequenceNumber())
}

/** Get smart wallet account (for self-paying transactions). */
export function getSmartWalletAccount(address: string): Account {
	// Smart wallets use sequence number 0 for contract invocations
	return new Account(address, '0')
}

/** Simulate a transaction (read-only ops like NFT balance/metadata queries). */
export function simulateTransaction(server: Server, transaction: Transaction) {
	return server.simulateTransaction(transaction)
}

/**
 * Builds a transaction for WebAuthn signing.
 * @returns the transaction envelope and challenge hash
 */
export async function buildTransaction(
	ctx: SmartWalletTxContext,
	params: BuildTransactionParams,
): Promise<TransactionChallenge> {
	const { smartWalletAddress, operations, sponsorFees } = params

	const sourceAccount = sponsorFees
		? await getFundingAccount(ctx)
		: getSmartWalletAccount(smartWalletAddress)

	let txBuilder = new TransactionBuilder(sourceAccount, {
		fee: ctx.fee,
		networkPassphrase: ctx.networkPassphrase,
	})

	for (const op of operations) {
		txBuilder = txBuilder.addOperation(op)
	}

	const transaction = txBuilder.setTimeout(300).build()

	if (sponsorFees && ctx.fundingKeypair) {
		transaction.sign(ctx.fundingKeypair)
	}

	const simulation = await ctx.server.simulateTransaction(transaction, {
		cpuInstructions: 3_500_000,
	})

	if (Api.isSimulationError(simulation)) {
		logger.error('❌ Simulation error:', simulation.error)
		throw new Error(`Transaction simulation failed: ${simulation.error || 'Unknown error'}`)
	}

	const latestLedger = await ctx.server.getLatestLedger()
	const validityWindow = 300 // ~25 minutes (300 ledgers × 5 seconds)
	const signatureExpirationLedger = latestLedger.sequence + validityWindow

	if (
		!Api.isSimulationError(simulation) &&
		simulation.result?.auth &&
		simulation.result.auth.length > 0
	) {
		const simAuthEntry = simulation.result.auth[0]

		if (
			simAuthEntry.credentials().switch() === xdr.SorobanCredentialsType.sorobanCredentialsAddress()
		) {
			const addressCredentials = simAuthEntry.credentials().address()

			const newCredentials = new xdr.SorobanAddressCredentials({
				address: addressCredentials.address(),
				nonce: addressCredentials.nonce(),
				signatureExpirationLedger: signatureExpirationLedger,
				signature: addressCredentials.signature(),
			})

			const newAuthEntry = new xdr.SorobanAuthorizationEntry({
				credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials),
				rootInvocation: simAuthEntry.rootInvocation(),
			})

			simulation.result.auth[0] = newAuthEntry

			const _verifyCredentials = simulation.result.auth[0].credentials().address()
		}
	}

	const assembledTx = assembleTransaction(transaction, simulation).build()

	const signaturePayloadResult = deriveSignaturePayload({
		transactionResult:
			simulation?.result as unknown as DeriveSignaturePayloadParams['transactionResult'],
		networkPassphrase: ctx.networkPassphrase,
	})

	if (!signaturePayloadResult) {
		logger.warn('⚠️  Could not extract signature_payload, falling back to tx hash')
		throw new Error('⚠️  Could not extract signature_payload')
	}

	const challenge = Buffer.from(signaturePayloadResult.payloadHex, 'hex').toString('base64url')
	const txHash = assembledTx.hash()

	const transactionXDR = assembledTx.toXDR()
	try {
		const xdrCheck = TransactionBuilder.fromXDR(
			transactionXDR,
			ctx.networkPassphrase,
		) as Transaction
		const checkOp = xdrCheck.operations[0] as unknown as Api.SimulateHostFunctionResult
		const checkAuthEntries = checkOp?.auth || []
		if (checkAuthEntries.length > 0) {
			const checkAuthEntry = checkAuthEntries[0]
			if (
				checkAuthEntry.credentials().switch() ===
				xdr.SorobanCredentialsType.sorobanCredentialsAddress()
			) {
				const checkCredentials = checkAuthEntry.credentials().address()
				if (
					checkCredentials.signatureExpirationLedger().toString() !==
					signatureExpirationLedger.toString()
				) {
					logger.error('❌ CRITICAL: XDR bytes do NOT contain correct expiration!')
				}
			}
		}
	} catch (error) {
		logger.error('❌ Error verifying XDR:', error)
	}

	return {
		transactionXDR,
		challenge,
		hash: txHash.toString('hex'),
	}
}

import { Buffer } from 'node:buffer'
import {
	Account,
	type Keypair,
	Operation,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, type Server } from '@stellar/stellar-sdk/rpc'

/**
 * Runtime dependencies a passkey transaction needs, supplied by the caller
 * (the StellarPasskeyService) instead of being read from instance state.
 */
export interface PasskeyTxContext {
	server: Server
	fundingKeypair: Keypair
	networkPassphrase: string
	fee: string
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

/**
 * Converts JS arguments to Soroban ScVal format.
 * Strings, numbers and booleans map to their native ScVal; everything else
 * is JSON-encoded into bytes.
 */
export function argsToScVals(args: unknown[]): xdr.ScVal[] {
	return args.map((arg: unknown) => {
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
}

/**
 * Submits a built transaction with simulation, authorization assembly, signing,
 * and confirmation polling via Soroban RPC.
 */
export async function submitTransaction(
	ctx: PasskeyTxContext,
	builtTransaction: Transaction,
): Promise<string> {
	if (!ctx.fundingKeypair) {
		throw new Error('Funding keypair required for transaction submission')
	}
	const { server, fundingKeypair } = ctx

	// Simulate transaction to get authorization requirements
	const simulation = await server.simulateTransaction(builtTransaction)

	if (Api.isSimulationError(simulation)) {
		throw new Error(`Simulation failed: ${simulation.error || 'unknown error'}`)
	}

	if (Api.isSimulationRestore(simulation)) {
		throw new Error('Transaction requires restore operation')
	}

	// Assemble transaction with authorization entries from simulation
	const assembledTransaction = assembleTransaction(builtTransaction, simulation).build()

	// Sign the transaction with our funding account
	// The assembleTransaction function handles authorization entries automatically
	assembledTransaction.sign(fundingKeypair)

	// Submit transaction to Soroban RPC (NOT Horizon)
	// Soroban transactions with authorization entries must use sendTransaction
	const sendResult = await server.sendTransaction(assembledTransaction)

	if (sendResult.status === 'ERROR') {
		throw new Error('Transaction submission failed')
	}

	if (sendResult.status === 'PENDING') {
		// Wait for transaction to be included in a ledger
		let attempts = 0
		const maxAttempts = 120 // 2 minutes for complex auth transactions

		while (attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 10000))
			attempts++

			try {
				const txResult = await server.getTransaction(sendResult.hash)

				if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
					return sendResult.hash
				}

				if (txResult.status === Api.GetTransactionStatus.FAILED) {
					throw new Error('Transaction failed')
				}

				if (txResult.status === Api.GetTransactionStatus.NOT_FOUND) {
				}

				// Still pending, continue waiting
			} catch (_error) {}
		}

		throw new Error('Transaction timed out waiting for confirmation')
	}

	return sendResult.hash
}

/**
 * Executes add device operation on the passkey contract
 */
export async function executeAddDevice(
	ctx: PasskeyTxContext,
	address: string,
	operationData: AddDeviceOperation,
): Promise<string> {
	if (!ctx.fundingKeypair) {
		throw new Error('Funding keypair required for add device operation')
	}
	const { server, fundingKeypair, networkPassphrase, fee } = ctx
	const { deviceId, publicKey, isAdmin = false } = operationData

	// Get funding account
	const fundingAccount = await server
		.getAccount(fundingKeypair.publicKey())
		.then((res) => new Account(res.accountId(), res.sequenceNumber()))

	// Build transaction for adding device
	const transaction = new TransactionBuilder(fundingAccount, {
		fee,
		networkPassphrase,
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

	return await submitTransaction(ctx, transaction)
}

/**
 * Executes remove device operation on the passkey contract
 */
export async function executeRemoveDevice(
	ctx: PasskeyTxContext,
	address: string,
	operationData: RemoveDeviceOperation,
): Promise<string> {
	if (!ctx.fundingKeypair) {
		throw new Error('Funding keypair required for remove device operation')
	}
	const { server, fundingKeypair, networkPassphrase, fee } = ctx
	const { deviceId } = operationData

	// Get funding account
	const fundingAccount = await server
		.getAccount(fundingKeypair.publicKey())
		.then((res) => new Account(res.accountId(), res.sequenceNumber()))

	// Build transaction for removing device
	const transaction = new TransactionBuilder(fundingAccount, {
		fee,
		networkPassphrase,
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

	return await submitTransaction(ctx, transaction)
}

/**
 * Executes general contract invocation
 */
export async function executeContractInvocation(
	ctx: PasskeyTxContext,
	contractId: string,
	operationData: ContractInvocationOperation,
): Promise<string> {
	if (!ctx.fundingKeypair) {
		throw new Error('Funding keypair required for contract invocation')
	}
	const { server, fundingKeypair, networkPassphrase, fee } = ctx
	const { contractAddress, functionName, args = [] } = operationData

	// Get funding account
	const fundingAccount = await server
		.getAccount(fundingKeypair.publicKey())
		.then((res) => new Account(res.accountId(), res.sequenceNumber()))

	// Convert arguments to ScVal format
	const scArgs = argsToScVals(args)

	// Build transaction for contract invocation
	const transaction = new TransactionBuilder(fundingAccount, {
		fee,
		networkPassphrase,
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

	return await submitTransaction(ctx, transaction)
}

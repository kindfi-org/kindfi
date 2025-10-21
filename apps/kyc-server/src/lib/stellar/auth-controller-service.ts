/**
 * Auth Controller Integration
 * Manages on-chain account authorization tracking
 */

import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Address,
	Contract,
	Keypair,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

const appConfig: AppEnvInterface = appEnvConfig('kyc-server')

const server = new Server(appConfig.stellar.rpcUrl)

/**
 * Register account with auth-controller smart contract
 * This tracks authorized accounts on-chain for KYC compliance
 *
 * @param contractId - Smart wallet contract ID (C... address)
 * @param contexts - Array of context addresses (e.g., user's auth context)
 * @returns Transaction hash
 */
export async function registerAccountOnChain(
	contractId: string,
	contexts: string[],
): Promise<{ transactionHash: string }> {
	const fundingSecret = appConfig.stellar.fundingAccount
	if (!fundingSecret) {
		throw new Error('Funding account not configured')
	}

	try {
		const controllerAddress = appConfig.stellar.controllerContractId
		const fundingKeypair = Keypair.fromSecret(fundingSecret)

		console.log('📝 Registering account on-chain:', {
			contractId,
			controllerAddress,
			contexts,
		})

		const fundingAccount = await server.getAccount(fundingKeypair.publicKey())

		// Create contract instance
		const contract = new Contract(controllerAddress)

		// Build add_account operation
		const operation = contract.call(
			'add_account',
			Address.fromString(contractId).toScVal(),
			xdr.ScVal.scvVec(
				contexts.map((ctx) => Address.fromString(ctx).toScVal()),
			),
		)

		// Build transaction
		const transaction = new TransactionBuilder(fundingAccount, {
			fee: '100000',
			networkPassphrase: appConfig.stellar.networkPassphrase,
		})
			.addOperation(operation)
			.setTimeout(60)
			.build()

		console.log('🔄 Simulating add_account transaction...')
		const simulation = await server.simulateTransaction(transaction)

		if (Api.isSimulationError(simulation)) {
			console.error('❌ Simulation failed:', simulation)
			throw new Error(`Simulation failed: ${JSON.stringify(simulation)}`)
		}

		console.log('✅ Simulation successful, assembling transaction...')
		const assembledTx = assembleTransaction(transaction, simulation).build()
		assembledTx.sign(fundingKeypair)

		console.log('🚀 Submitting add_account transaction...')
		const result = await server.sendTransaction(assembledTx)

		if (result.status === 'ERROR') {
			throw new Error(
				`Add account failed: ${JSON.stringify(result.errorResult)}`,
			)
		}

		console.log('⏳ Waiting for transaction confirmation...')
		let attempts = 0
		const maxAttempts = 60

		while (attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			attempts++

			try {
				const txResult = await server.getTransaction(result.hash)

				if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
					console.log('✅ Account added to auth-controller!')
					return { transactionHash: result.hash }
				}

				if (txResult.status === Api.GetTransactionStatus.FAILED) {
					throw new Error(`Add account failed: ${JSON.stringify(txResult)}`)
				}
			} catch (error) {
				if (attempts === maxAttempts) {
					throw error
				}
			}
		}

		throw new Error('Add account timeout')
	} catch (error) {
		console.error('Failed to register account on-chain:', error)
		throw error
	}
}

/**
 * Check if account is registered in auth-controller (KYC approved)
 * Queries the on-chain auth-controller to verify account authorization
 */
export async function isAccountRegistered(
	contractAddress: string,
): Promise<boolean> {
	try {
		const controllerAddress = appConfig.stellar.controllerContractId

		console.log('🔍 Checking account registration on-chain:', {
			contractAddress,
			controllerAddress,
		})

		// Create contract instance
		const contract = new Contract(controllerAddress)

		// Build is_authenticated_user query (read-only)
		const operation = contract.call(
			'is_authenticated_user',
			Address.fromString(contractAddress).toScVal(),
		)

		// Use funding account for read-only simulation
		const fundingSecret = appConfig.stellar.fundingAccount
		if (!fundingSecret) {
			throw new Error('Funding account not configured')
		}

		const fundingKeypair = Keypair.fromSecret(fundingSecret)
		const account = await server.getAccount(fundingKeypair.publicKey())

		const transaction = new TransactionBuilder(account, {
			fee: '100000',
			networkPassphrase: appConfig.stellar.networkPassphrase,
		})
			.addOperation(operation)
			.setTimeout(60)
			.build()

		console.log('🔄 Simulating is_authenticated_user query...')
		const simulation = await server.simulateTransaction(transaction)

		if (Api.isSimulationError(simulation)) {
			console.warn('⚠️ Account not registered or query failed:', simulation)
			return false
		}

		// Parse the boolean result from ScVal
		if (simulation.result?.retval) {
			// The retval is ScVal of type Bool
			const scVal = simulation.result.retval
			const isRegistered = scVal.switch().name === 'scvBool' && scVal.b()

			console.log(
				isRegistered
					? '✅ Account is registered and KYC approved'
					: '❌ Account not registered or not KYC approved',
			)
			return isRegistered
		}

		return false
	} catch (error) {
		console.error('Failed to check account registration:', error)
		return false
	}
}

export { server }

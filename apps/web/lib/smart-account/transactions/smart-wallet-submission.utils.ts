import type { WebAuthnSignatureData } from '@packages/lib/stellar'
import type { Operation, Transaction } from '@stellar/stellar-sdk'
import { Api, type Server } from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'

export interface SubmitWithWebAuthnParams {
	smartWalletAddress: string
	operation: Operation
	webAuthnSignature: WebAuthnSignatureData
	publicKey: Uint8Array
}

/**
 * Submit a signed transaction using WebAuthn signature via Channels service.
 * NOTE: requires Smart Account Kit SDK — currently throws a guiding error.
 */
export async function submitTransactionWithWebAuthn(
	_params: SubmitWithWebAuthnParams,
): Promise<{ transactionHash: string; status: string }> {
	logger.warn(
		'⚠️ submitTransactionWithWebAuthn requires Smart Account Kit SDK. ' +
			'Use SmartAccountKitService.signAndSubmit() instead, or use legacy submitTransaction() method.',
	)

	throw new Error(
		'WebAuthn transaction submission via Channels requires Smart Account Kit SDK. ' +
			'Install smart-account-kit and use SmartAccountKitService.signAndSubmit() instead.',
	)
}

/**
 * Submit a signed transaction to the network (legacy method).
 * @returns Transaction hash
 */
export async function submitTransaction(
	server: Server,
	signedTransaction: Transaction,
): Promise<string> {
	const result = await server.sendTransaction(signedTransaction)

	if (result.status === 'ERROR') {
		throw new Error(`Transaction failed: ${JSON.stringify(result)}`)
	}

	let attempts = 0
	const maxAttempts = 120

	while (attempts < maxAttempts) {
		await new Promise((resolve) => setTimeout(resolve, 1000))
		attempts++

		try {
			const txResult = await server.getTransaction(result.hash)

			if (txResult.status === Api.GetTransactionStatus.SUCCESS) {
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

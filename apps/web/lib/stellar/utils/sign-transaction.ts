// todo: sign transaction function
import { Keypair, Transaction } from '@stellar/stellar-sdk'
import type { SignTransactionResponse } from '~/lib/types/escrow/escrow-response.types'

export function signTransaction(
	unsignedXDR: string,
	networkPassPhrase: string,
	signer: string
): SignTransactionResponse {
	try {
		const keypair = Keypair.fromSecret(signer)
		const transaction = new Transaction(unsignedXDR, networkPassPhrase)
		transaction.sign(keypair)
		const signedXDR = transaction.toXDR()
		return signedXDR
	} catch (error) {
		console.error('Error sending transaction:', error)
		throw error
	}
}

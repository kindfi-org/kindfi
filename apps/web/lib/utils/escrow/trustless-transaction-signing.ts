import { Keypair, type Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

export const TX_BAD_AUTH_MESSAGE =
	'Transaction authorization failed. Connect the escrow platform wallet (G-address) on the same Stellar network the app is using, approve the wallet signature prompt, and try again.'

/** Build a network-aware auth failure message for local submit / signing checks. */
export const getTxBadAuthMessage = (networkId?: 'mainnet' | 'testnet'): string => {
	if (networkId === 'mainnet') {
		return 'Transaction authorization failed. Connect the escrow platform wallet (G-address) on Public/Mainnet in Freighter, approve the signature prompt, and try again.'
	}

	if (networkId === 'testnet') {
		return 'Transaction authorization failed. This app is on Testnet, but the signature was rejected. Switch Freighter to Test Network (not Public/Mainnet), reconnect the platform G-address, and try again.'
	}

	return TX_BAD_AUTH_MESSAGE
}

type SignableTransactionEnvelope = {
	source: string
	hash: () => Buffer
	signatures: Transaction['signatures']
}

const resolveSignableTransactionEnvelope = (
	signedXdr: string,
	networkPassphrase: string,
): SignableTransactionEnvelope => {
	const envelope = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)

	if ('innerTransaction' in envelope) {
		return {
			source: envelope.innerTransaction.source,
			hash: () => envelope.hash(),
			signatures: envelope.signatures,
		}
	}

	return {
		source: envelope.source,
		hash: () => envelope.hash(),
		signatures: envelope.signatures,
	}
}

export const assertTrustlessSignerMatches = (
	connectedAddress: string,
	requiredSigner: string,
	roleLabel = 'platform',
): void => {
	if (connectedAddress !== requiredSigner) {
		throw new Error(
			`Connected wallet (${connectedAddress}) does not match the escrow ${roleLabel} address (${requiredSigner}).`,
		)
	}
}

export const assertSignedTrustlessTransaction = (
	signedXdr: string,
	expectedSource: string,
	networkPassphrase: string,
): void => {
	const transaction = resolveSignableTransactionEnvelope(signedXdr, networkPassphrase)

	if (transaction.source !== expectedSource) {
		throw new Error(
			`Signed transaction source (${transaction.source}) does not match required signer (${expectedSource}).`,
		)
	}

	if (transaction.signatures.length === 0) {
		throw new Error('Wallet did not attach a signature to the transaction.')
	}

	for (const signature of transaction.signatures) {
		const keypair = Keypair.fromPublicKey(expectedSource)
		if (keypair.verify(transaction.hash(), signature.signature())) {
			return
		}
	}

	throw new Error(TX_BAD_AUTH_MESSAGE)
}

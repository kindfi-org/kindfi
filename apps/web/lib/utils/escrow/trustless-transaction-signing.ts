import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk'
import { getClientStellarNetworkPassphrase } from '~/lib/config/stellar-network.config'

export const TX_BAD_AUTH_MESSAGE =
	'Transaction authorization failed. Connect the escrow platform wallet (G-address) on the correct Stellar network, approve the wallet signature prompt, and try again.'

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
): void => {
	const networkPassphrase = getClientStellarNetworkPassphrase()
	const transaction = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)

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

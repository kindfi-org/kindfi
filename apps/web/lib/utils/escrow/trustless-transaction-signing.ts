import { Keypair, type Transaction, TransactionBuilder } from '@stellar/stellar-sdk'
import {
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'

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

/**
 * Resolve the envelope the escrow signer must authorize.
 * Fee-bump wrappers are signed on the outer fee-source account; the escrow
 * signer authorizes the inner transaction, so verification must use the inner
 * hash + signatures.
 */
export const resolveSignableTransactionEnvelope = (
	signedXdr: string,
	networkPassphrase: string,
): SignableTransactionEnvelope => {
	const envelope = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)

	if ('innerTransaction' in envelope) {
		const inner = envelope.innerTransaction
		return {
			source: inner.source,
			hash: () => inner.hash(),
			signatures: inner.signatures,
		}
	}

	return {
		source: envelope.source,
		hash: () => envelope.hash(),
		signatures: envelope.signatures,
	}
}

const signatureMatchesSource = (
	envelope: SignableTransactionEnvelope,
	expectedSource: string,
): boolean => {
	if (envelope.signatures.length === 0) return false

	const keypair = Keypair.fromPublicKey(expectedSource)
	return envelope.signatures.some((signature) =>
		keypair.verify(envelope.hash(), signature.signature()),
	)
}

const alternateNetworkPassphrase = (networkPassphrase: string): string | null => {
	if (networkPassphrase === STELLAR_TESTNET_PASSPHRASE) return STELLAR_MAINNET_PASSPHRASE
	if (networkPassphrase === STELLAR_MAINNET_PASSPHRASE) return STELLAR_TESTNET_PASSPHRASE
	return null
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

	if (signatureMatchesSource(transaction, expectedSource)) {
		return
	}

	const otherPassphrase = alternateNetworkPassphrase(networkPassphrase)
	if (otherPassphrase) {
		try {
			const otherNetworkTx = resolveSignableTransactionEnvelope(signedXdr, otherPassphrase)
			if (
				otherNetworkTx.source === expectedSource &&
				signatureMatchesSource(otherNetworkTx, expectedSource)
			) {
				throw new Error(TX_BAD_AUTH_MESSAGE)
			}
		} catch (error) {
			if (error instanceof Error && error.message === TX_BAD_AUTH_MESSAGE) {
				throw error
			}
		}
	}

	throw new Error(TX_BAD_AUTH_MESSAGE)
}

import { Keypair, type Transaction, TransactionBuilder } from '@stellar/stellar-sdk'
import {
	type ClientStellarNetworkId,
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'

const CANDIDATE_NETWORKS: { id: ClientStellarNetworkId; passphrase: string }[] = [
	{ id: 'mainnet', passphrase: STELLAR_MAINNET_PASSPHRASE },
	{ id: 'testnet', passphrase: STELLAR_TESTNET_PASSPHRASE },
]

type SignableTransactionEnvelope = {
	source: string
	hash: () => Buffer
	signatures: Transaction['signatures']
}

const resolveSignableTransactionEnvelope = (
	signedXdr: string,
	networkPassphrase: string,
): SignableTransactionEnvelope | null => {
	try {
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
	} catch {
		return null
	}
}

const signatureVerifies = (envelope: SignableTransactionEnvelope): boolean => {
	if (envelope.signatures.length === 0) return false

	const keypair = Keypair.fromPublicKey(envelope.source)
	return envelope.signatures.some((signature) =>
		keypair.verify(envelope.hash(), signature.signature()),
	)
}

/** Detect which Stellar network a signed XDR was authorized for. */
export const resolveSignedTransactionNetwork = (
	signedXdr: string,
): { networkId: ClientStellarNetworkId; networkPassphrase: string } | null => {
	for (const candidate of CANDIDATE_NETWORKS) {
		const envelope = resolveSignableTransactionEnvelope(signedXdr, candidate.passphrase)
		if (envelope && signatureVerifies(envelope)) {
			return {
				networkId: candidate.id,
				networkPassphrase: candidate.passphrase,
			}
		}
	}

	return null
}

import { Keypair, type Transaction } from '@stellar/stellar-sdk'
import {
	type ClientStellarNetworkId,
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import { resolveSignableTransactionEnvelope } from '~/lib/utils/escrow/trustless-transaction-signing'

const CANDIDATE_NETWORKS: { id: ClientStellarNetworkId; passphrase: string }[] = [
	{ id: 'mainnet', passphrase: STELLAR_MAINNET_PASSPHRASE },
	{ id: 'testnet', passphrase: STELLAR_TESTNET_PASSPHRASE },
]

const signatureVerifies = (envelope: {
	source: string
	hash: () => Buffer
	signatures: Transaction['signatures']
}): boolean => {
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
		try {
			const envelope = resolveSignableTransactionEnvelope(signedXdr, candidate.passphrase)
			if (signatureVerifies(envelope)) {
				return {
					networkId: candidate.id,
					networkPassphrase: candidate.passphrase,
				}
			}
		} catch {
			// XDR may not decode under this passphrase; try the next candidate.
		}
	}

	return null
}

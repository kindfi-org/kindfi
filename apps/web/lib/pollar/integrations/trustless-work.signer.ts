import type { PollarClient } from '@pollar/core'

/**
 * Signs a Trustless Work unsigned XDR via Pollar custodial wallet.
 * Used by donation and escrow flows when onboarding_provider === 'pollar'.
 */
export const signTrustlessWorkXdrWithPollar = async (client: PollarClient, unsignedXdr: string) => {
	await client.ready()
	const outcome = await client.signAndSubmitTx(unsignedXdr)

	if (outcome.status === 'error') {
		throw new Error(outcome.message ?? outcome.details ?? 'Pollar signing failed')
	}

	return outcome
}

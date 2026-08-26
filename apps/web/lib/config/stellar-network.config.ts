import { getTrustlessWorkNetwork } from '~/lib/config/trustless-work.config'

export const STELLAR_MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015'
export const STELLAR_TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015'

export type ClientStellarNetworkId = 'mainnet' | 'testnet'

/**
 * Client-side Stellar network for wallet signing.
 * Defaults to the Trustless Work network (`NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK`).
 */
export const getClientStellarNetworkId = (): ClientStellarNetworkId => {
	const explicit = process.env.NEXT_PUBLIC_STELLAR_NETWORK?.trim().toLowerCase()

	if (explicit === 'mainnet' || explicit === 'public') {
		return 'mainnet'
	}

	if (explicit === 'testnet') {
		return 'testnet'
	}

	return getTrustlessWorkNetwork() === 'mainnet' ? 'mainnet' : 'testnet'
}

/** Network passphrase passed to Stellar Wallets Kit when signing. */
export const getClientStellarNetworkPassphrase = (): string => {
	const explicit = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE?.trim()
	if (explicit) return explicit

	return getClientStellarNetworkId() === 'mainnet'
		? STELLAR_MAINNET_PASSPHRASE
		: STELLAR_TESTNET_PASSPHRASE
}

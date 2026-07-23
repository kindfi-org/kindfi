'use client'

import type { PollarClient } from '@pollar/core'
import type { PollarClientSessionProof } from './bridge/verify-pollar-token'

/** Pollar SDK stores token expiry as Unix seconds; normalize to ms for comparisons. */
const getTokenExpiresAtMs = (expiresAt: number): number => {
	if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
		return 0
	}
	// Values below ~year 2001 in ms are treated as seconds (SDK uses seconds).
	return expiresAt < 1_000_000_000_000 ? expiresAt * 1000 : expiresAt
}

/**
 * Reads a verified Pollar browser session into the payload KindFi's server verifies.
 */
export const collectPollarClientSessionProof = (client: PollarClient): PollarClientSessionProof => {
	const authState = client.getAuthState()
	if (authState.step !== 'authenticated' || !authState.verified) {
		throw new Error('Pollar session is not verified')
	}

	const { session } = authState
	const accessToken = session.token.accessToken
	if (!accessToken) {
		throw new Error('Missing Pollar access token')
	}

	if (getTokenExpiresAtMs(session.token.expiresAt) <= Date.now()) {
		throw new Error('Pollar session has expired')
	}

	const walletAddress = session.wallet?.address ?? null
	if (!walletAddress) {
		throw new Error('Pollar session does not include a wallet address')
	}

	const profile = client.getUserProfile()
	const pollarUserId = session.userId ?? session.user.id ?? ''
	if (!pollarUserId) {
		throw new Error('Pollar session does not include a user id')
	}

	const network =
		session.wallet?.network ?? (client.getNetwork() === 'mainnet' ? 'mainnet' : 'testnet')

	return {
		accessToken,
		pollarUserId,
		walletAddress,
		email: profile?.mail?.trim().toLowerCase() || null,
		authProvider: session.wallet?.provider ?? null,
		network,
		profile: profile
			? {
					firstName: profile.first_name || null,
					lastName: profile.last_name || null,
					avatar: profile.avatar || null,
				}
			: undefined,
	}
}

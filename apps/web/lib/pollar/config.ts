import { appEnvConfig } from '@packages/lib/config'
import type { PollarClientConfig, StellarNetwork } from '@pollar/core'

/** Client SDK origin — Pollar appends `/v2` internally. */
export const POLLAR_SDK_BASE_URL = 'https://sdk.api.pollar.xyz'

export const getPollarClientConfig = (): PollarClientConfig => {
	const config = appEnvConfig('web')
	const twNetwork = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK
	const stellarNetwork: StellarNetwork = twNetwork === 'mainnet' ? 'mainnet' : 'testnet'

	return {
		apiKey: config.externalApis.pollar.publishableKey,
		baseUrl: POLLAR_SDK_BASE_URL,
		stellarNetwork,
		// OAuth returns to site origin; SDK polls session status after popup closes.
		oauthRedirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
	}
}

export const isPollarConfigured = (): boolean => {
	const config = appEnvConfig('web')
	return Boolean(config.externalApis.pollar.publishableKey)
}

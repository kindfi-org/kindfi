export const TRUSTLESS_WORK_API_URLS = {
	development: 'https://dev.api.trustlesswork.com',
	mainnet: 'https://api.trustlesswork.com',
} as const

export type TrustlessWorkNetwork = keyof typeof TRUSTLESS_WORK_API_URLS

type TrustlessWorkApiBaseUrl = (typeof TRUSTLESS_WORK_API_URLS)[TrustlessWorkNetwork]

/**
 * Trustless Work network selection is controlled only by env vars — never by
 * NODE_ENV, NEXT_PUBLIC_APP_ENV, or Vercel deployment environment.
 *
 * Set `NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=mainnet` only when you intentionally
 * want mainnet. Omit it or use `development` everywhere else (including prod deploys).
 */
const readTrustlessWorkNetworkEnv = (): string | undefined =>
	process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK ?? process.env.TRUSTLESS_WORK_NETWORK

const resolveTrustlessWorkNetwork = (network: string): TrustlessWorkNetwork => {
	const normalized = network.toLowerCase()

	if (normalized === 'mainnet') {
		return 'mainnet'
	}

	return 'development'
}

/** Trustless Work API base URL — shared by client SDK and server-side escrow services. */
export const getTrustlessWorkApiBaseUrl = (): TrustlessWorkApiBaseUrl => {
	const networkEnv = readTrustlessWorkNetworkEnv()

	if (networkEnv) {
		return TRUSTLESS_WORK_API_URLS[resolveTrustlessWorkNetwork(networkEnv)]
	}

	const explicitUrl =
		process.env.TRUSTLESS_WORK_API_URL ?? process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_URL

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.mainnet) {
		return TRUSTLESS_WORK_API_URLS.mainnet
	}

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.development) {
		return TRUSTLESS_WORK_API_URLS.development
	}

	return TRUSTLESS_WORK_API_URLS.development
}

export const getTrustlessWorkNetwork = (): TrustlessWorkNetwork => {
	const networkEnv = readTrustlessWorkNetworkEnv()

	if (networkEnv) {
		return resolveTrustlessWorkNetwork(networkEnv)
	}

	const explicitUrl =
		process.env.TRUSTLESS_WORK_API_URL ?? process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_URL

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.mainnet) {
		return 'mainnet'
	}

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.development) {
		return 'development'
	}

	return 'development'
}

export const getTrustlessWorkApiKey = (): string =>
	process.env.TRUSTLESS_WORK_API_KEY ?? process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY ?? ''

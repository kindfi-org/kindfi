import type { baseURL as TrustlessWorkSdkBaseUrl } from '@trustless-work/escrow'

export const TRUSTLESS_WORK_API_URLS = {
	development: 'https://dev.api.trustlesswork.com',
	mainnet: 'https://api.trustlesswork.com',
} as const

export const TRUSTLESS_WORK_STELLAR_RPC_URLS = {
	development: 'https://soroban-testnet.stellar.org',
	mainnet: 'https://mainnet.sorobanrpc.com',
} as const

export type TrustlessWorkNetwork = keyof typeof TRUSTLESS_WORK_API_URLS

type TrustlessWorkApiBaseUrl = (typeof TRUSTLESS_WORK_API_URLS)[TrustlessWorkNetwork]

const TRUSTLESS_WORK_CLIENT_PROXY_PATH = '/api/trustless-work'

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

	if (normalized === 'development' || normalized === 'testnet' || normalized === 'dev') {
		return 'development'
	}

	return 'development'
}

/** Upstream Trustless Work API base URL — server-side only. */
export const getTrustlessWorkApiBaseUrl = (): TrustlessWorkApiBaseUrl => {
	const networkEnv = readTrustlessWorkNetworkEnv()

	if (networkEnv) {
		return TRUSTLESS_WORK_API_URLS[resolveTrustlessWorkNetwork(networkEnv)]
	}

	const explicitUrl = process.env.TRUSTLESS_WORK_API_URL

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.mainnet) {
		return TRUSTLESS_WORK_API_URLS.mainnet
	}

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.development) {
		return TRUSTLESS_WORK_API_URLS.development
	}

	return TRUSTLESS_WORK_API_URLS.development
}

/**
 * Base URL for the browser Trustless Work SDK.
 * Routes through our API proxy so the API key never ships to the client.
 */
export const getTrustlessWorkClientBaseUrl = (): string => {
	const origin =
		typeof window !== 'undefined'
			? window.location.origin
			: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

	return `${origin}${TRUSTLESS_WORK_CLIENT_PROXY_PATH}`
}

/**
 * Same as getTrustlessWorkClientBaseUrl, typed for TrustlessWorkConfig.
 * The SDK only declares upstream API hosts; our proxy URL is valid at runtime.
 */
export const getTrustlessWorkSdkBaseUrl = (): TrustlessWorkSdkBaseUrl =>
	getTrustlessWorkClientBaseUrl() as TrustlessWorkSdkBaseUrl

export const getTrustlessWorkNetwork = (): TrustlessWorkNetwork => {
	const networkEnv = readTrustlessWorkNetworkEnv()

	if (networkEnv) {
		return resolveTrustlessWorkNetwork(networkEnv)
	}

	const explicitUrl = process.env.TRUSTLESS_WORK_API_URL

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.mainnet) {
		return 'mainnet'
	}

	if (explicitUrl === TRUSTLESS_WORK_API_URLS.development) {
		return 'development'
	}

	return 'development'
}

/** Server-only Trustless Work API key — never expose via NEXT_PUBLIC_. */
export const getTrustlessWorkApiKey = (): string => process.env.TRUSTLESS_WORK_API_KEY ?? ''

/** Soroban RPC URL aligned with the active Trustless Work network. */
export const getTrustlessWorkStellarRpcUrl = (): string => {
	const explicit = process.env.RPC_URL?.trim()
	if (explicit) return explicit

	return TRUSTLESS_WORK_STELLAR_RPC_URLS[getTrustlessWorkNetwork()]
}

/** Soroban RPC URL for a specific Trustless Work / Stellar network id. */
export const getTrustlessWorkStellarRpcUrlForNetwork = (network: TrustlessWorkNetwork): string => {
	const explicit = process.env.RPC_URL?.trim()
	if (explicit) return explicit

	return TRUSTLESS_WORK_STELLAR_RPC_URLS[network]
}

import { getTrustlessWorkNetwork } from '~/lib/config/trustless-work.config'

/**
 * Testnet USDC issuer (KindFi / Trustless Work configuration).
 */
export const TESTNET_USDC_TRUSTLINE_ADDRESS =
	'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

/**
 * Circle USDC issuer on Stellar mainnet (KindFi / Trustless Work configuration).
 */
export const MAINNET_USDC_TRUSTLINE_ADDRESS =
	'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'

const readExplicitUsdcAddress = (): string | undefined => {
	const address =
		process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS?.trim() ||
		process.env.USDC_CONTRACT_ADDRESS?.trim()

	return address || undefined
}

const readNetworkUsdcAddress = (): string => {
	const network = getTrustlessWorkNetwork()

	if (network === 'mainnet') {
		return (
			process.env.NEXT_PUBLIC_MAINNET_USDC_CONTRACT_ADDRESS?.trim() ||
			process.env.MAINNET_PUBLIC_USDC_ISSUER?.trim() ||
			MAINNET_USDC_TRUSTLINE_ADDRESS
		)
	}

	return (
		process.env.NEXT_PUBLIC_TESTNET_USDC_CONTRACT_ADDRESS?.trim() ||
		process.env.NEXT_PUBLIC_TESTNET_USDC_ISSUER_ADDRESS?.trim() ||
		process.env.TESTNET_PUBLIC_USDC_ISSUER?.trim() ||
		TESTNET_USDC_TRUSTLINE_ADDRESS
	)
}

/** Default USDC trustline for the active Trustless Work network. */
export const getDefaultUsdcContractAddress = (): string =>
	readExplicitUsdcAddress() ?? readNetworkUsdcAddress()

/**
 * Default USDC trustline used in escrow forms.
 * Follows `NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK` unless overridden via USDC env vars.
 */
export const DEFAULT_USDC_CONTRACT_ADDRESS = getDefaultUsdcContractAddress()

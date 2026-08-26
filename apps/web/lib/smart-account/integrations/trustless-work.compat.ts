import {
	isExternalStellarWalletAddress,
	isSmartAccountContractAddress,
	STELLAR_C_ADDRESS_REGEX,
	STELLAR_G_ADDRESS_REGEX,
} from '@packages/lib/utils/wallet-address'

/**
 * @integration-point DISABLED
 * Trustless Work does not support C-address (Smart Account) transaction signing.
 * Production escrow flows must use Stellar Wallet Kit G-addresses.
 *
 * Re-enable: update this module when Trustless Work adds Smart Account Kit / C-address support.
 */
export const TRUSTLESS_WORK_SMART_ACCOUNT_BLOCKER =
	'Smart accounts (C-address) cannot sign Trustless Work escrow transactions yet. Connect an external Stellar wallet (G-address) from the Stellar Wallet Kit.' as const

export const TRUSTLESS_WORK_CONNECT_WALLET_HINT =
	'Connect an external Stellar wallet (Freighter, xBull, etc.) to sign Trustless Work transactions.' as const

export const TRUSTLESS_WORK_INVALID_ADDRESS_HINT =
	'Trustless Work requires a valid external Stellar wallet address (G-address).' as const

export { STELLAR_C_ADDRESS_REGEX, STELLAR_G_ADDRESS_REGEX }

export const isSmartAccountAddress = (address: string | null | undefined): boolean =>
	Boolean(address && STELLAR_C_ADDRESS_REGEX.test(address))

export const isExternalStellarWalletAddressCompat = isExternalStellarWalletAddress

/**
 * Returns a user-facing error when the address cannot sign Trustless Work transactions.
 * @smart-account-integration-point
 */
export const getTrustlessSignerError = (address: string | null | undefined): string | null => {
	if (!address) {
		return TRUSTLESS_WORK_CONNECT_WALLET_HINT
	}

	if (isSmartAccountContractAddress(address)) {
		return TRUSTLESS_WORK_SMART_ACCOUNT_BLOCKER
	}

	if (!isExternalStellarWalletAddress(address)) {
		return TRUSTLESS_WORK_INVALID_ADDRESS_HINT
	}

	return null
}

/**
 * Throws when address is a C-address or otherwise incompatible with Trustless Work.
 * @smart-account-integration-point
 */
export const assertTrustlessWorkCompatibleAddress = (address: string): void => {
	const error = getTrustlessSignerError(address)
	if (error) {
		throw new Error(error)
	}
}

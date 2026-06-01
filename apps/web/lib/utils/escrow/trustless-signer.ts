export const STELLAR_G_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/
export const STELLAR_C_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/

export function isExternalStellarWalletAddress(
	address: string | null | undefined,
): address is string {
	return Boolean(address && STELLAR_G_ADDRESS_REGEX.test(address))
}

export function isSmartAccountAddress(address: string | null | undefined): boolean {
	return Boolean(address && STELLAR_C_ADDRESS_REGEX.test(address))
}

export function getTrustlessSignerError(address: string | null | undefined): string | null {
	if (!address) {
		return 'Connect an external Stellar wallet (Freighter, xBull, etc.) to sign Trustless Work transactions.'
	}

	if (isSmartAccountAddress(address)) {
		return 'Smart accounts (C-address) cannot sign Trustless Work escrow transactions yet. Connect an external Stellar wallet (G-address) from the Stellar Wallet Kit.'
	}

	if (!isExternalStellarWalletAddress(address)) {
		return 'Trustless Work requires a valid external Stellar wallet address (G-address).'
	}

	return null
}

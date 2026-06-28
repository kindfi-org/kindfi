/** Placeholder stored in devices.address when no smart account has been deployed yet. */
export const SMART_ACCOUNT_PLACEHOLDER_ADDRESS = '0x'

export const STELLAR_G_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/
export const STELLAR_C_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/

export const isSmartAccountPlaceholder = (address: string | null | undefined): boolean =>
	!address || address === SMART_ACCOUNT_PLACEHOLDER_ADDRESS

export const resolveSmartAccountAddress = (address: string | null | undefined): string | null => {
	if (isSmartAccountPlaceholder(address)) {
		return null
	}

	return address
}

export const isExternalStellarWalletAddress = (
	address: string | null | undefined,
): address is string => Boolean(address && STELLAR_G_ADDRESS_REGEX.test(address))

export const isSmartAccountContractAddress = (address: string | null | undefined): boolean =>
	Boolean(address && STELLAR_C_ADDRESS_REGEX.test(address))

export const isValidStellarWalletAddress = (address: string): boolean =>
	STELLAR_G_ADDRESS_REGEX.test(address) || STELLAR_C_ADDRESS_REGEX.test(address)

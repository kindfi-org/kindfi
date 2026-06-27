/** Placeholder stored in devices.address when no smart account has been deployed yet. */
export const SMART_ACCOUNT_PLACEHOLDER_ADDRESS = '0x'

export const resolveSmartAccountAddress = (address: string | null | undefined): string | null => {
	if (!address || address === SMART_ACCOUNT_PLACEHOLDER_ADDRESS) {
		return null
	}

	return address
}

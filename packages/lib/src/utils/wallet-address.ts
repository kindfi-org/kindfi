import { StrKey } from '@stellar/stellar-sdk'

/** Placeholder stored in devices.address when no smart account has been deployed yet. */
export const SMART_ACCOUNT_PLACEHOLDER_ADDRESS = '0x'

export const STELLAR_G_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/
export const STELLAR_C_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/

/** SEP-23 classic account public key (G-address), including checksum validation. */
export const isClassicAccountAddress = (address: string | null | undefined): address is string =>
	typeof address === 'string' && StrKey.isValidEd25519PublicKey(address)

/** SEP-23 contract ID (C-address), including checksum validation. */
export const isContractAddress = (address: string | null | undefined): address is string =>
	typeof address === 'string' && StrKey.isValidContract(address)

type SmartAccountPlaceholderAddress =
	| null
	| undefined
	| ''
	| typeof SMART_ACCOUNT_PLACEHOLDER_ADDRESS

export const isSmartAccountPlaceholder = (
	address: string | null | undefined,
): address is SmartAccountPlaceholderAddress =>
	!address || address === SMART_ACCOUNT_PLACEHOLDER_ADDRESS

export const resolveSmartAccountAddress = (address: string | null | undefined): string | null => {
	if (isSmartAccountPlaceholder(address)) {
		return null
	}

	return isContractAddress(address) ? address : null
}

export const isExternalStellarWalletAddress = (
	address: string | null | undefined,
): address is string => isClassicAccountAddress(address)

export const isSmartAccountContractAddress = (address: string | null | undefined): boolean =>
	isContractAddress(address)

export const isValidStellarWalletAddress = (address: string): boolean =>
	isClassicAccountAddress(address) || isContractAddress(address)

export {
	isExternalStellarWalletAddress,
	isSmartAccountContractAddress,
	isSmartAccountPlaceholder,
	isValidStellarWalletAddress,
	resolveSmartAccountAddress,
	SMART_ACCOUNT_PLACEHOLDER_ADDRESS,
	STELLAR_C_ADDRESS_REGEX,
	STELLAR_G_ADDRESS_REGEX,
} from '@packages/lib/utils/wallet-address'

import {
	isExternalStellarWalletAddress,
	resolveSmartAccountAddress,
} from '@packages/lib/utils/wallet-address'

/** Prefer smart account (C-address); fall back to external Stellar Wallet Kit G-address. */
export const resolveGamificationWalletAddress = (
	smartAccountAddress: string | null | undefined,
	externalWalletAddress: string | null | undefined,
): string | null =>
	resolveSmartAccountAddress(smartAccountAddress) ??
	(isExternalStellarWalletAddress(externalWalletAddress) ? externalWalletAddress : null)

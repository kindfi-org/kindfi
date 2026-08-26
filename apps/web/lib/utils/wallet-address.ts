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

export type ResolveGamificationWalletAddressInput = {
	smartAccountAddress?: string | null
	sessionWalletAddress?: string | null
	pollarWalletAddress?: string | null
	profileExternalAddress?: string | null
	kitWalletAddress?: string | null
}

const firstExternalStellarAddress = (
	...candidates: Array<string | null | undefined>
): string | null => {
	for (const candidate of candidates) {
		if (isExternalStellarWalletAddress(candidate)) {
			return candidate
		}
	}
	return null
}

/** Prefer smart account (C-address); fall back to Pollar/session/profile/Wallet Kit G-address. */
export const resolveGamificationWalletAddress = (
	smartAccountAddress: string | null | undefined,
	externalWalletAddress: string | null | undefined,
	options: Omit<
		ResolveGamificationWalletAddressInput,
		'smartAccountAddress' | 'kitWalletAddress'
	> = {},
): string | null => {
	const cAddress = resolveSmartAccountAddress(smartAccountAddress)
	if (cAddress) {
		return cAddress
	}

	return firstExternalStellarAddress(
		options.pollarWalletAddress,
		options.sessionWalletAddress,
		options.profileExternalAddress,
		externalWalletAddress,
	)
}

/** Resolve gamification/on-chain address from a structured input object. */
export const resolveEffectiveGamificationAddress = (
	input: ResolveGamificationWalletAddressInput,
): string | null => {
	const cAddress = resolveSmartAccountAddress(input.smartAccountAddress)
	if (cAddress) {
		return cAddress
	}

	return firstExternalStellarAddress(
		input.pollarWalletAddress,
		input.sessionWalletAddress,
		input.profileExternalAddress,
		input.kitWalletAddress,
	)
}

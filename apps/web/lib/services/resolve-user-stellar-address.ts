import type { TypedSupabaseClient } from '@packages/lib/types'
import {
	isSmartAccountPlaceholder,
	isValidStellarWalletAddress,
} from '@packages/lib/utils/wallet-address'

type ResolveUserStellarAddressOptions = {
	sessionAddress?: string | null
	overrideAddress?: string | null
}

const normalizeAddress = (address: string | null | undefined): string | null => {
	if (!address || isSmartAccountPlaceholder(address)) {
		return null
	}

	return isValidStellarWalletAddress(address) ? address : null
}

/**
 * Resolve the best Stellar address for gamification and on-chain contract calls.
 * Prefers explicit overrides, Pollar wallet, device C-address, then linked external wallet.
 */
export const resolveUserStellarAddress = async (
	supabase: TypedSupabaseClient,
	userId: string,
	options: ResolveUserStellarAddressOptions = {},
): Promise<string | null> => {
	const override = normalizeAddress(options.overrideAddress)
	if (override) {
		return override
	}

	const sessionAddress = normalizeAddress(options.sessionAddress)
	if (sessionAddress) {
		return sessionAddress
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('pollar_wallet_address, external_wallet_address, onboarding_provider')
		.eq('id', userId)
		.maybeSingle()

	const pollarWallet = normalizeAddress(profile?.pollar_wallet_address)
	if (pollarWallet) {
		return pollarWallet
	}

	const { data: device } = await supabase
		.from('devices')
		.select('address')
		.eq('user_id', userId)
		.not('address', 'eq', '0x')
		.not('address', 'is', null)
		.limit(1)
		.maybeSingle()

	const deviceAddress = normalizeAddress(device?.address)
	if (deviceAddress) {
		return deviceAddress
	}

	const profileWallet = normalizeAddress(profile?.external_wallet_address)
	if (profileWallet) {
		return profileWallet
	}

	const { data: nft } = await supabase
		.from('user_nfts')
		.select('stellar_address')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	return normalizeAddress(nft?.stellar_address)
}

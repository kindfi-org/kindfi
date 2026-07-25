import type { TypedSupabaseClient } from '@packages/lib/types'
import { logger } from '@/lib/logger'
import { buildReferralCode, normalizeReferralCode } from '~/lib/referral/referral-code'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

const ONBOARDING_REWARD_POINTS = 50

export type ReferralProfileRow = {
	user_id: string
	referral_code: string
	stellar_address: string | null
	activated_at: string
	on_chain_ready: boolean
}

const getReferralContractAddress = (): string | undefined =>
	process.env.REFERRAL_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS

export const resolveReferrerByCode = async (
	supabase: TypedSupabaseClient,
	code: string,
): Promise<{ userId: string; referralCode: string } | null> => {
	const normalizedCode = normalizeReferralCode(code)

	const { data: profile } = await supabase
		.from('referral_profiles')
		.select('user_id, referral_code')
		.eq('referral_code', normalizedCode)
		.maybeSingle()

	if (profile) {
		return { userId: profile.user_id, referralCode: profile.referral_code }
	}

	return null
}

export const activateReferralProfile = async (
	supabase: TypedSupabaseClient,
	userId: string,
): Promise<
	{ success: true; profile: ReferralProfileRow } | { success: false; error: string; status: number }
> => {
	const { data: existing } = await supabase
		.from('referral_profiles')
		.select('*')
		.eq('user_id', userId)
		.maybeSingle()

	if (existing) {
		return { success: true, profile: existing as ReferralProfileRow }
	}

	const stellarAddress = await resolveUserStellarAddress(supabase, userId)
	if (!stellarAddress) {
		return {
			success: false,
			error: 'A Stellar wallet is required to activate your referral code',
			status: 400,
		}
	}

	const referralCode = buildReferralCode(userId)
	let onChainReady = false

	const referralContractAddress = getReferralContractAddress()
	if (referralContractAddress && process.env.SOROBAN_PRIVATE_KEY) {
		try {
			const contractService = new GamificationContractService()
			const statsResult = await contractService.getReferrerStatistics(
				referralContractAddress,
				stellarAddress,
			)
			onChainReady = statsResult.success
		} catch (err) {
			logger.warn('[Referral] Could not verify on-chain referrer profile:', err)
		}
	}

	const { data: profile, error } = await supabase
		.from('referral_profiles')
		.insert({
			user_id: userId,
			referral_code: referralCode,
			stellar_address: stellarAddress,
			on_chain_ready: onChainReady,
		})
		.select('*')
		.single()

	if (error) {
		logger.error('[Referral] Failed to create referral profile:', error)
		return { success: false, error: 'Failed to activate referral code', status: 500 }
	}

	const { data: stats } = await supabase
		.from('referrer_statistics')
		.select('referrer_id')
		.eq('referrer_id', userId)
		.maybeSingle()

	if (!stats) {
		await supabase.from('referrer_statistics').insert({
			referrer_id: userId,
			total_referrals: 0,
			active_referrals: 0,
			total_reward_points: 0,
		})
	}

	return { success: true, profile: profile as ReferralProfileRow }
}

export const applyReferralCode = async (
	supabase: TypedSupabaseClient,
	referredUserId: string,
	code: string,
): Promise<
	| {
			success: true
			referral: Record<string, unknown>
			onChain: boolean
			onboarded: boolean
	  }
	| { success: false; error: string; status: number }
> => {
	const referrer = await resolveReferrerByCode(supabase, code)
	if (!referrer) {
		return { success: false, error: 'Invalid or inactive referral code', status: 404 }
	}

	if (referrer.userId === referredUserId) {
		return { success: false, error: 'You cannot use your own referral code', status: 400 }
	}

	const { data: existingReferral } = await supabase
		.from('referral_records')
		.select('id')
		.eq('referred_id', referredUserId)
		.maybeSingle()

	if (existingReferral) {
		return { success: false, error: 'You have already applied a referral code', status: 400 }
	}

	const { data: referral, error } = await supabase
		.from('referral_records')
		.insert({
			referrer_id: referrer.userId,
			referred_id: referredUserId,
			status: 'pending',
		})
		.select()
		.single()

	if (error || !referral) {
		logger.error('[Referral] Failed to create referral record:', error)
		return { success: false, error: 'Failed to apply referral code', status: 500 }
	}

	const { data: stats } = await supabase
		.from('referrer_statistics')
		.select('*')
		.eq('referrer_id', referrer.userId)
		.maybeSingle()

	if (stats) {
		await supabase
			.from('referrer_statistics')
			.update({
				total_referrals: stats.total_referrals + 1,
				updated_at: new Date().toISOString(),
			})
			.eq('referrer_id', referrer.userId)
	} else {
		await supabase.from('referrer_statistics').insert({
			referrer_id: referrer.userId,
			total_referrals: 1,
			active_referrals: 0,
			total_reward_points: 0,
		})
	}

	let onChain = false
	let onboarded = false
	const referralContractAddress = getReferralContractAddress()

	if (referralContractAddress && process.env.SOROBAN_PRIVATE_KEY) {
		const [referrerAddress, referredAddress] = await Promise.all([
			resolveUserStellarAddress(supabase, referrer.userId),
			resolveUserStellarAddress(supabase, referredUserId),
		])

		if (referrerAddress && referredAddress) {
			try {
				const contractService = new GamificationContractService()
				const createResult = await contractService.createReferral(referralContractAddress, {
					referrerAddress,
					referredAddress,
				})
				onChain = createResult.success

				if (!createResult.success) {
					logger.error('[Referral] On-chain create_referral failed:', createResult.error)
				} else {
					const { data: profile } = await supabase
						.from('profiles')
						.select('role')
						.eq('id', referredUserId)
						.maybeSingle()

					const isOnboarded = profile?.role != null && profile.role !== 'pending'
					if (isOnboarded) {
						const onboardResult = await contractService.markOnboarded(referralContractAddress, {
							referredAddress,
						})
						if (onboardResult.success) {
							onboarded = true
							await supabase
								.from('referral_records')
								.update({
									status: 'onboarded',
									onboarded_at: new Date().toISOString(),
								})
								.eq('referred_id', referredUserId)

							const { data: referrerStats } = await supabase
								.from('referrer_statistics')
								.select('*')
								.eq('referrer_id', referrer.userId)
								.single()

							if (referrerStats) {
								await supabase
									.from('referrer_statistics')
									.update({
										total_reward_points:
											referrerStats.total_reward_points + ONBOARDING_REWARD_POINTS,
										updated_at: new Date().toISOString(),
									})
									.eq('referrer_id', referrer.userId)
							}
						}
					}
				}
			} catch (err) {
				logger.error('[Referral] Error during on-chain referral apply:', err)
			}
		} else {
			logger.warn('[Referral] Skipping on-chain create_referral — missing Stellar addresses')
		}
	}

	return {
		success: true,
		referral,
		onChain,
		onboarded,
	}
}

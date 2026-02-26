import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

/**
 * POST /api/referrals/onboard
 * Mark a referred user as onboarded (service/recorder role)
 *
 * Now also calls mark_onboarded on the Soroban Referral contract
 * so the on-chain state stays in sync with the database.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { referred_id } = body

		if (!referred_id) {
			return NextResponse.json(
				{ error: 'Missing required field: referred_id' },
				{ status: 400 },
			)
		}

		// Use service role client to bypass RLS — auth is handled by NextAuth session above
		const { supabase } = await import('@packages/lib/supabase')

		// Get referral record
		const { data: referral, error: refError } = await supabase
			.from('referral_records')
			.select('*')
			.eq('referred_id', referred_id)
			.single()

		if (refError || !referral) {
			return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
		}

		if (referral.status !== 'pending') {
			return NextResponse.json({
				referral,
				reward_points: 0,
				message: 'Already processed',
			})
		}

		// Update referral status in DB
		const { data: updatedReferral, error: updateError } = await supabase
			.from('referral_records')
			.update({
				status: 'onboarded',
				onboarded_at: new Date().toISOString(),
			})
			.eq('referred_id', referred_id)
			.select()
			.single()

		if (updateError) {
			console.error('Error updating referral:', updateError)
			return NextResponse.json(
				{ error: 'Failed to update referral' },
				{ status: 500 },
			)
		}

		// Update referrer statistics in DB
		const reward_points = 50 // Onboarding reward
		const { data: stats } = await supabase
			.from('referrer_statistics')
			.select('*')
			.eq('referrer_id', referral.referrer_id)
			.single()

		if (stats) {
			await supabase
				.from('referrer_statistics')
				.update({
					total_reward_points: stats.total_reward_points + reward_points,
					updated_at: new Date().toISOString(),
				})
				.eq('referrer_id', referral.referrer_id)
		}

		// ---- On-chain: mark_onboarded ----
		let contractResult: {
			success: boolean
			rewardPoints?: number
			error?: string
		} | null = null
		const referralContractAddress =
			process.env.REFERRAL_CONTRACT_ADDRESS ||
			process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS

		if (referralContractAddress && process.env.SOROBAN_PRIVATE_KEY) {
			// Resolve referred user's Stellar address
			const { data: devices } = await supabase
				.from('devices')
				.select('address')
				.eq('user_id', referred_id)
				.not('address', 'eq', '0x')
				.not('address', 'is', null)
				.limit(1)

			const referredAddress = devices?.[0]?.address ?? null

			if (referredAddress) {
				try {
					const contractService = new GamificationContractService()
					contractResult = await contractService.markOnboarded(
						referralContractAddress,
						{ referredAddress },
					)

					if (!contractResult.success) {
						console.error(
							'[Referral Onboard API] On-chain mark_onboarded failed:',
							contractResult.error,
						)
					} else {
						console.log(
							'[Referral Onboard API] On-chain mark_onboarded succeeded, reward:',
							contractResult.rewardPoints,
						)
					}
				} catch (err) {
					console.error(
						'[Referral Onboard API] Error calling mark_onboarded on-chain:',
						err,
					)
				}
			} else {
				console.warn(
					'[Referral Onboard API] Skipping on-chain mark_onboarded — no Stellar address for referred user',
				)
			}
		}

		return NextResponse.json({
			referral: updatedReferral,
			reward_points,
			onChain: contractResult?.success ?? false,
		})
	} catch (error) {
		console.error('Error in POST /api/referrals/onboard:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

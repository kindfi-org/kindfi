import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

/**
 * POST /api/referrals/donation
 * Record a donation by a referred user (service/recorder role)
 *
 * Uses service role client because RLS policies use auth.uid() (Supabase Auth)
 * but this app authenticates via NextAuth. The session check above ensures
 * only authenticated users can access this endpoint.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { referred_id, referred_address } = body

		if (!referred_id) {
			return NextResponse.json(
				{ error: 'Missing required field: referred_id' },
				{ status: 400 },
			)
		}

		// Use service role client to bypass RLS — auth is handled by NextAuth session above
		const { supabase } = await import('@packages/lib/supabase')

		// Get user's Stellar address if not provided
		let stellarAddress = referred_address
		if (!stellarAddress) {
			// Try to get from user's device/smart account (handle multiple devices)
			const { data: devices } = await supabase
				.from('devices')
				.select('address')
				.eq('user_id', referred_id)
				.not('address', 'eq', '0x')
				.not('address', 'is', null)
				.limit(1)

			if (devices && devices.length > 0 && devices[0]?.address) {
				stellarAddress = devices[0].address
			}
		}

		// Get referral record
		const { data: referral, error: refError } = await supabase
			.from('referral_records')
			.select('*')
			.eq('referred_id', referred_id)
			.single()

		if (refError || !referral) {
			// Not a referred user, skip silently
			return NextResponse.json({
				reward_points: 0,
				message: 'Not a referred user',
			})
		}

		// Call smart contract if address is available and SOROBAN_PRIVATE_KEY is set
		let contractResult: {
			success: boolean
			rewardPoints?: number
			error?: string
		} | null = null

		console.log('[Referral API] Contract call conditions:', {
			hasStellarAddress: !!stellarAddress,
			hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
			stellarAddress: stellarAddress || 'N/A',
			referred_id,
		})

		if (stellarAddress && process.env.SOROBAN_PRIVATE_KEY) {
			try {
				const contractService = new GamificationContractService()
				const referralContractAddress =
					process.env.REFERRAL_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS

				console.log('[Referral API] Referral contract address:', referralContractAddress || 'NOT SET')

				if (referralContractAddress) {
					console.log('[Referral API] Calling referral contract...')
					contractResult = await contractService.recordReferralDonation(
						referralContractAddress,
						{
							referredAddress: stellarAddress,
						},
					)

					console.log('[Referral API] Contract call result:', contractResult)

					if (!contractResult.success) {
						console.error(
							'[Referral API] Failed to record referral donation on-chain:',
							contractResult.error,
						)
						// Continue with database update even if contract call fails
					} else {
						console.log('[Referral API] Successfully recorded referral donation on-chain')
					}
				} else {
					console.warn('[Referral API] Referral contract address not configured')
				}
			} catch (error) {
				console.error('[Referral API] Error calling referral contract:', error)
				// Continue with database update even if contract call fails
			}
		} else {
			console.log('[Referral API] Skipping contract call - missing requirements:', {
				hasStellarAddress: !!stellarAddress,
				hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
			})
		}

		const old_status = referral.status
		const total_donations = referral.total_donations + 1
		let new_status = referral.status
		let reward_points = 0

		// Check if this is the first donation
		if (referral.first_donation_at === null) {
			new_status = 'first_donation'
			reward_points = 25 // First donation reward
		} else if (total_donations >= 3) {
			new_status = 'active'
		}

		// Update referral record
		const updateData: Record<string, unknown> = {
			total_donations,
			updated_at: new Date().toISOString(),
		}

		if (referral.first_donation_at === null) {
			updateData.first_donation_at = new Date().toISOString()
		}

		if (new_status !== old_status) {
			updateData.status = new_status
		}

		const { data: updatedReferral, error: updateError } = await supabase
			.from('referral_records')
			.update(updateData)
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

		// Award reward points if first donation
		if (reward_points > 0) {
			const { data: stats } = await supabase
				.from('referrer_statistics')
				.select('*')
				.eq('referrer_id', referral.referrer_id)
				.single()

			if (stats) {
				const updateStats: Record<string, unknown> = {
					total_reward_points: stats.total_reward_points + reward_points,
					updated_at: new Date().toISOString(),
				}

				if (new_status === 'active') {
					updateStats.active_referrals = stats.active_referrals + 1
				}

				await supabase
					.from('referrer_statistics')
					.update(updateStats)
					.eq('referrer_id', referral.referrer_id)
			}
		}

		return NextResponse.json({
			referral: updatedReferral,
			reward_points,
			status_changed: new_status !== old_status,
		})
	} catch (error) {
		console.error('Error in POST /api/referrals/donation:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

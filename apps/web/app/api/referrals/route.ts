import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
import { createReferralSchema } from '~/lib/schemas/referral.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * Resolve a user ID to a Stellar address (G... or C...) via devices table.
 * Returns null if no address is found.
 */
async function resolveUserStellarAddress(
	supabase: import('@packages/lib/types').TypedSupabaseClient,
	userId: string,
): Promise<string | null> {
	const { data: devices } = await supabase
		.from('devices')
		.select('address')
		.eq('user_id', userId)
		.not('address', 'eq', '0x')
		.not('address', 'is', null)
		.limit(1)

	return devices?.[0]?.address ?? null
}

/**
 * GET /api/referrals
 * Get user's referral information
 *
 * Uses service role client because RLS policies use auth.uid() (Supabase Auth)
 * but this app authenticates via NextAuth. The session check above ensures
 * only authenticated users can access this endpoint.
 */
export async function GET(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Use service role client to bypass RLS — auth is handled by NextAuth session above
		const { supabase } = await import('@packages/lib/supabase')

		// Get referrals, statistics, and referred record in parallel
		const [referralsResult, statsResult, referredResult] = await Promise.all([
			supabase
				.from('referral_records')
				.select('*')
				.eq('referrer_id', session.user.id)
				.order('created_at', { ascending: false }),
			supabase
				.from('referrer_statistics')
				.select('*')
				.eq('referrer_id', session.user.id)
				.single(),
			supabase
				.from('referral_records')
				.select('*')
				.eq('referred_id', session.user.id)
				.single(),
		])

		const { data: referrals, error: referralsError } = referralsResult
		const { data: stats, error: statsError } = statsResult
		const { data: referredRecord } = referredResult

		if (referralsError) {
			console.error('Error fetching referrals:', referralsError)
		}

		if (statsError && statsError.code !== 'PGRST116') {
			console.error('Error fetching referrer stats:', statsError)
		}

		return NextResponse.json({
			referrals: referrals || [],
			statistics: stats || {
				total_referrals: 0,
				active_referrals: 0,
				total_reward_points: 0,
			},
			referred_by: referredRecord?.referrer_id || null,
		})
	} catch (error) {
		console.error('Error in GET /api/referrals:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * POST /api/referrals
 * Create a referral relationship (service/recorder role)
 *
 * Now also calls create_referral on the Soroban Referral contract
 * so the on-chain state stays in sync with the database.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(createReferralSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { referrer_id, referred_id } = validation.data

		// Use service role client to bypass RLS — auth is handled by NextAuth session above
		const { supabase } = await import('@packages/lib/supabase')

		// Check if referral already exists
		const { data: existing } = await supabase
			.from('referral_records')
			.select('id')
			.eq('referred_id', referred_id)
			.single()

		if (existing) {
			return NextResponse.json(
				{ error: 'Referral already exists' },
				{ status: 400 },
			)
		}

		// Create referral record in DB
		const { data: referral, error } = await supabase
			.from('referral_records')
			.insert({
				referrer_id,
				referred_id,
				status: 'pending',
			})
			.select()
			.single()

		if (error) {
			console.error('Error creating referral:', error)
			return NextResponse.json(
				{ error: 'Failed to create referral' },
				{ status: 500 },
			)
		}

		// Update or create referrer statistics
		const { data: stats } = await supabase
			.from('referrer_statistics')
			.select('*')
			.eq('referrer_id', referrer_id)
			.single()

		if (stats) {
			await supabase
				.from('referrer_statistics')
				.update({
					total_referrals: stats.total_referrals + 1,
					updated_at: new Date().toISOString(),
				})
				.eq('referrer_id', referrer_id)
		} else {
			await supabase.from('referrer_statistics').insert({
				referrer_id,
				total_referrals: 1,
				active_referrals: 0,
				total_reward_points: 0,
			})
		}

		// ---- On-chain: create_referral ----
		let contractResult: { success: boolean; error?: string } | null = null
		const referralContractAddress =
			process.env.REFERRAL_CONTRACT_ADDRESS ||
			process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS

		if (referralContractAddress && process.env.SOROBAN_PRIVATE_KEY) {
			// Resolve both addresses in parallel
			const [referrerAddress, referredAddress] = await Promise.all([
				resolveUserStellarAddress(supabase, referrer_id),
				resolveUserStellarAddress(supabase, referred_id),
			])

			console.log('[Referral API] On-chain create_referral addresses:', {
				referrerAddress,
				referredAddress,
			})

			if (referrerAddress && referredAddress) {
				try {
					const contractService = new GamificationContractService()
					contractResult = await contractService.createReferral(
						referralContractAddress,
						{ referrerAddress, referredAddress },
					)

					if (!contractResult.success) {
						console.error(
							'[Referral API] On-chain create_referral failed:',
							contractResult.error,
						)
					} else {
						console.log('[Referral API] On-chain create_referral succeeded')
					}
				} catch (err) {
					console.error(
						'[Referral API] Error calling create_referral on-chain:',
						err,
					)
				}
			} else {
				console.warn(
					'[Referral API] Skipping on-chain create_referral — missing Stellar addresses',
				)
			}
		}

		return NextResponse.json(
			{ referral, onChain: contractResult?.success ?? false },
			{ status: 201 },
		)
	} catch (error) {
		console.error('Error in POST /api/referrals:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

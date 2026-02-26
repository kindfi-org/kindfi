import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

/**
 * GET /api/streaks
 * Get user's streak information
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

		const { data: streaks, error } = await supabase
			.from('user_streaks')
			.select('*')
			.eq('user_id', session.user.id)
			.order('period', { ascending: true })

		if (error) {
			console.error('Error fetching streaks:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch streaks' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ streaks: streaks || [] })
	} catch (error) {
		console.error('Error in GET /api/streaks:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * POST /api/streaks
 * Record a donation and update streak (service/recorder role)
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { period, donation_timestamp, user_address } = body

		// Use session user_id to ensure RLS policies work correctly
		const user_id = session.user.id

		if (!period) {
			return NextResponse.json(
				{ error: 'Missing required fields: period' },
				{ status: 400 },
			)
		}

		// Use service role client to bypass RLS, but ensure user_id matches session
		// This is necessary because these operations are triggered server-side after donations
		const { supabase: supabaseServiceRole } = await import(
			'@packages/lib/supabase'
		)
		const supabase = supabaseServiceRole

		const timestamp = donation_timestamp || new Date().toISOString()
		const donationTimestampUnix = Math.floor(
			new Date(timestamp).getTime() / 1000,
		)

		// Get user's Stellar address if not provided
		let stellarAddress = user_address
		if (!stellarAddress) {
			// Try to get from user's device/smart account (handle multiple devices)
			const { data: devices } = await supabase
				.from('devices')
				.select('address')
				.eq('user_id', user_id)
				.not('address', 'eq', '0x')
				.not('address', 'is', null)
				.limit(1)

			if (devices && devices.length > 0 && devices[0]?.address) {
				stellarAddress = devices[0].address
			}
		}

		// Call smart contract if address is available and SOROBAN_PRIVATE_KEY is set
		let contractResult: {
			success: boolean
			streak?: number
			error?: string
		} | null = null

		console.log('[Streak API] Contract call conditions:', {
			hasStellarAddress: !!stellarAddress,
			hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
			stellarAddress: stellarAddress || 'N/A',
			period,
			donationTimestamp: donationTimestampUnix,
		})

		if (stellarAddress && process.env.SOROBAN_PRIVATE_KEY) {
			try {
				const contractService = new GamificationContractService()
				const streakContractAddress =
					process.env.STREAK_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_STREAK_CONTRACT_ADDRESS

				console.log(
					'[Streak API] Streak contract address:',
					streakContractAddress || 'NOT SET',
				)

				if (streakContractAddress) {
					console.log('[Streak API] Calling streak contract...')
					contractResult = await contractService.recordStreakDonation(
						streakContractAddress,
						{
							userAddress: stellarAddress,
							period: period as 'weekly' | 'monthly',
							donationTimestamp: donationTimestampUnix,
						},
					)

					console.log('[Streak API] Contract call result:', contractResult)

					if (!contractResult.success) {
						console.error(
							'[Streak API] Failed to record streak on-chain:',
							contractResult.error,
						)
						// Continue with database update even if contract call fails
					} else {
						console.log('[Streak API] Successfully recorded streak on-chain')
					}
				} else {
					console.warn('[Streak API] Streak contract address not configured')
				}
			} catch (error) {
				console.error('[Streak API] Error calling streak contract:', error)
				// Continue with database update even if contract call fails
			}
		} else {
			console.log(
				'[Streak API] Skipping contract call - missing requirements:',
				{
					hasStellarAddress: !!stellarAddress,
					hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
				},
			)
		}

		// Get existing streak or create new (use maybeSingle to handle missing records)
		const { data: existingStreak, error: fetchError } = await supabase
			.from('user_streaks')
			.select('*')
			.eq('user_id', user_id)
			.eq('period', period)
			.maybeSingle()

		// If there's an error other than "not found", return it
		if (fetchError && fetchError.code !== 'PGRST116') {
			console.error('Error fetching streak:', fetchError)
			return NextResponse.json(
				{ error: 'Failed to fetch streak' },
				{ status: 500 },
			)
		}

		// Calculate streak logic (simplified - should match contract logic)
		const periodDays = period === 'weekly' ? 7 : 30
		const periodMs = periodDays * 24 * 60 * 60 * 1000

		let current_streak = 1
		let longest_streak = 1

		if (existingStreak) {
			const lastDonation = existingStreak.last_donation_timestamp
				? new Date(existingStreak.last_donation_timestamp).getTime()
				: 0
			const now = new Date(timestamp).getTime()
			const timeSinceLast = now - lastDonation

			if (lastDonation > 0 && timeSinceLast <= periodMs) {
				// Streak continues
				current_streak = existingStreak.current_streak + 1
				longest_streak = Math.max(current_streak, existingStreak.longest_streak)
			} else {
				// Streak broken or first donation
				current_streak = 1
				longest_streak = Math.max(1, existingStreak.longest_streak)
			}
		}

		const streakData = {
			user_id,
			period,
			current_streak,
			longest_streak,
			last_donation_timestamp: timestamp,
			updated_at: new Date().toISOString(),
		}

		if (existingStreak) {
			const { data: streak, error } = await supabase
				.from('user_streaks')
				.update(streakData)
				.eq('user_id', user_id)
				.eq('period', period)
				.select()
				.single()

			if (error) {
				console.error('Error updating streak:', error)
				return NextResponse.json(
					{ error: 'Failed to update streak' },
					{ status: 500 },
				)
			}

			return NextResponse.json({
				streak,
				bonus_points: current_streak > 1 ? 25 : 0, // Award bonus for maintaining streak
			})
		}

		const { data: streak, error } = await supabase
			.from('user_streaks')
			.insert(streakData)
			.select()
			.single()

		if (error) {
			console.error('Error creating streak:', error)
			return NextResponse.json(
				{ error: 'Failed to create streak' },
				{ status: 500 },
			)
		}

		return NextResponse.json({
			streak,
			bonus_points: 0,
		})
	} catch (error) {
		console.error('Error in POST /api/streaks:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

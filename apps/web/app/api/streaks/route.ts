import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * GET /api/streaks
 * Get user's streak information
 */
export async function GET(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()

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
		const { user_id, period, donation_timestamp } = body

		if (!user_id || !period) {
			return NextResponse.json(
				{ error: 'Missing required fields: user_id, period' },
				{ status: 400 },
			)
		}

		const supabase = await createSupabaseServerClient()

		const timestamp = donation_timestamp || new Date().toISOString()

		// Get existing streak or create new
		const { data: existingStreak } = await supabase
			.from('user_streaks')
			.select('*')
			.eq('user_id', user_id)
			.eq('period', period)
			.single()

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
				longest_streak = Math.max(
					current_streak,
					existingStreak.longest_streak,
				)
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

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * POST /api/quests/progress
 * Update user's quest progress (service/recorder role)
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { user_id, quest_id, progress_value } = body

		if (!user_id || quest_id === undefined || progress_value === undefined) {
			return NextResponse.json(
				{ error: 'Missing required fields: user_id, quest_id, progress_value' },
				{ status: 400 },
			)
		}

		const supabase = await createSupabaseServerClient()

		// Get quest definition
		const { data: quest, error: questError } = await supabase
			.from('quest_definitions')
			.select('*')
			.eq('quest_id', quest_id)
			.single()

		if (questError || !quest) {
			return NextResponse.json(
				{ error: 'Quest not found' },
				{ status: 404 },
			)
		}

		if (!quest.is_active) {
			return NextResponse.json(
				{ error: 'Quest is not active' },
				{ status: 400 },
			)
		}

		// Check expiration
		if (quest.expires_at && new Date(quest.expires_at) < new Date()) {
			return NextResponse.json(
				{ error: 'Quest has expired' },
				{ status: 400 },
			)
		}

		// Get or create progress
		const { data: existingProgress } = await supabase
			.from('user_quest_progress')
			.select('*')
			.eq('user_id', user_id)
			.eq('quest_id', quest_id)
			.single()

		const is_completed = progress_value >= quest.target_value
		const completed_at = is_completed ? new Date().toISOString() : null

		if (existingProgress) {
			// Update existing progress
			const { data: progress, error } = await supabase
				.from('user_quest_progress')
				.update({
					current_value: progress_value,
					is_completed,
					completed_at,
					updated_at: new Date().toISOString(),
				})
				.eq('user_id', user_id)
				.eq('quest_id', quest_id)
				.select()
				.single()

			if (error) {
				console.error('Error updating quest progress:', error)
				return NextResponse.json(
					{ error: 'Failed to update quest progress' },
					{ status: 500 },
				)
			}

			return NextResponse.json({
				progress,
				completed: is_completed,
				reward_points: is_completed ? quest.reward_points : 0,
			})
		} else {
			// Create new progress
			const { data: progress, error } = await supabase
				.from('user_quest_progress')
				.insert({
					user_id,
					quest_id,
					current_value: progress_value,
					is_completed,
					completed_at,
				})
				.select()
				.single()

			if (error) {
				console.error('Error creating quest progress:', error)
				return NextResponse.json(
					{ error: 'Failed to create quest progress' },
					{ status: 500 },
				)
			}

			return NextResponse.json({
				progress,
				completed: is_completed,
				reward_points: is_completed ? quest.reward_points : 0,
			})
		}
	} catch (error) {
		console.error('Error in POST /api/quests/progress:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

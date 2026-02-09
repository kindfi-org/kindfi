import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * GET /api/quests
 * Get all active quests for the current user
 */
export async function GET(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()

		// Get all active quests
		const { data: quests, error } = await supabase
			.from('quest_definitions')
			.select('*')
			.eq('is_active', true)
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Error fetching quests:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch quests' },
				{ status: 500 },
			)
		}

		// Get user's progress for each quest
		const { data: progress, error: progressError } = await supabase
			.from('user_quest_progress')
			.select('*')
			.eq('user_id', session.user.id)

		if (progressError) {
			console.error('Error fetching quest progress:', progressError)
		}

		// Merge quests with user progress
		const questsWithProgress = quests?.map((quest) => {
			const userProgress = progress?.find((p) => p.quest_id === quest.quest_id)
			return {
				...quest,
				progress: userProgress || {
					current_value: 0,
					is_completed: false,
					completed_at: null,
				},
			}
		})

		return NextResponse.json({ quests: questsWithProgress || [] })
	} catch (error) {
		console.error('Error in GET /api/quests:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * POST /api/quests
 * Create a new quest (admin only)
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()

		// Check if user is admin
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', session.user.id)
			.single()

		if (profile?.role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const {
			quest_type,
			name,
			description,
			target_value,
			reward_points,
			expires_at,
			contract_address,
		} = body

		if (!quest_type || !name || !description || !target_value) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			)
		}

		// Get next quest_id (simple increment from max)
		const { data: maxQuest } = await supabase
			.from('quest_definitions')
			.select('quest_id')
			.order('quest_id', { ascending: false })
			.limit(1)
			.single()

		const quest_id = (maxQuest?.quest_id || 0) + 1

		const { data: quest, error } = await supabase
			.from('quest_definitions')
			.insert({
				quest_id,
				quest_type,
				name,
				description,
				target_value,
				reward_points: reward_points || 0,
				expires_at: expires_at || null,
				contract_address: contract_address || null,
				is_active: true,
			})
			.select()
			.single()

		if (error) {
			console.error('Error creating quest:', error)
			return NextResponse.json(
				{ error: 'Failed to create quest' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ quest }, { status: 201 })
	} catch (error) {
		console.error('Error in POST /api/quests:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

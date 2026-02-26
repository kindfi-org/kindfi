import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

const rateLimiter = new RateLimiter()
const QUEST_PROGRESS_ALLOWED_ROLES = ['service', 'recorder'] as const

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

		const rateLimitResult = await rateLimiter.increment(
			session.user.id,
			'quest_progress',
		)
		if (rateLimitResult.isBlocked) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
		}

		const userRole = session.user.role
		const isAllowedRole = userRole
			? QUEST_PROGRESS_ALLOWED_ROLES.includes(
					userRole as (typeof QUEST_PROGRESS_ALLOWED_ROLES)[number],
				)
			: false

		if (!isAllowedRole) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const { quest_id, progress_value, user_address } = body

		// Use session user_id to ensure RLS policies work correctly
		const user_id = session.user.id

		if (quest_id === undefined || progress_value === undefined) {
			return NextResponse.json(
				{ error: 'Missing required fields: quest_id, progress_value' },
				{ status: 400 },
			)
		}

		// Use service role client to bypass RLS, but ensure user_id matches session
		// This is necessary because these operations are triggered server-side after donations
		const { supabase: supabaseServiceRole } = await import(
			'@packages/lib/supabase'
		)
		const supabase = supabaseServiceRole

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

		// Get quest definition
		const { data: quest, error: questError } = await supabase
			.from('quest_definitions')
			.select('*')
			.eq('quest_id', quest_id)
			.single()

		if (questError || !quest) {
			return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
		}

		// Call smart contract if address is available and SOROBAN_PRIVATE_KEY is set
		let contractResult: {
			success: boolean
			completed?: boolean
			error?: string
		} | null = null

		console.log('[Quest API] Contract call conditions:', {
			hasStellarAddress: !!stellarAddress,
			hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
			stellarAddress: stellarAddress || 'N/A',
			questId: quest_id,
			progress_value,
		})

		if (stellarAddress && process.env.SOROBAN_PRIVATE_KEY) {
			try {
				const contractService = new GamificationContractService()
				const questContractAddress =
					quest.contract_address ||
					process.env.QUEST_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS

				console.log(
					'[Quest API] Quest contract address:',
					questContractAddress || 'NOT SET',
				)

				if (questContractAddress) {
					console.log('[Quest API] Calling quest contract...')
					contractResult = await contractService.updateQuestProgress(
						questContractAddress,
						{
							userAddress: stellarAddress,
							questId: quest_id,
							progressValue: progress_value,
						},
					)

					console.log('[Quest API] Contract call result:', contractResult)

					if (!contractResult.success) {
						console.error(
							'[Quest API] Failed to update quest progress on-chain:',
							contractResult.error,
						)
						// Continue with database update even if contract call fails
					} else {
						console.log(
							'[Quest API] Successfully updated quest progress on-chain',
						)
					}
				} else {
					console.warn('[Quest API] Quest contract address not configured')
				}
			} catch (error) {
				console.error('[Quest API] Error calling quest contract:', error)
				// Continue with database update even if contract call fails
			}
		} else {
			console.log(
				'[Quest API] Skipping contract call - missing requirements:',
				{
					hasStellarAddress: !!stellarAddress,
					hasSorobanKey: !!process.env.SOROBAN_PRIVATE_KEY,
				},
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
			return NextResponse.json({ error: 'Quest has expired' }, { status: 400 })
		}

		// Get or create progress (use maybeSingle to handle missing records)
		const { data: existingProgress, error: fetchError } = await supabase
			.from('user_quest_progress')
			.select('*')
			.eq('user_id', user_id)
			.eq('quest_id', quest_id)
			.maybeSingle()

		// If there's an error other than "not found", return it
		if (fetchError && fetchError.code !== 'PGRST116') {
			console.error('Error fetching quest progress:', fetchError)
			return NextResponse.json(
				{ error: 'Failed to fetch quest progress' },
				{ status: 500 },
			)
		}

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
		}

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
	} catch (error) {
		console.error('Error in POST /api/quests/progress:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Keypair } from '@stellar/stellar-sdk'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

/**
 * GET /api/quests
 * Get all active quests for the current user
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

		// Use service role client to bypass RLS — auth is handled by NextAuth session above
		const { supabase } = await import('@packages/lib/supabase')

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

		// Map quest_type from database enum to contract enum value
		const questTypeMap: Record<string, number> = {
			multi_region_donation: 0,
			weekly_streak: 1,
			multi_category_donation: 2,
			referral_quest: 3,
			total_donation_amount: 4,
			quest_master: 5,
		}

		const contractQuestType = questTypeMap[quest_type] ?? 4 // Default to total_donation_amount

		// Convert expires_at to Unix timestamp (0 for no expiration)
		const expiresAtUnix =
			expires_at && expires_at !== ''
				? Math.floor(new Date(expires_at).getTime() / 1000)
				: 0

		// Sync quest to on-chain contract
		let onChainResult: { success: boolean; questId?: number; error?: string } | null =
			null
		const questContractAddress =
			contract_address || process.env.QUEST_CONTRACT_ADDRESS

		if (questContractAddress) {
			try {
				console.log('[Quest API] Syncing quest to on-chain contract...')
				
				// Use admin private key if available, otherwise use recorder keypair
				// (assuming recorder has admin role granted)
				const adminPrivateKey =
					process.env.ADMIN_PRIVATE_KEY || process.env.SOROBAN_PRIVATE_KEY

				if (!adminPrivateKey) {
					console.warn(
						'[Quest API] No admin private key found. Quest created in database but not synced to chain.',
					)
				} else {
					const adminKeypair = Keypair.fromSecret(adminPrivateKey)
					const contractService = new GamificationContractService()

					onChainResult = await contractService.createQuest(
						questContractAddress,
						{
							questType: contractQuestType,
							name: quest.name,
							description: quest.description,
							targetValue: quest.target_value,
							rewardPoints: quest.reward_points || 0,
							expiresAt: expiresAtUnix,
						},
						adminKeypair,
					)

					if (onChainResult.success) {
						console.log(
							'[Quest API] Quest synced to on-chain successfully',
							onChainResult,
						)
					} else {
						console.error(
							'[Quest API] Failed to sync quest to on-chain:',
							onChainResult.error,
						)
					}
				}
			} catch (error) {
				console.error('[Quest API] Error syncing quest to on-chain:', error)
				// Don't fail the request if on-chain sync fails - quest is still in database
			}
		} else {
			console.warn(
				'[Quest API] No quest contract address configured. Quest created in database only.',
			)
		}

		return NextResponse.json(
			{
				quest,
				onChain: onChainResult
					? {
							synced: onChainResult.success,
							questId: onChainResult.questId,
							error: onChainResult.error,
						}
					: null,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Error in POST /api/quests:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

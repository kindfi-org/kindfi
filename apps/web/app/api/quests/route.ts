import { Keypair } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
import { createQuestSchema } from '~/lib/schemas/quest.schemas'
import { validateRequest } from '~/lib/utils/validation'

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
		const userId = session.user.id

		// Get all active quests, user's progress, and contribution count in parallel
		const [questsResult, progressResult, contributionsCountResult] =
			await Promise.all([
				supabase
					.from('quest_definitions')
					.select('*')
					.eq('is_active', true)
					.order('created_at', { ascending: false }),
				supabase
					.from('user_quest_progress')
					.select('*')
					.eq('user_id', userId),
				supabase
					.from('contributions')
					.select('id', { count: 'exact', head: true })
					.eq('contributor_id', userId),
			])

		const { data: quests, error } = questsResult
		const { data: progress, error: progressError } = progressResult
		const hasContributions = (contributionsCountResult.count ?? 0) > 0

		if (error) {
			console.error('Error fetching quests:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch quests' },
				{ status: 500 },
			)
		}

		if (progressError) {
			console.error('Error fetching quest progress:', progressError)
		}

		// Build a Map for O(1) lookup instead of O(n) Array.find
		const progressMap = new Map(progress?.map((p) => [p.quest_id, p]) ?? [])

		// Backfill quest progress for donation-related quests when the user has
		// contributions but no progress records (e.g. earlier failures prevented writes).
		const donationQuestTypes = [
			'total_donation_amount',
			'multi_region_donation',
			'multi_category_donation',
		]
		const questsMissingProgress = (quests ?? []).filter(
			(q) =>
				donationQuestTypes.includes(q.quest_type) &&
				!progressMap.has(q.quest_id),
		)

		if (hasContributions && questsMissingProgress.length > 0) {
			try {
				await syncQuestProgress(supabase, userId, questsMissingProgress, progressMap)
			} catch (syncErr) {
				console.error('[Quests] Error syncing quest progress:', syncErr)
			}
		}

		// Resolve quest contract address (DB field or env fallback)
		const fallbackQuestContract =
			process.env.QUEST_CONTRACT_ADDRESS ||
			process.env.NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS ||
			null

		// Merge quests with user progress and resolved contract address
		const questsWithProgress = quests?.map((quest) => {
			const userProgress = progressMap.get(quest.quest_id)
			return {
				...quest,
				contract_address: quest.contract_address || fallbackQuestContract,
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
		const validation = validateRequest(createQuestSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const {
			quest_type,
			name,
			description,
			target_value,
			reward_points,
			expires_at,
			contract_address,
		} = validation.data

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
		let onChainResult: {
			success: boolean
			questId?: number
			error?: string
		} | null = null
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

/**
 * Backfill missing quest progress from existing contributions.
 * Mutates progressMap in-place so the caller can use the updated values.
 */
async function syncQuestProgress(
	supabase: Awaited<typeof import('@packages/lib/supabase')>['supabase'],
	userId: string,
	missingQuests: Array<{ quest_id: number; quest_type: string; target_value: number }>,
	progressMap: Map<number, Record<string, unknown>>,
) {
	const questTypes = new Set(missingQuests.map((q) => q.quest_type))

	// Fetch contribution data needed for each quest type in parallel
	const [amountResult, categoryResult] = await Promise.all([
		questTypes.has('total_donation_amount')
			? supabase
					.from('contributions')
					.select('amount')
					.eq('contributor_id', userId)
			: Promise.resolve({ data: null }),
		questTypes.has('multi_category_donation') || questTypes.has('multi_region_donation')
			? supabase
					.from('contributions')
					.select('project_id, projects!inner(category_id)')
					.eq('contributor_id', userId)
			: Promise.resolve({ data: null }),
	])

	for (const quest of missingQuests) {
		let progressValue = 0

		if (quest.quest_type === 'total_donation_amount' && amountResult.data) {
			progressValue = Math.floor(
				amountResult.data.reduce(
					(sum, c) => sum + Number(c.amount || 0),
					0,
				),
			)
		} else if (
			(quest.quest_type === 'multi_category_donation' ||
				quest.quest_type === 'multi_region_donation') &&
			categoryResult.data
		) {
			progressValue =
				categoryResult.data.filter(
					(p, index, self) =>
						index ===
						self.findIndex(
							(pr) => pr.projects?.category_id === p.projects?.category_id,
						),
				).length || 0
		}

		if (progressValue <= 0) continue

		const is_completed = progressValue >= quest.target_value
		const completed_at = is_completed ? new Date().toISOString() : null

		const { data: inserted, error } = await supabase
			.from('user_quest_progress')
			.insert({
				user_id: userId,
				quest_id: quest.quest_id,
				current_value: progressValue,
				is_completed,
				completed_at,
			})
			.select()
			.single()

		if (error) {
			console.error(
				`[Quests] Failed to backfill progress for quest ${quest.quest_id}:`,
				error,
			)
			continue
		}

		if (inserted) {
			progressMap.set(quest.quest_id, inserted)
			console.log(
				`[Quests] Backfilled quest ${quest.quest_id}: ${progressValue}/${quest.target_value} (completed: ${is_completed})`,
			)
		}
	}
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createQuestSchema } from '~/lib/schemas/quest.schemas'
import {
	ensureAllQuestDefinitionsOnChain,
	getAdminKeypair,
	QUEST_TYPE_TO_CONTRACT,
	type QuestDefinitionRow,
	questExpiresAtUnix,
	syncQuestProgressOnChain,
} from '~/lib/services/quest-chain-sync.service'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
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
		const [questsResult, progressResult, contributionsCountResult] = await Promise.all([
			supabase
				.from('quest_definitions')
				.select('*')
				.eq('is_active', true)
				.order('created_at', { ascending: false }),
			supabase.from('user_quest_progress').select('*').eq('user_id', userId),
			supabase
				.from('contributions')
				.select('id', { count: 'exact', head: true })
				.eq('contributor_id', userId),
		])

		const { data: quests, error } = questsResult
		const { data: progress, error: progressError } = progressResult
		const hasContributions = (contributionsCountResult.count ?? 0) > 0

		if (error) {
			logger.error('Error fetching quests:', error)
			return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
		}

		if (progressError) {
			logger.error('Error fetching quest progress:', progressError)
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
			(q) => donationQuestTypes.includes(q.quest_type) && !progressMap.has(q.quest_id),
		)

		if (hasContributions && questsMissingProgress.length > 0) {
			try {
				await syncQuestProgress(
					supabase,
					userId,
					questsMissingProgress as QuestDefinitionRow[],
					progressMap,
					quests ?? [],
				)
			} catch (syncErr) {
				logger.error('[Quests] Error syncing quest progress:', syncErr)
			}
		}

		// Resolve quest contract address (DB field or env fallback)
		const fallbackQuestContract =
			process.env.QUEST_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS || null

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
		logger.error('Error in GET /api/quests:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

		const questContractAddress = contract_address || process.env.QUEST_CONTRACT_ADDRESS
		const adminKeypair = getAdminKeypair()
		const contractService = new GamificationContractService()

		// Keep on-chain quest IDs aligned with existing DB rows before creating a new quest
		const { data: existingQuests } = await supabase
			.from('quest_definitions')
			.select('*')
			.order('quest_id', { ascending: true })

		if (questContractAddress && adminKeypair && existingQuests?.length) {
			const syncResult = await ensureAllQuestDefinitionsOnChain(
				contractService,
				questContractAddress,
				existingQuests,
				adminKeypair,
			)
			if (!syncResult.success) {
				logger.error('[Quest API] Failed to sync existing quests to chain:', syncResult.error)
			}
		}

		const contractQuestType = QUEST_TYPE_TO_CONTRACT[quest_type] ?? 4
		const expiresAtUnix = questExpiresAtUnix(expires_at || null)

		// Create on-chain first so quest_id matches the contract counter
		let onChainResult: {
			success: boolean
			questId?: number
			error?: string
		} | null = null
		let quest_id = ((existingQuests?.[existingQuests.length - 1]?.quest_id ?? 0) as number) + 1

		if (questContractAddress && adminKeypair) {
			try {
				onChainResult = await contractService.createQuest(
					questContractAddress,
					{
						questType: contractQuestType,
						name,
						description,
						targetValue: target_value,
						rewardPoints: reward_points || 0,
						expiresAt: expiresAtUnix,
					},
					adminKeypair,
				)

				if (onChainResult.success && onChainResult.questId !== undefined) {
					quest_id = onChainResult.questId
				} else if (!onChainResult.success) {
					logger.error('[Quest API] Failed to sync quest to on-chain:', onChainResult.error)
				}
			} catch (error) {
				logger.error('[Quest API] Error syncing quest to on-chain:', error)
				onChainResult = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		} else if (questContractAddress && !adminKeypair) {
			logger.warn(
				'[Quest API] No admin private key found. Quest will use DB-only quest_id assignment.',
			)
		} else {
			logger.warn(
				'[Quest API] No quest contract address configured. Quest created in database only.',
			)
		}

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
			logger.error('Error creating quest:', error)
			return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 })
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
		logger.error('Error in POST /api/quests:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

/**
 * Backfill missing quest progress from existing contributions.
 * Mutates progressMap in-place so the caller can use the updated values.
 */
async function syncQuestProgress(
	supabase: Awaited<typeof import('@packages/lib/supabase')>['supabase'],
	userId: string,
	missingQuests: QuestDefinitionRow[],
	progressMap: Map<number, Record<string, unknown>>,
	allQuests: QuestDefinitionRow[],
) {
	const questTypes = new Set(missingQuests.map((q) => q.quest_type))
	const dbQuestsById = new Map(allQuests.map((quest) => [quest.quest_id, quest]))

	// Fetch contribution data needed for each quest type in parallel
	const [amountResult, categoryResult, stellarAddress] = await Promise.all([
		questTypes.has('total_donation_amount')
			? supabase.from('contributions').select('amount').eq('contributor_id', userId)
			: Promise.resolve({ data: null }),
		questTypes.has('multi_category_donation') || questTypes.has('multi_region_donation')
			? supabase
					.from('contributions')
					.select('project_id, projects!inner(category_id)')
					.eq('contributor_id', userId)
			: Promise.resolve({ data: null }),
		resolveUserStellarAddress(supabase, userId, {}),
	])

	for (const quest of missingQuests) {
		let progressValue = 0

		if (quest.quest_type === 'total_donation_amount' && amountResult.data) {
			progressValue = Math.floor(
				amountResult.data.reduce((sum, c) => sum + Number(c.amount || 0), 0),
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
						self.findIndex((pr) => pr.projects[0].category_id === p.projects[0].category_id),
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
			logger.error(`[Quests] Failed to backfill progress for quest ${quest.quest_id}:`, error)
			continue
		}

		if (inserted) {
			progressMap.set(quest.quest_id, inserted)
		}

		if (stellarAddress && process.env.SOROBAN_PRIVATE_KEY) {
			try {
				const chainResult = await syncQuestProgressOnChain({
					quest,
					userAddress: stellarAddress,
					questId: quest.quest_id,
					progressValue,
					dbQuestsById,
				})

				if (chainResult && !chainResult.success) {
					logger.error(
						`[Quests] Failed to backfill on-chain progress for quest ${quest.quest_id}:`,
						chainResult.error,
					)
				}
			} catch (chainError) {
				logger.error(
					`[Quests] Error backfilling on-chain progress for quest ${quest.quest_id}:`,
					chainError,
				)
			}
		}
	}
}

import type { TypedSupabaseClient } from '@packages/lib/types'
import { logger } from '@/lib/logger'
import {
	type QuestDefinitionRow,
	syncQuestProgressOnChain,
} from '~/lib/services/quest-chain-sync.service'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'

const DONATION_QUEST_TYPES = [
	'total_donation_amount',
	'multi_region_donation',
	'multi_category_donation',
] as const

export type QuestProgressBackfillResult = {
	userId: string
	stellarAddress: string | null
	questsUpdated: number
	questsSkipped: number
	chainSynced: number
	chainFailed: number
	errors: string[]
}

function computeProgressValue(
	quest: Pick<QuestDefinitionRow, 'quest_type'>,
	amountRows: Array<{ amount: number | string | null }> | null,
	categoryRows: Array<{ projects: { category_id: string } }> | null,
): number {
	if (quest.quest_type === 'total_donation_amount' && amountRows) {
		return Math.floor(amountRows.reduce((sum, row) => sum + Number(row.amount || 0), 0))
	}

	if (
		(quest.quest_type === 'multi_category_donation' ||
			quest.quest_type === 'multi_region_donation') &&
		categoryRows
	) {
		return categoryRows.filter((row, index, self) => {
			const categoryId = row.projects?.category_id
			return index === self.findIndex((other) => other.projects?.category_id === categoryId)
		}).length
	}

	return 0
}

/**
 * Recompute donation quest progress from contributions and upsert DB + on-chain state.
 * Use after fixing quest contract sync or for users who donated before progress was recorded.
 */
export async function backfillDonationQuestProgressForUser(
	supabase: TypedSupabaseClient,
	userId: string,
	options: { syncChain?: boolean } = {},
): Promise<QuestProgressBackfillResult> {
	const syncChain = options.syncChain ?? Boolean(process.env.SOROBAN_PRIVATE_KEY)
	const result: QuestProgressBackfillResult = {
		userId,
		stellarAddress: null,
		questsUpdated: 0,
		questsSkipped: 0,
		chainSynced: 0,
		chainFailed: 0,
		errors: [],
	}

	const [questsResult, stellarAddress] = await Promise.all([
		supabase
			.from('quest_definitions')
			.select('*')
			.eq('is_active', true)
			.in('quest_type', [...DONATION_QUEST_TYPES])
			.order('quest_id', { ascending: true }),
		resolveUserStellarAddress(supabase, userId, {}),
	])

	result.stellarAddress = stellarAddress

	const quests = questsResult.data ?? []
	if (questsResult.error) {
		result.errors.push(questsResult.error.message)
		return result
	}

	if (quests.length === 0) {
		return result
	}

	const questTypes = new Set(quests.map((quest) => quest.quest_type))
	const dbQuestsById = new Map(quests.map((quest) => [quest.quest_id, quest]))

	const [amountResult, categoryResult] = await Promise.all([
		questTypes.has('total_donation_amount')
			? supabase.from('contributions').select('amount').eq('contributor_id', userId)
			: Promise.resolve({ data: null, error: null }),
		questTypes.has('multi_category_donation') || questTypes.has('multi_region_donation')
			? supabase
					.from('contributions')
					.select('project_id, projects!inner(category_id)')
					.eq('contributor_id', userId)
			: Promise.resolve({ data: null, error: null }),
	])

	if (amountResult.error) {
		result.errors.push(amountResult.error.message)
	}
	if (categoryResult.error) {
		result.errors.push(categoryResult.error.message)
	}

	for (const quest of quests) {
		const progressValue = computeProgressValue(quest, amountResult.data, categoryResult.data)

		if (progressValue <= 0) {
			result.questsSkipped++
			continue
		}

		const is_completed = progressValue >= quest.target_value
		const completed_at = is_completed ? new Date().toISOString() : null

		const { data: existing } = await supabase
			.from('user_quest_progress')
			.select('id, current_value, is_completed')
			.eq('user_id', userId)
			.eq('quest_id', quest.quest_id)
			.maybeSingle()

		if (
			existing &&
			existing.current_value === progressValue &&
			existing.is_completed === is_completed
		) {
			// Still attempt chain sync — DB may be correct while chain was never updated
			if (syncChain && stellarAddress) {
				const chainResult = await syncQuestProgressOnChain({
					quest,
					userAddress: stellarAddress,
					questId: quest.quest_id,
					progressValue,
					dbQuestsById,
				})
				if (chainResult?.success) {
					result.chainSynced++
				} else if (chainResult && !chainResult.success) {
					result.chainFailed++
					result.errors.push(`Quest ${quest.quest_id} chain: ${chainResult.error}`)
				}
			}
			result.questsSkipped++
			continue
		}

		const upsertPayload = {
			user_id: userId,
			quest_id: quest.quest_id,
			current_value: progressValue,
			is_completed,
			completed_at,
			updated_at: new Date().toISOString(),
		}

		const dbWrite = existing
			? await supabase
					.from('user_quest_progress')
					.update(upsertPayload)
					.eq('user_id', userId)
					.eq('quest_id', quest.quest_id)
			: await supabase.from('user_quest_progress').insert(upsertPayload)

		if (dbWrite.error) {
			result.errors.push(`Quest ${quest.quest_id} DB: ${dbWrite.error.message}`)
			continue
		}

		result.questsUpdated++

		if (syncChain && stellarAddress) {
			const chainResult = await syncQuestProgressOnChain({
				quest,
				userAddress: stellarAddress,
				questId: quest.quest_id,
				progressValue,
				dbQuestsById,
			})

			if (chainResult?.success) {
				result.chainSynced++
			} else if (chainResult && !chainResult.success) {
				result.chainFailed++
				result.errors.push(`Quest ${quest.quest_id} chain: ${chainResult.error}`)
			}
		} else if (syncChain && !stellarAddress) {
			result.errors.push(`Quest ${quest.quest_id}: no Stellar address for user`)
		}
	}

	return result
}

/** Distinct contributor IDs who have at least one contribution. */
export async function listContributorIdsWithDonations(
	supabase: TypedSupabaseClient,
	limit = 500,
): Promise<string[]> {
	const { data, error } = await supabase
		.from('contributions')
		.select('contributor_id')
		.not('contributor_id', 'is', null)
		.limit(limit * 10)

	if (error) {
		logger.error('[QuestProgressBackfill] Failed to list contributors:', error)
		return []
	}

	const unique = [...new Set((data ?? []).map((row) => row.contributor_id).filter(Boolean))]
	return unique.slice(0, limit)
}

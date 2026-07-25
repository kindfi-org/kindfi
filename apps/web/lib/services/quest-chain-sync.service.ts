import type { Tables } from '@services/supabase'
import { Keypair } from '@stellar/stellar-sdk'
import { logger } from '@/lib/logger'
import {
	GamificationContractService,
	type GamificationTxResult,
} from '~/lib/stellar/gamification-contracts'

export type QuestDefinitionRow = Tables<'quest_definitions'>

export const QUEST_TYPE_TO_CONTRACT: Record<string, number> = {
	multi_region_donation: 0,
	weekly_streak: 1,
	multi_category_donation: 2,
	referral_quest: 3,
	total_donation_amount: 4,
	quest_master: 5,
}

export function resolveQuestContractAddress(
	quest?: Pick<QuestDefinitionRow, 'contract_address'> | null,
): string | null {
	return (
		quest?.contract_address ||
		process.env.QUEST_CONTRACT_ADDRESS ||
		process.env.NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS ||
		null
	)
}

export function isMainnetNetwork(): boolean {
	const passphrase = process.env.STELLAR_NETWORK_PASSPHRASE || process.env.NETWORK_PASSPHRASE || ''
	return passphrase.includes('Public Global')
}

/** Admin key for contract writes. On mainnet, prefer ADMIN_PRIVATE_KEY over testnet funding key. */
export function getAdminKeypair(): Keypair | null {
	const candidates = isMainnetNetwork()
		? [
				process.env.ADMIN_PRIVATE_KEY,
				process.env.MAINNET_ADMIN_PRIVATE_KEY,
				process.env.STELLAR_FUNDING_SECRET_KEY,
				process.env.SOROBAN_PRIVATE_KEY,
			]
		: [
				process.env.STELLAR_FUNDING_SECRET_KEY,
				process.env.ADMIN_PRIVATE_KEY,
				process.env.SOROBAN_PRIVATE_KEY,
			]

	const adminPrivateKey = candidates.find((value) => Boolean(value))
	if (!adminPrivateKey) return null
	return Keypair.fromSecret(adminPrivateKey)
}

export function questExpiresAtUnix(expiresAt: string | null): number {
	if (!expiresAt) return 0
	return Math.floor(new Date(expiresAt).getTime() / 1000)
}

/** Map Soroban contract error codes from quest/src/errors.rs to readable messages. */
export function parseQuestContractError(error?: string): string | undefined {
	if (!error) return undefined

	if (error.includes('Error(Contract, #3)') || error.includes('"failing with contract error", 3')) {
		return 'Quest not found on-chain. The quest definition must be synced to the Quest contract before updating progress.'
	}
	if (error.includes('Error(Contract, #2000)')) {
		return 'Unauthorized: the admin account needs the "admin" role on the Quest contract (Error #2000).'
	}
	if (error.includes('Error(Contract, #2)')) {
		return 'Unauthorized: the server account needs the "recorder" role on the Quest contract.'
	}
	if (error.includes('Error(Contract, #5)')) {
		return 'Quest has expired on-chain.'
	}
	if (error.includes('Error(Contract, #6)')) {
		return 'Quest is not active on-chain.'
	}

	return undefined
}

function buildCreateQuestParams(quest: QuestDefinitionRow) {
	return {
		questType: QUEST_TYPE_TO_CONTRACT[quest.quest_type] ?? 4,
		name: quest.name,
		description: quest.description,
		targetValue: quest.target_value,
		rewardPoints: quest.reward_points || 0,
		expiresAt: questExpiresAtUnix(quest.expires_at),
	}
}

async function createQuestOnChainFromDefinition(
	contractService: GamificationContractService,
	contractAddress: string,
	quest: QuestDefinitionRow,
	adminKeypair: Keypair,
) {
	return contractService.createQuest(contractAddress, buildCreateQuestParams(quest), adminKeypair)
}

async function createPlaceholderQuestOnChain(
	contractService: GamificationContractService,
	contractAddress: string,
	questId: number,
	adminKeypair: Keypair,
) {
	return contractService.createQuest(
		contractAddress,
		{
			questType: 4,
			name: `Sync placeholder ${questId}`,
			description: 'System placeholder to align on-chain quest IDs with the database',
			targetValue: 999_999,
			rewardPoints: 0,
			expiresAt: 0,
		},
		adminKeypair,
	)
}

export async function getHighestQuestIdOnChain(
	contractService: GamificationContractService,
	contractAddress: string,
	upToId: number,
): Promise<number> {
	let maxId = 0
	for (let id = 1; id <= upToId; id++) {
		if (await contractService.questExistsOnChain(contractAddress, id)) {
			maxId = id
		}
	}
	return maxId
}

/**
 * Ensure a DB quest exists on-chain at the same quest_id.
 *
 * The Quest contract assigns sequential IDs via an internal counter. When DB and
 * chain drift (e.g. quests 4–6 exist in DB but only 1–3 on-chain), this fills
 * gaps by creating missing definitions (or placeholders) until the target ID exists.
 */
export async function ensureQuestDefinitionOnChain(
	contractService: GamificationContractService,
	contractAddress: string,
	questDefinition: QuestDefinitionRow,
	adminKeypair: Keypair,
	dbQuestsById?: Map<number, QuestDefinitionRow>,
): Promise<{ success: boolean; error?: string }> {
	const exists = await contractService.questExistsOnChain(contractAddress, questDefinition.quest_id)
	if (exists) return { success: true }

	const targetId = questDefinition.quest_id
	let maxOnChain = await getHighestQuestIdOnChain(contractService, contractAddress, targetId)

	while (maxOnChain < targetId) {
		const nextId = maxOnChain + 1

		if (await contractService.questExistsOnChain(contractAddress, nextId)) {
			maxOnChain = nextId
			continue
		}

		const dbQuest = dbQuestsById?.get(nextId)

		const createResult = dbQuest
			? await createQuestOnChainFromDefinition(
					contractService,
					contractAddress,
					dbQuest,
					adminKeypair,
				)
			: await createPlaceholderQuestOnChain(contractService, contractAddress, nextId, adminKeypair)

		if (!createResult.success) {
			const friendly = parseQuestContractError(createResult.error)
			return {
				success: false,
				error: friendly || createResult.error || `Failed to create on-chain quest ${nextId}`,
			}
		}

		const updatedMax = await getHighestQuestIdOnChain(contractService, contractAddress, targetId)
		if (updatedMax <= maxOnChain) {
			if (await contractService.questExistsOnChain(contractAddress, nextId)) {
				maxOnChain = nextId
				continue
			}

			return {
				success: false,
				error: `create_quest did not advance on-chain counter (stuck at ${maxOnChain}, tx: ${createResult.txHash ?? 'unknown'})`,
			}
		}

		maxOnChain = updatedMax
	}

	const targetExists = await contractService.questExistsOnChain(
		contractAddress,
		questDefinition.quest_id,
	)
	if (!targetExists) {
		return {
			success: false,
			error: `Quest ${questDefinition.quest_id} still missing on-chain after sync`,
		}
	}

	return { success: true }
}

/** Sync all DB quest definitions to chain in ascending quest_id order. */
export async function ensureAllQuestDefinitionsOnChain(
	contractService: GamificationContractService,
	contractAddress: string,
	quests: QuestDefinitionRow[],
	adminKeypair: Keypair,
): Promise<{ success: boolean; error?: string }> {
	const byId = new Map(quests.map((quest) => [quest.quest_id, quest]))

	for (const quest of quests) {
		const result = await ensureQuestDefinitionOnChain(
			contractService,
			contractAddress,
			quest,
			adminKeypair,
			byId,
		)
		if (!result.success) return result
	}

	return { success: true }
}

/**
 * Ensure quest definition exists on-chain, then record user progress.
 * Returns null when chain sync is skipped (missing env/config).
 */
export async function syncQuestProgressOnChain(params: {
	quest: QuestDefinitionRow
	userAddress: string
	questId: number
	progressValue: number
	contractService?: GamificationContractService
	dbQuestsById?: Map<number, QuestDefinitionRow>
}): Promise<GamificationTxResult<{ completed?: boolean }> | null> {
	if (!process.env.SOROBAN_PRIVATE_KEY) {
		return null
	}

	const contractAddress = resolveQuestContractAddress(params.quest)
	if (!contractAddress) {
		logger.warn('[QuestChainSync] Quest contract address not configured')
		return null
	}

	const contractService = params.contractService ?? new GamificationContractService()
	const adminKeypair = getAdminKeypair()

	if (adminKeypair) {
		const ensureResult = await ensureQuestDefinitionOnChain(
			contractService,
			contractAddress,
			params.quest,
			adminKeypair,
			params.dbQuestsById,
		)
		if (!ensureResult.success) {
			logger.error('[QuestChainSync] Failed to ensure quest on-chain:', ensureResult.error)
			return {
				success: false,
				error: ensureResult.error,
			}
		}
	}

	const result = await contractService.updateQuestProgress(contractAddress, {
		userAddress: params.userAddress,
		questId: params.questId,
		progressValue: params.progressValue,
	})

	if (!result.success) {
		const friendly = parseQuestContractError(result.error)
		if (friendly) {
			return { ...result, error: friendly }
		}
	}

	return result
}

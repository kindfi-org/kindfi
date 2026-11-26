import { describe, expect, test } from 'bun:test'
import { Keypair, StrKey } from '@stellar/stellar-sdk'
import {
	ensureQuestDefinitionOnChain,
	getHighestQuestIdOnChain,
	type QuestDefinitionRow,
} from '../lib/services/quest-chain-sync.service'
import type { GamificationContractService } from '../lib/stellar/gamification-contracts'
import type { ContractReadResult, QuestDefinition } from '../lib/stellar/gamification-reads'
import type { GamificationTxResult } from '../lib/stellar/gamification-writes'

const CONTRACT = StrKey.encodeContract(Keypair.random().rawPublicKey())
const ADMIN = Keypair.random()

function questRow(questId: number): QuestDefinitionRow {
	return {
		quest_id: questId,
		quest_type: 'total_donation_amount',
		name: `Quest ${questId}`,
		description: 'Test quest',
		target_value: 10,
		reward_points: 5,
		expires_at: null,
		contract_address: CONTRACT,
	} as unknown as QuestDefinitionRow
}

function questDef(questId: number): QuestDefinition {
	return {
		quest_id: questId,
		quest_type: 4,
		name: `Quest ${questId}`,
		description: 'Test quest',
		target_value: 10,
		reward_points: 5,
		expires_at: 0,
		is_active: true,
	}
}

/**
 * Fake contract service: getQuest answers from a mutable set of existing
 * ids (plus an error set), createQuest adds the next sequential id.
 */
function makeFakeService(): {
	service: GamificationContractService
	existing: Set<number>
	errorIds: Set<number>
	created: number[]
} {
	const existing = new Set<number>()
	const errorIds = new Set<number>()
	const created: number[] = []
	// Typed against the production `getQuest` contract, so a fake response
	// that drifts from `ContractReadResult<QuestDefinition>` fails here
	// instead of silently passing the sync code a wrong shape.
	const reads: Pick<GamificationContractService['reads'], 'getQuest'> = {
		getQuest: async (
			_contractAddress: string,
			questId: number,
		): Promise<ContractReadResult<QuestDefinition>> => {
			if (errorIds.has(questId)) return { status: 'error', error: 'RPC down' }
			if (existing.has(questId)) return { status: 'found', value: questDef(questId) }
			return { status: 'not_found' }
		},
	}
	const createQuest = async (
		_contractAddress: string,
		_params: unknown,
		_admin: Keypair,
	): Promise<GamificationTxResult<{ questId?: number }>> => {
		const nextId = existing.size === 0 ? 1 : Math.max(...existing) + 1
		existing.add(nextId)
		created.push(nextId)
		return { success: true, txHash: 'aabbccdd' }
	}
	const service = { reads, createQuest } as unknown as GamificationContractService
	return { service, existing, errorIds, created }
}

describe('quest chain sync — RPC failure is never treated as absence', () => {
	test('an RPC error on the presence check fails without creating anything', async () => {
		const fake = makeFakeService()
		fake.existing.add(1)
		fake.errorIds.add(1)
		const result = await ensureQuestDefinitionOnChain(fake.service, CONTRACT, questRow(1), ADMIN)
		expect(result.success).toBe(false)
		expect(result.error).toContain('Could not verify quest 1')
		expect(fake.created).toEqual([])
	})

	test('a missing quest is created once, then the target is found', async () => {
		const fake = makeFakeService()
		fake.existing.add(1)
		const byId = new Map([[2, questRow(2)]])
		const result = await ensureQuestDefinitionOnChain(
			fake.service,
			CONTRACT,
			questRow(2),
			ADMIN,
			byId,
		)
		expect(result).toEqual({ success: true })
		expect(fake.created).toEqual([2])
	})

	test('an existing quest is skipped without creating', async () => {
		const fake = makeFakeService()
		fake.existing.add(1)
		fake.existing.add(2)
		const result = await ensureQuestDefinitionOnChain(fake.service, CONTRACT, questRow(2), ADMIN)
		expect(result).toEqual({ success: true })
		expect(fake.created).toEqual([])
	})

	test('getHighestQuestIdOnChain reports the RPC error instead of a silent 0', async () => {
		const fake = makeFakeService()
		fake.existing.add(1)
		fake.errorIds.add(2)
		const result = await getHighestQuestIdOnChain(fake.service, CONTRACT, 3)
		expect(result).toEqual({ success: false, error: 'RPC down' })
	})

	test('getHighestQuestIdOnChain counts existing quests when reads succeed', async () => {
		const fake = makeFakeService()
		fake.existing.add(1)
		fake.existing.add(2)
		const result = await getHighestQuestIdOnChain(fake.service, CONTRACT, 3)
		expect(result).toEqual({ success: true, maxId: 2 })
	})
})

import { describe, expect, test } from 'bun:test'
import { Keypair, nativeToScVal, StrKey, xdr } from '@stellar/stellar-sdk'
import {
	GamificationContractReads,
	type GamificationRpcClient,
} from '../lib/stellar/gamification-reads'

const CONTRACT = StrKey.encodeContract(Keypair.random().rawPublicKey())
const REFERRER = Keypair.random().publicKey()

function questMapScVal(questId: number): xdr.ScVal {
	return xdr.ScVal.scvMap([
		new xdr.ScMapEntry({
			key: nativeToScVal('quest_id', { type: 'symbol' }),
			val: nativeToScVal(questId, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('quest_type', { type: 'symbol' }),
			val: nativeToScVal(1, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('name', { type: 'symbol' }),
			val: nativeToScVal('Weekly streak', { type: 'string' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('description', { type: 'symbol' }),
			val: nativeToScVal('Donate weekly', { type: 'string' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('target_value', { type: 'symbol' }),
			val: nativeToScVal(4, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('reward_points', { type: 'symbol' }),
			val: nativeToScVal(50, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('expires_at', { type: 'symbol' }),
			val: nativeToScVal(BigInt(0), { type: 'u64' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('is_active', { type: 'symbol' }),
			val: nativeToScVal(true),
		}),
	])
}

function referrerStatsMapScVal(): xdr.ScVal {
	return xdr.ScVal.scvMap([
		new xdr.ScMapEntry({
			key: nativeToScVal('total_referrals', { type: 'symbol' }),
			val: nativeToScVal(3, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('active_referrals', { type: 'symbol' }),
			val: nativeToScVal(2, { type: 'u32' }),
		}),
		new xdr.ScMapEntry({
			key: nativeToScVal('total_reward_points', { type: 'symbol' }),
			val: nativeToScVal(120, { type: 'u32' }),
		}),
	])
}

function makeReads(
	simulateTransaction: (tx: unknown) => Promise<unknown>,
): GamificationContractReads {
	const keypair = Keypair.random()
	const server = {
		getAccount: async () => ({
			accountId: () => keypair.publicKey(),
			sequenceNumber: () => '1',
		}),
		simulateTransaction,
	}
	const client = {
		server,
		networkPassphrase: 'Test SDF Network ; September 2015',
		recorderKeypair: keypair,
	} as unknown as GamificationRpcClient
	return new GamificationContractReads(client)
}

describe('gamification reads — typed missing values', () => {
	test('getQuest returns not_found when the contract returns Option::None', async () => {
		const reads = makeReads(async () => ({
			result: { retval: xdr.ScVal.scvVoid() },
		}))
		expect(await reads.getQuest(CONTRACT, 99)).toEqual({ status: 'not_found' })
	})

	test('getQuest returns not_found when the simulation carries no return value', async () => {
		const reads = makeReads(async () => ({ result: {} }))
		expect(await reads.getQuest(CONTRACT, 99)).toEqual({ status: 'not_found' })
	})

	test('getQuest returns found with the decoded definition', async () => {
		const reads = makeReads(async () => ({
			result: { retval: questMapScVal(3) },
		}))
		const result = await reads.getQuest(CONTRACT, 3)
		expect(result).toEqual({
			status: 'found',
			value: {
				quest_id: 3,
				quest_type: 1,
				name: 'Weekly streak',
				description: 'Donate weekly',
				target_value: 4,
				reward_points: 50,
				expires_at: 0,
				is_active: true,
			},
		})
	})

	test('getQuest returns error when the simulation fails', async () => {
		const reads = makeReads(async () => ({ error: 'simulation failed' }))
		const result = await reads.getQuest(CONTRACT, 1)
		expect(result.status).toBe('error')
		if (result.status === 'error') {
			expect(result.error).toContain('simulation failed')
		}
	})

	test('getQuest returns error (not not_found) when RPC throws', async () => {
		const reads = makeReads(async () => {
			throw new Error('RPC down')
		})
		const result = await reads.getQuest(CONTRACT, 1)
		expect(result).toEqual({ status: 'error', error: 'RPC down' })
	})

	test('getReferrerStatistics returns not_found for a new referrer, not zero stats', async () => {
		const reads = makeReads(async () => ({
			result: { retval: xdr.ScVal.scvVoid() },
		}))
		expect(await reads.getReferrerStatistics(CONTRACT, REFERRER)).toEqual({
			status: 'not_found',
		})
	})

	test('getReferrerStatistics returns found with decoded totals', async () => {
		const reads = makeReads(async () => ({
			result: { retval: referrerStatsMapScVal() },
		}))
		expect(await reads.getReferrerStatistics(CONTRACT, REFERRER)).toEqual({
			status: 'found',
			value: { total_referrals: 3, active_referrals: 2, total_reward_points: 120 },
		})
	})

	test('hasRole returns found(false) for None and found(true) for Some', async () => {
		const notGranted = makeReads(async () => ({
			result: { retval: xdr.ScVal.scvVoid() },
		}))
		expect(await notGranted.hasRole(CONTRACT, REFERRER, 'recorder')).toEqual({
			status: 'found',
			value: false,
		})

		const granted = makeReads(async () => ({
			result: { retval: nativeToScVal(0, { type: 'u32' }) },
		}))
		expect(await granted.hasRole(CONTRACT, REFERRER, 'recorder')).toEqual({
			status: 'found',
			value: true,
		})
	})

	test('hasRole returns error when RPC throws', async () => {
		const reads = makeReads(async () => {
			throw new Error('RPC down')
		})
		expect(await reads.hasRole(CONTRACT, REFERRER, 'recorder')).toEqual({
			status: 'error',
			error: 'RPC down',
		})
	})

	test('getMaxQuestId returns error, not 0, when RPC fails', async () => {
		const reads = makeReads(async () => {
			throw new Error('RPC down')
		})
		expect(await reads.getMaxQuestId(CONTRACT)).toEqual({
			status: 'error',
			error: 'RPC down',
			lastConfirmedId: 0,
		})
	})

	test('getMaxQuestId keeps the last confirmed id when a later lookup fails', async () => {
		let calls = 0
		const reads = makeReads(async () => {
			calls++
			if (calls === 1) return { result: { retval: questMapScVal(1) } }
			throw new Error('RPC down')
		})
		expect(await reads.getMaxQuestId(CONTRACT)).toEqual({
			status: 'error',
			error: 'RPC down',
			lastConfirmedId: 1,
		})
	})

	test('getQuest returns error (not a throw) when the quest id cannot be encoded', async () => {
		const reads = makeReads(async () => ({ result: {} }))
		const result = await reads.getQuest(CONTRACT, -1)
		expect(result.status).toBe('error')
	})

	test('getReferrerStatistics returns error (not a throw) for an invalid address', async () => {
		const reads = makeReads(async () => ({ result: {} }))
		const result = await reads.getReferrerStatistics(CONTRACT, 'not-an-address')
		expect(result.status).toBe('error')
	})

	test('getMaxQuestId counts existing quests and stops at the first missing id', async () => {
		let calls = 0
		const reads = makeReads(async () => {
			calls++
			return calls <= 2
				? { result: { retval: questMapScVal(calls) } }
				: { result: { retval: xdr.ScVal.scvVoid() } }
		})
		expect(await reads.getMaxQuestId(CONTRACT)).toEqual({ status: 'found', value: 2 })
	})

	test('questExistsOnChain is false for a missing quest and true for an existing one', async () => {
		const missing = makeReads(async () => ({
			result: { retval: xdr.ScVal.scvVoid() },
		}))
		expect(await missing.questExistsOnChain(CONTRACT, 99)).toBe(false)

		const existing = makeReads(async () => ({
			result: { retval: questMapScVal(1) },
		}))
		expect(await existing.questExistsOnChain(CONTRACT, 1)).toBe(true)
	})
})

describe('GamificationContractService facade', () => {
	test('keeps the legacy constructor and exposes reads/writes', async () => {
		const { GamificationContractService } = await import('../lib/stellar/gamification-contracts')
		// RPC configuration stays local to this test: pass it to the
		// constructor instead of overwriting process.env.
		const service = new GamificationContractService(
			'http://127.0.0.1:9',
			'Test SDF Network ; September 2015',
			Keypair.random().secret(),
		)
		expect(service.reads).toBeDefined()
		expect(service.writes).toBeDefined()
		// Legacy numeric shape: an unreachable RPC still yields 0, as before.
		expect(await service.getMaxQuestIdOnChain(CONTRACT)).toBe(0)
	})
})

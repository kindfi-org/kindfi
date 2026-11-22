import { describe, expect, test } from 'bun:test'
import { Keypair, nativeToScVal, SorobanDataBuilder, StrKey, type xdr } from '@stellar/stellar-sdk'
import type { GamificationRpcClient } from '../lib/stellar/gamification-reads'
import { GamificationContractWrites } from '../lib/stellar/gamification-writes'

const CONTRACT = StrKey.encodeContract(Keypair.random().rawPublicKey())
const USER = Keypair.random().publicKey()
const ADMIN = Keypair.random()

/** A simulation assembleTransaction accepts: parsed, with Soroban data and auths. */
function mockSimulation(retval?: xdr.ScVal) {
	return {
		_parsed: true,
		id: 'mock-simulation',
		latestLedger: 1,
		transactionData: new SorobanDataBuilder(),
		minResourceFee: '0',
		result: { auth: [], retval },
	}
}

function mockSend(status: string, hash = 'aabbccdd') {
	return { status, hash, latestLedger: 1, latestLedgerCloseTime: 1 }
}

function makeWrites(opts: {
	simulate?: (tx: unknown) => Promise<unknown>
	send?: (tx: unknown) => Promise<unknown>
	getTx?: (hash: string) => Promise<unknown>
}) {
	const keypair = Keypair.random()
	const server = {
		getAccount: async (publicKey: string) => ({
			accountId: () => publicKey,
			sequenceNumber: () => '1',
		}),
		simulateTransaction:
			opts.simulate ?? (async () => mockSimulation(nativeToScVal(10, { type: 'u32' }))),
		sendTransaction: opts.send ?? (async () => mockSend('PENDING')),
		getTransaction: opts.getTx ?? (async () => ({ status: 'SUCCESS' })),
	}
	const client = {
		server,
		networkPassphrase: 'Test SDF Network ; September 2015',
		recorderKeypair: keypair,
	} as unknown as GamificationRpcClient
	return new GamificationContractWrites(client)
}

describe('gamification writes — submit helper', () => {
	test('retries TRY_AGAIN_LATER and succeeds when the resend is accepted', async () => {
		let sends = 0
		const writes = makeWrites({
			send: async () => {
				sends++
				return sends < 3 ? mockSend('TRY_AGAIN_LATER') : mockSend('PENDING')
			},
		})
		const result = await writes.recordReferralDonation(CONTRACT, { referredAddress: USER })
		expect(result.success).toBe(true)
		expect(sends).toBe(3)
	})

	test('TRY_AGAIN_LATER exhausted is a distinguishable failure, not success', async () => {
		let sends = 0
		const writes = makeWrites({
			send: async () => {
				sends++
				return mockSend('TRY_AGAIN_LATER')
			},
		})
		const result = await writes.recordReferralDonation(CONTRACT, { referredAddress: USER })
		expect(result.success).toBe(false)
		expect(sends).toBe(3)
		expect(result.error).toContain('TRY_AGAIN_LATER')
		expect(result.txHash).toBe('aabbccdd')
	})

	test('createReferral waits for confirmation before reporting success', async () => {
		let confirmations = 0
		const writes = makeWrites({
			getTx: async () => {
				confirmations++
				return { status: 'SUCCESS' }
			},
		})
		const result = await writes.createReferral(CONTRACT, {
			referrerAddress: USER,
			referredAddress: Keypair.random().publicKey(),
		})
		expect(result.success).toBe(true)
		expect(confirmations).toBeGreaterThan(0)
	})

	test('createReferral reports failure (with hash) when confirmation fails', async () => {
		const writes = makeWrites({
			getTx: async () => ({ status: 'FAILED' }),
		})
		const result = await writes.createReferral(CONTRACT, {
			referrerAddress: USER,
			referredAddress: Keypair.random().publicKey(),
		})
		expect(result.success).toBe(false)
		expect(result.txHash).toBe('aabbccdd')
	})

	test('createQuest returns the confirmed quest id, not the simulated one', async () => {
		const writes = makeWrites({
			simulate: async () => mockSimulation(nativeToScVal(7, { type: 'u32' })),
			getTx: async () => ({
				status: 'SUCCESS',
				returnValue: nativeToScVal(8, { type: 'u32' }),
			}),
		})
		const result = await writes.createQuest(
			CONTRACT,
			{
				questType: 4,
				name: 'Test quest',
				description: 'Created in test',
				targetValue: 10,
				rewardPoints: 5,
				expiresAt: 0,
			},
			ADMIN,
		)
		expect(result.success).toBe(true)
		expect(result.questId).toBe(8)
	})

	test('createQuest leaves questId unset when the confirmed return value is missing', async () => {
		const writes = makeWrites({
			simulate: async () => mockSimulation(nativeToScVal(7, { type: 'u32' })),
			getTx: async () => ({ status: 'SUCCESS' }),
		})
		const result = await writes.createQuest(
			CONTRACT,
			{
				questType: 4,
				name: 'Test quest',
				description: 'Created in test',
				targetValue: 10,
				rewardPoints: 5,
				expiresAt: 0,
			},
			ADMIN,
		)
		expect(result.success).toBe(true)
		expect(result.questId).toBeUndefined()
	})

	test('grantRole reports success only on confirmed SUCCESS', async () => {
		const writes = makeWrites({
			getTx: async () => ({ status: 'SUCCESS' }),
		})
		const result = await writes.grantRole(CONTRACT, USER, 'admin', ADMIN)
		expect(result).toEqual({ success: true, txHash: 'aabbccdd' })
	})

	test('grantRole reports failure (with hash) when the transaction FAILED', async () => {
		const writes = makeWrites({
			getTx: async () => ({ status: 'FAILED' }),
		})
		const result = await writes.grantRole(CONTRACT, USER, 'admin', ADMIN)
		expect(result.success).toBe(false)
		expect(result.txHash).toBe('aabbccdd')
	})

	test('grantRole polls through NOT_FOUND until the transaction succeeds', async () => {
		let lookups = 0
		const writes = makeWrites({
			getTx: async () => {
				lookups++
				return lookups < 2 ? { status: 'NOT_FOUND' } : { status: 'SUCCESS' }
			},
		})
		const result = await writes.grantRole(CONTRACT, USER, 'admin', ADMIN)
		expect(result.success).toBe(true)
		expect(lookups).toBe(2)
	})
})

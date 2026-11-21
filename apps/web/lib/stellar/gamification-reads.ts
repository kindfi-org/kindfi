/**
 * Gamification contract reads.
 *
 * Read-only view of the gamification contracts (Quest, Referral, Reputation,
 * Streak, NFT). Every read goes through Stellar RPC simulation
 * (`simulateTransaction`) or `getLedgerEntries` semantics: recent contract
 * state only, roughly the last 7 days of history. Payment history older than
 * the RPC window belongs to the KindFi indexer, never to a `getEvents` loop
 * in the web app — see `chain-data.md` next to this file.
 *
 * A read never substitutes a zero for a value the contract does not have.
 * Each read returns a typed {@link ContractReadResult}:
 *
 * - `found` — the contract returned a value.
 * - `not_found` — the RPC call succeeded but the contract has no value
 *   (for example `get_quest` returned `Option::None`, or the simulation
 *   carried no return value). The UI already has to handle this case.
 * - `error` — the RPC call itself failed. Callers must not treat this as
 *   "no value": a failed read is not proof the value is missing.
 *
 * Writes live in `gamification-writes.ts`. The two modules share one RPC
 * client, built once by `GamificationContractService` in
 * `gamification-contracts.ts`.
 */

import {
	Account,
	Address,
	type Keypair,
	nativeToScVal,
	Operation,
	scValToNative,
	TransactionBuilder,
	type xdr,
} from '@stellar/stellar-sdk'
import { Api, type Server as SorobanRpcServer } from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'

/** Shared RPC connection for the gamification read and write modules. */
export interface GamificationRpcClient {
	server: SorobanRpcServer
	networkPassphrase: string
	recorderKeypair: Keypair
}

/**
 * Typed outcome of a contract read.
 *
 * `not_found` is a real answer from the contract, not a failure: the key or
 * entry simply does not exist yet (a new referrer has no statistics, a quest
 * id was never created). It must never be rendered as `0` or as an empty
 * score — `0` looks like a measured value.
 */
export type ContractReadResult<T> =
	| { status: 'found'; value: T }
	| { status: 'not_found' }
	| { status: 'error'; error: string }

/** On-chain quest definition, as returned by `get_quest`. */
export interface QuestDefinition {
	quest_id: number
	quest_type: number
	name: string
	description: string
	target_value: number
	reward_points: number
	/** Unix timestamp, 0 means no expiration. */
	expires_at: number
	is_active: boolean
}

/** On-chain referrer statistics, as returned by `get_referrer_statistics`. */
export interface ReferrerStatistics {
	total_referrals: number
	active_referrals: number
	total_reward_points: number
}

type ViewCallResult =
	| { status: 'ok'; retval: xdr.ScVal | undefined }
	| { status: 'error'; error: string }

export class GamificationContractReads {
	private readonly client: GamificationRpcClient
	/** Max fee in stroops — mainnet inclusion often rejects low fees (txInsufficientFee). */
	private readonly txFee = process.env.SOROBAN_TX_FEE || '10000000'

	constructor(client: GamificationRpcClient) {
		this.client = client
	}

	/**
	 * Simulate a read-only contract call and return its raw return value.
	 * Nothing here submits a transaction.
	 */
	private async simulateViewCall(
		contractAddress: string,
		functionName: string,
		args: xdr.ScVal[],
	): Promise<ViewCallResult> {
		try {
			const account = await this.client.server
				.getAccount(this.client.recorderKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			const operation = Operation.invokeContractFunction({
				contract: contractAddress,
				function: functionName,
				args,
			})

			const transaction = new TransactionBuilder(account, {
				fee: this.txFee,
				networkPassphrase: this.client.networkPassphrase,
			})
				.addOperation(operation)
				.setTimeout(60)
				.build()

			const simulation = await this.client.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				return { status: 'error', error: simulation.error }
			}

			return { status: 'ok', retval: simulation.result?.retval }
		} catch (error) {
			return {
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Decode a simulation return value.
	 *
	 * `scValToNative` maps a Soroban `None` (void) to `null`, which is how a
	 * missing `Option` value shows up here — that is `not_found`, not a
	 * zero. A value that decodes but fails the shape check is an `error`:
	 * the contract answered with something this code does not understand.
	 */
	private decodeReadValue<T>(
		retval: xdr.ScVal | undefined,
		validate: (value: unknown) => T | null,
	): ContractReadResult<T> {
		if (!retval) {
			return { status: 'not_found' }
		}

		let native: unknown
		try {
			native = scValToNative(retval)
		} catch (error) {
			return {
				status: 'error',
				error: `Could not decode contract return value: ${error instanceof Error ? error.message : 'Unknown error'}`,
			}
		}

		if (native === null || native === undefined) {
			return { status: 'not_found' }
		}

		const value = validate(native)
		if (value === null) {
			return { status: 'error', error: 'Unexpected contract return shape' }
		}

		return { status: 'found', value }
	}

	private static isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null
	}

	private static toNumber(value: unknown): number | null {
		if (typeof value === 'number') return value
		if (typeof value === 'bigint') return Number(value)
		return null
	}

	private static decodeQuestDefinition(value: unknown): QuestDefinition | null {
		if (!GamificationContractReads.isRecord(value)) return null
		const questId = GamificationContractReads.toNumber(value.quest_id)
		const questType = GamificationContractReads.toNumber(value.quest_type)
		const targetValue = GamificationContractReads.toNumber(value.target_value)
		const rewardPoints = GamificationContractReads.toNumber(value.reward_points)
		const expiresAt = GamificationContractReads.toNumber(value.expires_at)
		if (
			questId === null ||
			questType === null ||
			typeof value.name !== 'string' ||
			typeof value.description !== 'string' ||
			targetValue === null ||
			rewardPoints === null ||
			expiresAt === null ||
			typeof value.is_active !== 'boolean'
		) {
			return null
		}
		return {
			quest_id: questId,
			quest_type: questType,
			name: value.name,
			description: value.description,
			target_value: targetValue,
			reward_points: rewardPoints,
			expires_at: expiresAt,
			is_active: value.is_active,
		}
	}

	private static decodeReferrerStatistics(value: unknown): ReferrerStatistics | null {
		if (!GamificationContractReads.isRecord(value)) return null
		const totalReferrals = GamificationContractReads.toNumber(value.total_referrals)
		const activeReferrals = GamificationContractReads.toNumber(value.active_referrals)
		const totalRewardPoints = GamificationContractReads.toNumber(value.total_reward_points)
		if (totalReferrals === null || activeReferrals === null || totalRewardPoints === null) {
			return null
		}
		return {
			total_referrals: totalReferrals,
			active_referrals: activeReferrals,
			total_reward_points: totalRewardPoints,
		}
	}

	/**
	 * Read a quest definition from the Quest contract.
	 * `get_quest` returns `Option<QuestDefinition>`: `None` is `not_found`.
	 */
	async getQuest(
		questContractAddress: string,
		questId: number,
	): Promise<ContractReadResult<QuestDefinition>> {
		const call = await this.simulateViewCall(questContractAddress, 'get_quest', [
			nativeToScVal(questId, { type: 'u32' }),
		])
		if (call.status === 'error') {
			return call
		}
		return this.decodeReadValue(call.retval, GamificationContractReads.decodeQuestDefinition)
	}

	/**
	 * Read-only check: true when `get_quest` returns a definition for questId.
	 *
	 * An RPC failure also yields false here, matching the previous behaviour:
	 * the quest sync service treats "not present" conservatively and the
	 * follow-up create attempt surfaces the real failure. New code that
	 * needs to tell "missing" apart from "RPC failed" should use `getQuest`.
	 */
	async questExistsOnChain(questContractAddress: string, questId: number): Promise<boolean> {
		const result = await this.getQuest(questContractAddress, questId)
		if (result.status === 'error') {
			logger.warn(
				'[GamificationContractReads] questExistsOnChain treating RPC error as not present:',
				result.error,
			)
		}
		return result.status === 'found'
	}

	/**
	 * Highest on-chain quest_id that currently exists.
	 *
	 * Returns `not_found` only when the read itself cannot run; a contract
	 * with no quests is `{ status: 'found', value: 0 }` — a count of existing
	 * quests, not a missing score. An RPC error is an `error`, never 0.
	 */
	async getMaxQuestId(questContractAddress: string): Promise<ContractReadResult<number>> {
		let maxId = 0
		for (;;) {
			const result = await this.getQuest(questContractAddress, maxId + 1)
			if (result.status === 'error') {
				return result
			}
			if (result.status === 'not_found') {
				return { status: 'found', value: maxId }
			}
			maxId++
		}
	}

	/**
	 * Read referrer statistics from the Referral contract (simulation-only read).
	 * `get_referrer_statistics` returns `Option<ReferrerStats>`: a referrer
	 * who never referred anyone is `not_found`, not zero statistics.
	 */
	async getReferrerStatistics(
		referralContractAddress: string,
		referrerAddress: string,
	): Promise<ContractReadResult<ReferrerStatistics>> {
		const call = await this.simulateViewCall(referralContractAddress, 'get_referrer_statistics', [
			nativeToScVal(Address.fromString(referrerAddress), { type: 'address' }),
		])
		if (call.status === 'error') {
			return call
		}
		return this.decodeReadValue(call.retval, GamificationContractReads.decodeReferrerStatistics)
	}

	/**
	 * Check if an account has a specific role on a contract.
	 * `has_role` returns `Option<u32>`: `Some` means granted, `None` means
	 * not granted — both are real answers, so a missing role is
	 * `{ status: 'found', value: false }`, not `not_found`. Only an RPC
	 * failure is an `error`.
	 */
	async hasRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
	): Promise<ContractReadResult<boolean>> {
		const call = await this.simulateViewCall(contractAddress, 'has_role', [
			nativeToScVal(Address.fromString(accountAddress), { type: 'address' }),
			nativeToScVal(role, { type: 'symbol' }),
		])
		if (call.status === 'error') {
			return call
		}
		if (!call.retval) {
			return { status: 'error', error: 'Contract returned no value for has_role' }
		}
		let native: unknown
		try {
			native = scValToNative(call.retval)
		} catch (error) {
			return {
				status: 'error',
				error: `Could not decode contract return value: ${error instanceof Error ? error.message : 'Unknown error'}`,
			}
		}
		// None becomes null, Some(n) becomes a number.
		return { status: 'found', value: native !== undefined && native !== null }
	}
}

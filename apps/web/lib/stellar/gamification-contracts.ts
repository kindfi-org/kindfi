/**
 * Gamification Contract Service
 *
 * Compatibility facade over the split gamification modules:
 *
 * - Reads (simulation only, never submits): `GamificationContractReads`
 *   in `gamification-reads.ts`. Reads return a typed
 *   {@link ContractReadResult}: `found`, `not_found`, or `error`. A missing
 *   contract value is `not_found` — never a substituted `0`.
 * - Writes (transaction submission): `GamificationContractWrites` in
 *   `gamification-writes.ts`. Every write goes through one shared submit
 *   helper in that module.
 *
 * New code should use `service.reads` / `service.writes` (or import the
 * modules directly) instead of the delegating methods below. The methods are
 * kept so existing callers — API routes, services, and scripts — keep
 * working unchanged.
 *
 * Chain-data rules (RPC for recent state, indexer for payment history) are
 * stated in `chain-data.md` next to this file.
 */

import { Keypair } from '@stellar/stellar-sdk'
import * as SorobanRpc from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'
import { GamificationContractReads, type GamificationRpcClient } from './gamification-reads'
import {
	GamificationContractWrites,
	type GamificationTxResult,
	type NftMetadataInput,
} from './gamification-writes'

export type {
	ContractReadResult,
	GamificationRpcClient,
	MaxQuestIdResult,
	QuestDefinition,
	ReferrerStatistics,
} from './gamification-reads'
export { GamificationContractReads } from './gamification-reads'
export type { GamificationTxResult, NftMetadataInput } from './gamification-writes'
export { GamificationContractWrites } from './gamification-writes'

export class GamificationContractService {
	/** Read-only contract views (simulation, no submissions). */
	readonly reads: GamificationContractReads
	/** Contract transaction submissions. */
	readonly writes: GamificationContractWrites

	constructor(rpcUrl?: string, networkPassphrase?: string, recorderSecretKey?: string) {
		const rpc = rpcUrl || process.env.STELLAR_RPC_URL || process.env.RPC_URL
		const passphrase =
			networkPassphrase ||
			process.env.STELLAR_NETWORK_PASSPHRASE ||
			process.env.NETWORK_PASSPHRASE ||
			'Test SDF Network ; September 2015'
		const secretKey = recorderSecretKey || process.env.SOROBAN_PRIVATE_KEY

		if (!secretKey) {
			throw new Error(
				'SOROBAN_PRIVATE_KEY environment variable is required for gamification contract service',
			)
		}

		if (!rpc) {
			throw new Error('Stellar RPC URL is required')
		}

		const client: GamificationRpcClient = {
			server: new SorobanRpc.Server(rpc, { allowHttp: true }),
			networkPassphrase: passphrase,
			recorderKeypair: Keypair.fromSecret(secretKey),
		}

		this.reads = new GamificationContractReads(client)
		this.writes = new GamificationContractWrites(client)
	}

	// ------------------------------------------------------------------
	// Reads (legacy shapes — new code should use `service.reads` instead)
	// ------------------------------------------------------------------

	/**
	 * Read-only check: returns true when get_quest returns a definition for questId.
	 */
	async questExistsOnChain(questContractAddress: string, questId: number): Promise<boolean> {
		return this.reads.questExistsOnChain(questContractAddress, questId)
	}

	/**
	 * Highest on-chain quest_id that currently exists (0 when the contract has no quests).
	 *
	 * Legacy numeric shape: an RPC failure yields the last confirmed quest id
	 * (0 when nothing was confirmed), never a reset to 0 after known quests.
	 * New code should use `service.reads.getMaxQuestId`, which returns a
	 * typed result instead.
	 */
	async getMaxQuestIdOnChain(questContractAddress: string): Promise<number> {
		const result = await this.reads.getMaxQuestId(questContractAddress)
		if (result.status === 'error') {
			logger.warn(
				'[GamificationContractService] getMaxQuestIdOnChain treating RPC error as last confirmed id:',
				result.error,
			)
			return result.lastConfirmedId
		}
		return result.value
	}

	/**
	 * Read referrer statistics from the Referral contract (simulation-only read).
	 * Returns success when the contract is reachable; stats may be null for new referrers.
	 */
	async getReferrerStatistics(
		referralContractAddress: string,
		referrerAddress: string,
	): Promise<{ success: boolean; hasStats: boolean; error?: string }> {
		const result = await this.reads.getReferrerStatistics(referralContractAddress, referrerAddress)
		if (result.status === 'found') {
			return { success: true, hasStats: true }
		}
		if (result.status === 'not_found') {
			return { success: true, hasStats: false }
		}
		return { success: false, hasStats: false, error: result.error }
	}

	/**
	 * Check if an account has a specific role on a contract.
	 */
	async hasRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
	): Promise<{ hasRole: boolean; error?: string }> {
		const result = await this.reads.hasRole(contractAddress, accountAddress, role)
		if (result.status === 'found') {
			return { hasRole: result.value }
		}
		if (result.status === 'error') {
			return { hasRole: false, error: result.error }
		}
		return { hasRole: false }
	}

	// ------------------------------------------------------------------
	// Writes (delegated to GamificationContractWrites)
	// ------------------------------------------------------------------

	/**
	 * Record a donation in the Streak contract
	 */
	async recordStreakDonation(
		streakContractAddress: string,
		params: {
			userAddress: string
			period: 'weekly' | 'monthly'
			donationTimestamp: number
		},
	): Promise<GamificationTxResult<{ streak?: number }>> {
		return this.writes.recordStreakDonation(streakContractAddress, params)
	}

	/**
	 * Record a donation by a referred user in the Referral contract
	 */
	async recordReferralDonation(
		referralContractAddress: string,
		params: { referredAddress: string },
	): Promise<GamificationTxResult<{ rewardPoints?: number }>> {
		return this.writes.recordReferralDonation(referralContractAddress, params)
	}

	/**
	 * Create a referral relationship on-chain.
	 * Signature: create_referral(caller: Address, referrer: Address, referred: Address)
	 */
	async createReferral(
		referralContractAddress: string,
		params: { referrerAddress: string; referredAddress: string },
	): Promise<GamificationTxResult> {
		return this.writes.createReferral(referralContractAddress, params)
	}

	/**
	 * Mark a referred user as onboarded on-chain.
	 * Signature: mark_onboarded(caller: Address, referred: Address) -> u32
	 */
	async markOnboarded(
		referralContractAddress: string,
		params: { referredAddress: string },
	): Promise<GamificationTxResult<{ rewardPoints?: number }>> {
		return this.writes.markOnboarded(referralContractAddress, params)
	}

	/**
	 * Update quest progress in the Quest contract
	 */
	async updateQuestProgress(
		questContractAddress: string,
		params: { userAddress: string; questId: number; progressValue: number },
	): Promise<GamificationTxResult<{ completed?: boolean }>> {
		return this.writes.updateQuestProgress(questContractAddress, params)
	}

	/**
	 * Create a quest on-chain (requires admin role)
	 * Note: This uses an admin keypair, not the recorder keypair
	 */
	async createQuest(
		questContractAddress: string,
		params: {
			questType: number
			name: string
			description: string
			targetValue: number
			rewardPoints: number
			expiresAt: number
		},
		adminKeypair: Keypair,
	): Promise<GamificationTxResult<{ questId?: number }>> {
		return this.writes.createQuest(questContractAddress, params, adminKeypair)
	}

	/**
	 * Mint a new NFT with metadata on the KindFi NFT contract.
	 * Requires the "minter" role on the contract.
	 *
	 * Signature: mint_with_metadata(caller: Address, to: Address, nft_metadata: NFTMetadata) -> u32
	 */
	async mintNFT(
		nftContractAddress: string,
		params: {
			toAddress: string
			metadata: NftMetadataInput
		},
	): Promise<GamificationTxResult<{ tokenId?: number }>> {
		return this.writes.mintNFT(nftContractAddress, params)
	}

	/**
	 * Update metadata for an existing NFT.
	 * Requires the "metadata_manager" role on the contract.
	 *
	 * Signature: update_metadata(caller: Address, token_id: u32, nft_metadata: NFTMetadata)
	 */
	async updateNFTMetadata(
		nftContractAddress: string,
		params: {
			tokenId: number
			metadata: NftMetadataInput
		},
	): Promise<GamificationTxResult> {
		return this.writes.updateNFTMetadata(nftContractAddress, params)
	}

	/**
	 * Grant a role on a contract using the admin keypair.
	 * Uses the same SDK transaction flow that works for Quest updates.
	 */
	async grantRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
		adminKeypair: Keypair,
	): Promise<GamificationTxResult> {
		return this.writes.grantRole(contractAddress, accountAddress, role, adminKeypair)
	}

	/**
	 * Record a reputation event for a user (direct call, same as CPI targets).
	 * Requires the "recorder" role.
	 *
	 * Signature: record_event(caller, user, event_type) -> u32
	 *            record_event_with_points(caller, user, event_type, points) -> u32
	 */
	async recordReputationEvent(
		reputationContractAddress: string,
		params: { userAddress: string; eventType: number; points?: number },
	): Promise<GamificationTxResult<{ totalPoints?: number }>> {
		return this.writes.recordReputationEvent(reputationContractAddress, params)
	}
}

/**
 * Gamification contract writes.
 *
 * Submits transactions to the gamification contracts (Quest, Referral,
 * Reputation, Streak, NFT) with the recorder (or admin) keypair. Every write
 * goes through one shared helper, {@link GamificationContractWrites.submitContractCall},
 * which builds the transaction, simulates it, assembles it, signs it, and
 * sends it via Stellar RPC. There is no second submit path in this module.
 *
 * Reads live in `gamification-reads.ts` and never submit anything. The two
 * modules share one RPC client, built once by `GamificationContractService`
 * in `gamification-contracts.ts`.
 */

import {
	Account,
	Address,
	type Keypair,
	nativeToScVal,
	Operation,
	scValToNative,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction } from '@stellar/stellar-sdk/rpc'
import { logger } from '@/lib/logger'
import type { GamificationRpcClient } from './gamification-reads'

interface RecordStreakDonationParams {
	userAddress: string // User's Stellar address (G... or C...)
	period: 'weekly' | 'monthly' // Streak period
	donationTimestamp: number // Unix timestamp
}

interface CreateReferralParams {
	referrerAddress: string // Referrer's Stellar address
	referredAddress: string // Referred user's Stellar address
}

interface MarkOnboardedParams {
	referredAddress: string // Referred user's Stellar address
}

interface RecordReferralDonationParams {
	referredAddress: string // Referred user's Stellar address
}

interface UpdateQuestProgressParams {
	userAddress: string
	questId: number
	progressValue: number
}

interface CreateQuestParams {
	questType: number // QuestType enum value (0-5)
	name: string
	description: string
	targetValue: number
	rewardPoints: number
	expiresAt: number // Unix timestamp, 0 for no expiration
}

/**
 * NFT metadata input, shared by the facade (`gamification-contracts.ts`)
 * and the direct writes API below. Defined once so an added field is
 * available through both entrypoints without editing parallel shapes.
 */
export interface NftAttributeInput {
	trait_type: string
	value: string
	display_type?: string
	max_value?: string
}

export interface NftMetadataInput {
	name: string
	description: string
	imageUri: string
	externalUrl: string
	attributes: NftAttributeInput[]
}

interface MintNFTParams {
	toAddress: string // Recipient's Stellar address
	metadata: NftMetadataInput
}

interface UpdateNFTMetadataParams {
	tokenId: number
	metadata: NftMetadataInput
}

interface RecordReputationEventParams {
	userAddress: string
	/** EventType enum: 0=Donation … 7=OutstandingBooster */
	eventType: number
	/** When set, calls record_event_with_points instead of record_event */
	points?: number
}

export type GamificationTxResult<T extends Record<string, unknown> = Record<string, unknown>> = {
	success: boolean
	txHash?: string
	error?: string
} & T

interface SubmitContractCallOptions {
	contractAddress: string
	functionName: string
	args: xdr.ScVal[]
	/** Keypair that signs the transaction (recorder, or admin for admin calls). */
	signer: Keypair
	/** When true, poll until the transaction is included or fails. */
	waitForConfirmation?: boolean
}

type SubmitContractCallResult = GamificationTxResult<{
	simulation?: Api.SimulateTransactionSuccessResponse
	sendStatus?: Api.SendTransactionResponse['status']
	/** Return value of the confirmed transaction, when confirmation was awaited. */
	returnValue?: xdr.ScVal
}>

/**
 * Global transaction queue to prevent txBadSeq errors.
 *
 * When multiple on-chain calls happen concurrently (e.g. streak + quest + NFT
 * during a single donation), they all share the same recorder account. Without
 * serialization, two transactions can be built with the same sequence number,
 * causing the second one to fail with txBadSeq (-5).
 *
 * This queue ensures only one transaction is in-flight at a time.
 */
let txQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
	const result = txQueue.then(fn, fn) // run even if previous rejected
	txQueue = result.catch(() => {}) // swallow so the queue keeps moving
	return result
}

export class GamificationContractWrites {
	private readonly client: GamificationRpcClient
	/** Max fee in stroops — mainnet inclusion often rejects low fees (txInsufficientFee). */
	private readonly txFee = process.env.SOROBAN_TX_FEE || '10000000'

	constructor(client: GamificationRpcClient) {
		this.client = client
	}

	/** Poll until a submitted transaction is included or fails (mainnet can be slow). */
	private async waitForSubmittedTransaction(
		hash: string,
		maxAttempts = 30,
		intervalMs = 2000,
	): Promise<{ success: boolean; error?: string; returnValue?: xdr.ScVal }> {
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const tx = await this.client.server.getTransaction(hash)

			if (tx.status === Api.GetTransactionStatus.SUCCESS) {
				// A confirmed Soroban invocation carries its return value
				// (parsed from resultMetaXdr by the SDK) — callers that need
				// the confirmed result must use this, not the simulation.
				return { success: true, returnValue: tx.returnValue }
			}

			if (tx.status === Api.GetTransactionStatus.FAILED) {
				return { success: false, error: 'Transaction failed on-chain' }
			}

			if (attempt < maxAttempts - 1) {
				await new Promise((resolve) => setTimeout(resolve, intervalMs))
			}
		}

		return { success: false, error: 'Transaction confirmation timeout' }
	}

	/**
	 * Shared submit path for every gamification write: build the contract
	 * invocation, simulate it, assemble, sign, and send via RPC.
	 *
	 * `DUPLICATE` is treated as submitted, matching the previous per-method
	 * behaviour: the hash is returned and the caller can confirm inclusion
	 * with `getTransaction`. `TRY_AGAIN_LATER` is different — the
	 * transaction was rejected, not enqueued — so the same signed transaction
	 * is resent up to 3 times with backoff, and a distinguishable failure
	 * (with the hash) is returned when the retries are exhausted. A hash
	 * alone is never proof of acceptance.
	 */
	private async submitContractCall(
		options: SubmitContractCallOptions,
	): Promise<SubmitContractCallResult> {
		const { contractAddress, functionName, args, signer, waitForConfirmation } = options
		try {
			const sourceAccount = await this.client.server
				.getAccount(signer.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			const operation = Operation.invokeContractFunction({
				contract: contractAddress,
				function: functionName,
				args,
			})

			const transaction = new TransactionBuilder(sourceAccount, {
				fee: this.txFee,
				networkPassphrase: this.client.networkPassphrase,
			})
				.addOperation(operation)
				.setTimeout(60)
				.build()

			const simulation = await this.client.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				logger.error('[GamificationContractService] Simulation failed:', simulation)
				return {
					success: false,
					error: `Simulation failed: ${JSON.stringify(simulation)}`,
				}
			}

			const assembledTx = assembleTransaction(transaction, simulation).build()
			assembledTx.sign(signer)

			// TRY_AGAIN_LATER means the transaction was not enqueued: resend
			// the same signed transaction, bounded, with backoff.
			const maxSendAttempts = 3
			let result = await this.client.server.sendTransaction(assembledTx)
			let sendAttempts = 1
			while (result.status === 'TRY_AGAIN_LATER' && sendAttempts < maxSendAttempts) {
				logger.warn(
					`[GamificationContractService] sendTransaction TRY_AGAIN_LATER, retrying (${sendAttempts}/${maxSendAttempts - 1})...`,
				)
				await new Promise((resolve) => setTimeout(resolve, sendAttempts * 1000))
				result = await this.client.server.sendTransaction(assembledTx)
				sendAttempts++
			}

			if (result.status === 'TRY_AGAIN_LATER') {
				logger.error(
					'[GamificationContractService] Transaction rejected with TRY_AGAIN_LATER after retries:',
					result,
				)
				return {
					success: false,
					txHash: result.hash,
					error: 'Transaction rejected with TRY_AGAIN_LATER after retries; not enqueued',
					simulation,
					sendStatus: result.status,
				}
			}

			if (result.status === 'ERROR') {
				logger.error('[GamificationContractService] Transaction failed:', result)
				return {
					success: false,
					error: `Transaction failed: ${JSON.stringify(result)}`,
				}
			}

			let returnValue: xdr.ScVal | undefined
			if (waitForConfirmation) {
				const confirmation = await this.waitForSubmittedTransaction(result.hash)
				if (!confirmation.success) {
					return {
						success: false,
						txHash: result.hash,
						error: confirmation.error,
						simulation,
						sendStatus: result.status,
					}
				}
				returnValue = confirmation.returnValue
			}

			return {
				success: true,
				txHash: result.hash,
				simulation,
				sendStatus: result.status,
				returnValue,
			}
		} catch (error) {
			logger.error('[GamificationContractService] Error submitting contract call:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/** Parse a u32 return value from a simulation result, if present. */
	private parseU32Return(
		simulation: Api.SimulateTransactionSuccessResponse | undefined,
		method: string,
	): number | undefined {
		return this.parseU32FromScVal(simulation?.result?.retval, method)
	}

	/** Parse a u32 return value from a confirmed transaction's return value, if present. */
	private parseU32FromScVal(retval: xdr.ScVal | undefined, method: string): number | undefined {
		if (!retval) return undefined
		try {
			const native = scValToNative(retval)
			// A void/None return decodes to null, which is "no value", not 0.
			return typeof native === 'number' ? native : undefined
		} catch {
			logger.warn(`[GamificationContractService] Could not parse return value from ${method}`)
			return undefined
		}
	}

	/**
	 * Record a donation in the Streak contract
	 */
	async recordStreakDonation(
		streakContractAddress: string,
		params: RecordStreakDonationParams,
	): Promise<GamificationTxResult<{ streak?: number }>> {
		return enqueue(async () => {
			try {
				const { userAddress, period, donationTimestamp } = params

				// Convert period to enum (0 = Weekly, 1 = Monthly)
				const periodValue = period === 'weekly' ? 0 : 1

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: record_donation(caller: Address, user: Address, period: StreakPeriod, donation_timestamp: u64)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				const recorderAddressStr = this.client.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const userAddr = Address.fromString(userAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(userAddr, { type: 'address' }), // user
					nativeToScVal(periodValue, { type: 'u32' }), // period: StreakPeriod enum (0 = Weekly, 1 = Monthly)
					nativeToScVal(BigInt(donationTimestamp), { type: 'u64' }), // donation_timestamp
				]

				const result = await this.submitContractCall({
					contractAddress: streakContractAddress,
					functionName: 'record_donation',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Wait for transaction to be included in ledger
				// Note: The contract returns the new streak count, but we'd need to parse it from the transaction result
				// For now, we'll return success if the transaction was submitted
				return {
					success: true,
					txHash: result.txHash,
					streak: 1,
				}
			} catch (error) {
				logger.error('[GamificationContractService] Error recording streak donation:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – recordStreakDonation
	}

	/**
	 * Record a donation by a referred user in the Referral contract
	 */
	async recordReferralDonation(
		referralContractAddress: string,
		params: RecordReferralDonationParams,
	): Promise<GamificationTxResult<{ rewardPoints?: number }>> {
		return enqueue(async () => {
			try {
				const { referredAddress } = params

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: record_donation(caller: Address, referred: Address)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				const recorderAddressStr = this.client.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const referredAddr = Address.fromString(referredAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(referredAddr, { type: 'address' }), // referred
				]

				const result = await this.submitContractCall({
					contractAddress: referralContractAddress,
					functionName: 'record_donation',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Parse reward points from simulation result (record_donation returns u32)
				let rewardPoints = 0
				const parsed = this.parseU32Return(result.simulation, 'record_donation')
				if (parsed !== undefined) {
					rewardPoints = parsed
				}

				// Transaction submitted successfully
				return {
					success: true,
					txHash: result.txHash,
					rewardPoints,
				}
			} catch (error) {
				logger.error('[GamificationContractService] Error recording referral donation:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – recordReferralDonation
	}

	/**
	 * Create a referral relationship on-chain.
	 * Signature: create_referral(caller: Address, referrer: Address, referred: Address)
	 *
	 * Waits for confirmation: callers (e.g. `applyReferralCode`) run a
	 * dependent call (`mark_onboarded`) right after this one, and that call
	 * fails when the referral is still only submitted, not yet on-chain.
	 * On a confirmation failure the hash is kept so the caller can reconcile
	 * the existing referral instead of submitting a second creation.
	 */
	async createReferral(
		referralContractAddress: string,
		params: CreateReferralParams,
	): Promise<GamificationTxResult> {
		return enqueue(async () => {
			try {
				const { referrerAddress, referredAddress } = params

				const args = [
					nativeToScVal(Address.fromString(this.client.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referrerAddress), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referredAddress), {
						type: 'address',
					}),
				]

				const result = await this.submitContractCall({
					contractAddress: referralContractAddress,
					functionName: 'create_referral',
					args,
					signer: this.client.recorderKeypair,
					waitForConfirmation: true,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				return { success: true, txHash: result.txHash }
			} catch (error) {
				logger.error('[GamificationContractService] Error creating referral:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – createReferral
	}

	/**
	 * Mark a referred user as onboarded on-chain.
	 * Signature: mark_onboarded(caller: Address, referred: Address) -> u32
	 */
	async markOnboarded(
		referralContractAddress: string,
		params: MarkOnboardedParams,
	): Promise<GamificationTxResult<{ rewardPoints?: number }>> {
		return enqueue(async () => {
			try {
				const { referredAddress } = params

				const args = [
					nativeToScVal(Address.fromString(this.client.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referredAddress), {
						type: 'address',
					}),
				]

				const result = await this.submitContractCall({
					contractAddress: referralContractAddress,
					functionName: 'mark_onboarded',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Parse reward points from simulation result
				let rewardPoints = 0
				const parsed = this.parseU32Return(result.simulation, 'markOnboarded')
				if (parsed !== undefined) {
					rewardPoints = parsed
				}

				return { success: true, txHash: result.txHash, rewardPoints }
			} catch (error) {
				logger.error('[GamificationContractService] Error marking onboarded:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – markOnboarded
	}

	/**
	 * Update quest progress in the Quest contract
	 */
	async updateQuestProgress(
		questContractAddress: string,
		params: UpdateQuestProgressParams,
	): Promise<GamificationTxResult<{ completed?: boolean }>> {
		return enqueue(async () => {
			try {
				const { userAddress, questId, progressValue } = params

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: update_progress(caller: Address, user: Address, quest_id: u32, progress_value: u32)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				const recorderAddressStr = this.client.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const userAddr = Address.fromString(userAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(userAddr, { type: 'address' }), // user
					nativeToScVal(questId, { type: 'u32' }), // quest_id
					nativeToScVal(progressValue, { type: 'u32' }), // progress_value
				]

				const result = await this.submitContractCall({
					contractAddress: questContractAddress,
					functionName: 'update_progress',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Transaction submitted successfully
				return {
					success: true,
					txHash: result.txHash,
					completed: false,
				}
			} catch (error) {
				logger.error('[GamificationContractService] Error updating quest progress:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – updateQuestProgress
	}

	/**
	 * Create a quest on-chain (requires admin role)
	 * Note: This uses an admin keypair, not the recorder keypair
	 */
	async createQuest(
		questContractAddress: string,
		params: CreateQuestParams,
		adminKeypair: Keypair,
	): Promise<GamificationTxResult<{ questId?: number }>> {
		return enqueue(async () => {
			try {
				const { questType, name, description, targetValue, rewardPoints, expiresAt } = params

				const adminAddress = Address.fromString(adminKeypair.publicKey())

				// Build contract invocation args
				// create_quest(caller: Address, quest_type: QuestType, name: String, description: String, target_value: u32, reward_points: u32, expires_at: u64) -> u32
				const args = [
					nativeToScVal(adminAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(questType, { type: 'u32' }), // quest_type
					nativeToScVal(name, { type: 'string' }), // name
					nativeToScVal(description, { type: 'string' }), // description
					nativeToScVal(targetValue, { type: 'u32' }), // target_value
					nativeToScVal(rewardPoints, { type: 'u32' }), // reward_points
					nativeToScVal(BigInt(expiresAt), { type: 'u64' }), // expires_at
				]

				const result = await this.submitContractCall({
					contractAddress: questContractAddress,
					functionName: 'create_quest',
					args,
					signer: adminKeypair,
					waitForConfirmation: true,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Decode the quest ID from the CONFIRMED transaction's return
				// value, not the simulation: if another authorized transaction
				// creates the predicted id first, this transaction creates
				// the next id instead. When the confirmed return value is
				// unavailable, leave questId unset rather than substituting
				// the simulation result.
				const questId = this.parseU32FromScVal(result.returnValue, 'createQuest')

				return {
					success: true,
					txHash: result.txHash,
					questId,
				}
			} catch (error) {
				logger.error('[GamificationContractService] Error creating quest:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – createQuest
	}

	// ========================================================================
	// NFT Contract Methods
	// ========================================================================

	/**
	 * Build an individual NFTAttribute as an ScVal map.
	 *
	 * The Soroban contracttype `NFTAttribute` has fields:
	 *   trait_type: String, value: String, display_type: Option<String>, max_value: Option<String>
	 */
	private buildNFTAttributeScVal(attr: NftAttributeInput): xdr.ScVal {
		const fields = [
			new xdr.ScMapEntry({
				key: nativeToScVal('display_type', { type: 'symbol' }),
				val:
					attr.display_type != null
						? xdr.ScVal.scvVec([nativeToScVal(attr.display_type, { type: 'string' })])
						: xdr.ScVal.scvVoid(),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('max_value', { type: 'symbol' }),
				val:
					attr.max_value != null
						? xdr.ScVal.scvVec([nativeToScVal(attr.max_value, { type: 'string' })])
						: xdr.ScVal.scvVoid(),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('trait_type', { type: 'symbol' }),
				val: nativeToScVal(attr.trait_type, { type: 'string' }),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('value', { type: 'symbol' }),
				val: nativeToScVal(attr.value, { type: 'string' }),
			}),
		]

		return xdr.ScVal.scvMap(fields)
	}

	/**
	 * Build the full NFTMetadata ScVal for on-chain submission.
	 *
	 * The Soroban contracttype `NFTMetadata` has fields:
	 *   name: String, description: String, image_uri: String, external_url: String,
	 *   attributes: Vec<NFTAttribute>
	 *
	 * Fields must be in alphabetical order for contracttype map encoding.
	 */
	private buildMetadataArg(metadata: NftMetadataInput): xdr.ScVal {
		const attrVec = metadata.attributes.map((a) => this.buildNFTAttributeScVal(a))

		const fields = [
			new xdr.ScMapEntry({
				key: nativeToScVal('attributes', { type: 'symbol' }),
				val: xdr.ScVal.scvVec(attrVec),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('description', { type: 'symbol' }),
				val: nativeToScVal(metadata.description, { type: 'string' }),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('external_url', { type: 'symbol' }),
				val: nativeToScVal(metadata.externalUrl, { type: 'string' }),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('image_uri', { type: 'symbol' }),
				val: nativeToScVal(metadata.imageUri, { type: 'string' }),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('name', { type: 'symbol' }),
				val: nativeToScVal(metadata.name, { type: 'string' }),
			}),
		]

		return xdr.ScVal.scvMap(fields)
	}

	/**
	 * Mint a new NFT with metadata on the KindFi NFT contract.
	 * Requires the "minter" role on the contract.
	 *
	 * Signature: mint_with_metadata(caller: Address, to: Address, nft_metadata: NFTMetadata) -> u32
	 */
	async mintNFT(
		nftContractAddress: string,
		params: MintNFTParams,
	): Promise<GamificationTxResult<{ tokenId?: number }>> {
		return enqueue(async () => {
			try {
				const { toAddress, metadata } = params

				const metadataArg = this.buildMetadataArg(metadata)

				const args = [
					nativeToScVal(Address.fromString(this.client.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(toAddress), { type: 'address' }),
					metadataArg,
				]

				const result = await this.submitContractCall({
					contractAddress: nftContractAddress,
					functionName: 'mint_with_metadata',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				// Parse token ID from simulation result (returns u32)
				const tokenId = this.parseU32Return(result.simulation, 'mintNFT')

				return { success: true, txHash: result.txHash, tokenId }
			} catch (error) {
				logger.error('[GamificationContractService] Error minting NFT:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – mintNFT
	}

	/**
	 * Update metadata for an existing NFT.
	 * Requires the "metadata_manager" role on the contract.
	 *
	 * Signature: update_metadata(caller: Address, token_id: u32, nft_metadata: NFTMetadata)
	 */
	async updateNFTMetadata(
		nftContractAddress: string,
		params: UpdateNFTMetadataParams,
	): Promise<GamificationTxResult> {
		return enqueue(async () => {
			try {
				const { tokenId, metadata } = params

				const metadataArg = this.buildMetadataArg(metadata)

				const args = [
					nativeToScVal(Address.fromString(this.client.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(tokenId, { type: 'u32' }),
					metadataArg,
				]

				const result = await this.submitContractCall({
					contractAddress: nftContractAddress,
					functionName: 'update_metadata',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				return { success: true, txHash: result.txHash }
			} catch (error) {
				logger.error('[GamificationContractService] Error updating NFT metadata:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – updateNFTMetadata
	}

	/**
	 * Grant a role on a contract using the admin keypair.
	 * Uses the same SDK transaction flow that works for Quest updates.
	 *
	 * Success is reported only when the transaction is confirmed with
	 * status SUCCESS. A FAILED transaction, a confirmation timeout, or an
	 * unknown outcome is a failure — the hash is kept so the caller can
	 * report it. (Previously the manual poll returned success when the
	 * first lookup was FAILED or every lookup was NOT_FOUND.)
	 */
	async grantRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
		adminKeypair: Keypair,
	): Promise<GamificationTxResult> {
		return enqueue(async () => {
			try {
				const args = [
					nativeToScVal(Address.fromString(accountAddress), {
						type: 'address',
					}), // account
					nativeToScVal(role, { type: 'symbol' }), // role
					nativeToScVal(Address.fromString(adminKeypair.publicKey()), {
						type: 'address',
					}), // caller (admin)
				]

				const result = await this.submitContractCall({
					contractAddress,
					functionName: 'grant_role',
					args,
					signer: adminKeypair,
					waitForConfirmation: true,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				return { success: true, txHash: result.txHash }
			} catch (error) {
				logger.error('[GamificationContractService] Error granting role:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – grantRole
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
		params: RecordReputationEventParams,
	): Promise<GamificationTxResult<{ totalPoints?: number }>> {
		return enqueue(async () => {
			try {
				const { userAddress, eventType, points } = params

				const recorderAddress = Address.fromString(this.client.recorderKeypair.publicKey())
				const userAddr = Address.fromString(userAddress)

				const useCustomPoints = points != null && points > 0
				const args = useCustomPoints
					? [
							nativeToScVal(recorderAddress, { type: 'address' }),
							nativeToScVal(userAddr, { type: 'address' }),
							nativeToScVal(eventType, { type: 'u32' }),
							nativeToScVal(points, { type: 'u32' }),
						]
					: [
							nativeToScVal(recorderAddress, { type: 'address' }),
							nativeToScVal(userAddr, { type: 'address' }),
							nativeToScVal(eventType, { type: 'u32' }),
						]

				const result = await this.submitContractCall({
					contractAddress: reputationContractAddress,
					functionName: useCustomPoints ? 'record_event_with_points' : 'record_event',
					args,
					signer: this.client.recorderKeypair,
				})

				if (!result.success) {
					return { success: false, txHash: result.txHash, error: result.error }
				}

				const totalPoints = this.parseU32Return(result.simulation, 'recordReputationEvent')

				return { success: true, txHash: result.txHash, totalPoints }
			} catch (error) {
				logger.error('[GamificationContractService] Error recording reputation event:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		})
	}
}

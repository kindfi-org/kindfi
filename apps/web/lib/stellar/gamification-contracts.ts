/**
 * Gamification Contract Service
 *
 * Service for invoking gamification smart contracts (Streak, Referral, Quest, Reputation)
 * Uses a service account with "recorder" role to record events on-chain.
 *
 * The recorder account secret key should be stored in SOROBAN_PRIVATE_KEY environment variable.
 */

import {
	Account,
	Address,
	Keypair,
	nativeToScVal,
	Operation,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import * as SorobanRpc from '@stellar/stellar-sdk/rpc'
import { Api, assembleTransaction } from '@stellar/stellar-sdk/rpc'

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

interface MintNFTParams {
	toAddress: string // Recipient's Stellar address
	metadata: {
		name: string
		description: string
		imageUri: string
		externalUrl: string
		attributes: Array<{
			trait_type: string
			value: string
			display_type?: string
			max_value?: string
		}>
	}
}

interface UpdateNFTMetadataParams {
	tokenId: number
	metadata: {
		name: string
		description: string
		imageUri: string
		externalUrl: string
		attributes: Array<{
			trait_type: string
			value: string
			display_type?: string
			max_value?: string
		}>
	}
}

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

export class GamificationContractService {
	private server: SorobanRpc.Server
	private networkPassphrase: string
	private recorderKeypair: Keypair

	constructor(
		rpcUrl?: string,
		networkPassphrase?: string,
		recorderSecretKey?: string,
	) {
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

		this.server = new SorobanRpc.Server(rpc, { allowHttp: true })
		this.networkPassphrase = passphrase
		this.recorderKeypair = Keypair.fromSecret(secretKey)
	}

	/**
	 * Record a donation in the Streak contract
	 */
	async recordStreakDonation(
		streakContractAddress: string,
		params: RecordStreakDonationParams,
	): Promise<{ success: boolean; streak?: number; error?: string }> {
		return enqueue(async () => {
			try {
				const { userAddress, period, donationTimestamp } = params

				console.log(
					'[GamificationContractService] recordStreakDonation called:',
					{
						contract: streakContractAddress,
						userAddress,
						period,
						donationTimestamp,
					},
				)

				// Convert period to enum (0 = Weekly, 1 = Monthly)
				const periodValue = period === 'weekly' ? 0 : 1

				// Get recorder account
				console.log(
					'[GamificationContractService] Fetching recorder account...',
				)
				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => {
						const account = new Account(res.accountId(), res.sequenceNumber())
						console.log('[GamificationContractService] Recorder account:', {
							address: account.accountId(),
							sequence: account.sequenceNumber(),
						})
						return account
					})

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: record_donation(caller: Address, user: Address, period: StreakPeriod, donation_timestamp: u64)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				console.log(
					'[GamificationContractService] Building contract invocation...',
				)
				const recorderAddressStr = this.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const userAddr = Address.fromString(userAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(userAddr, { type: 'address' }), // user
					nativeToScVal(periodValue, { type: 'u32' }), // period: StreakPeriod enum (0 = Weekly, 1 = Monthly)
					nativeToScVal(BigInt(donationTimestamp), { type: 'u64' }), // donation_timestamp
				]

				console.log('[GamificationContractService] Contract args:', {
					caller: recorderAddressStr,
					user: userAddress,
					period: periodValue,
					timestamp: donationTimestamp,
					argsCount: args.length,
				})

				const operation = Operation.invokeContractFunction({
					contract: streakContractAddress,
					function: 'record_donation',
					args,
				})

				// Build transaction
				console.log('[GamificationContractService] Building transaction...')
				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				// Simulate transaction first
				console.log('[GamificationContractService] Simulating transaction...')
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] Simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Assemble transaction with simulation results
				const assembledTx = assembleTransaction(transaction, simulation).build()

				assembledTx.sign(this.recorderKeypair)
				console.log(
					'[GamificationContractService] Transaction signed, submitting...',
				)

				// Submit transaction
				const result = await this.server.sendTransaction(assembledTx)
				console.log(
					'[GamificationContractService] Transaction submission result:',
					{
						status: result.status,
						hash: result.hash,
						errorResult: result.errorResult,
					},
				)

				if (result.status === 'ERROR') {
					console.error(
						'[GamificationContractService] Transaction failed:',
						result,
					)
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				// Wait for transaction to be included in ledger
				// Note: The contract returns the new streak count, but we'd need to parse it from the transaction result
				// For now, we'll return success if the transaction was submitted
				console.log(
					'[GamificationContractService] Streak donation recorded successfully',
				)
				return {
					success: true,
					streak: 1, // TODO: Parse from transaction result after confirmation
				}
			} catch (error) {
				console.error(
					'[GamificationContractService] Error recording streak donation:',
					error,
				)
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
	): Promise<{ success: boolean; rewardPoints?: number; error?: string }> {
		return enqueue(async () => {
			try {
				const { referredAddress } = params

				console.log(
					'[GamificationContractService] recordReferralDonation called:',
					{
						contract: referralContractAddress,
						referredAddress,
					},
				)

				// Get recorder account
				console.log(
					'[GamificationContractService] Fetching recorder account...',
				)
				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => {
						const account = new Account(res.accountId(), res.sequenceNumber())
						console.log('[GamificationContractService] Recorder account:', {
							address: account.accountId(),
							sequence: account.sequenceNumber(),
						})
						return account
					})

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: record_donation(caller: Address, referred: Address)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				console.log(
					'[GamificationContractService] Building contract invocation...',
				)
				const recorderAddressStr = this.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const referredAddr = Address.fromString(referredAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(referredAddr, { type: 'address' }), // referred
				]

				console.log('[GamificationContractService] Contract args:', {
					caller: recorderAddressStr,
					referred: referredAddress,
					argsCount: args.length,
				})

				const operation = Operation.invokeContractFunction({
					contract: referralContractAddress,
					function: 'record_donation',
					args,
				})

				// Build transaction
				console.log('[GamificationContractService] Building transaction...')
				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				// Simulate transaction first
				console.log('[GamificationContractService] Simulating transaction...')
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] Simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Parse reward points from simulation result (record_donation returns u32)
				let rewardPoints = 0
				if (simulation.result?.retval) {
					try {
						const { scValToNative } = await import('@stellar/stellar-sdk')
						rewardPoints =
							(scValToNative(simulation.result.retval) as number) ?? 0
						console.log(
							'[GamificationContractService] Parsed reward points:',
							rewardPoints,
						)
					} catch {
						console.warn(
							'[GamificationContractService] Could not parse reward points from record_donation',
						)
					}
				}

				// Assemble transaction with simulation results
				const assembledTx = assembleTransaction(transaction, simulation).build()

				assembledTx.sign(this.recorderKeypair)
				console.log(
					'[GamificationContractService] Transaction signed, submitting...',
				)

				// Submit transaction
				const result = await this.server.sendTransaction(assembledTx)
				console.log(
					'[GamificationContractService] Transaction submission result:',
					{
						status: result.status,
						hash: result.hash,
						errorResult: result.errorResult,
					},
				)

				if (result.status === 'ERROR') {
					console.error(
						'[GamificationContractService] Transaction failed:',
						result,
					)
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				// Transaction submitted successfully
				console.log(
					'[GamificationContractService] Referral donation recorded successfully',
				)
				return {
					success: true,
					rewardPoints,
				}
			} catch (error) {
				console.error(
					'[GamificationContractService] Error recording referral donation:',
					error,
				)
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
	 */
	async createReferral(
		referralContractAddress: string,
		params: CreateReferralParams,
	): Promise<{ success: boolean; error?: string }> {
		return enqueue(async () => {
			try {
				const { referrerAddress, referredAddress } = params

				console.log('[GamificationContractService] createReferral called:', {
					contract: referralContractAddress,
					referrerAddress,
					referredAddress,
				})

				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => new Account(res.accountId(), res.sequenceNumber()))

				const args = [
					nativeToScVal(Address.fromString(this.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referrerAddress), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referredAddress), {
						type: 'address',
					}),
				]

				const operation = Operation.invokeContractFunction({
					contract: referralContractAddress,
					function: 'create_referral',
					args,
				})

				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] createReferral simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				const assembledTx = assembleTransaction(transaction, simulation).build()
				assembledTx.sign(this.recorderKeypair)

				const result = await this.server.sendTransaction(assembledTx)
				console.log('[GamificationContractService] createReferral result:', {
					status: result.status,
					hash: result.hash,
				})

				if (result.status === 'ERROR') {
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				return { success: true }
			} catch (error) {
				console.error(
					'[GamificationContractService] Error creating referral:',
					error,
				)
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
	): Promise<{ success: boolean; rewardPoints?: number; error?: string }> {
		return enqueue(async () => {
			try {
				const { referredAddress } = params

				console.log('[GamificationContractService] markOnboarded called:', {
					contract: referralContractAddress,
					referredAddress,
				})

				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => new Account(res.accountId(), res.sequenceNumber()))

				const args = [
					nativeToScVal(Address.fromString(this.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(referredAddress), {
						type: 'address',
					}),
				]

				const operation = Operation.invokeContractFunction({
					contract: referralContractAddress,
					function: 'mark_onboarded',
					args,
				})

				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] markOnboarded simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Parse reward points from simulation result
				let rewardPoints = 0
				if (simulation.result?.retval) {
					try {
						const { scValToNative } = await import('@stellar/stellar-sdk')
						rewardPoints =
							(scValToNative(simulation.result.retval) as number) ?? 0
					} catch {
						console.warn(
							'[GamificationContractService] Could not parse reward points from markOnboarded',
						)
					}
				}

				const assembledTx = assembleTransaction(transaction, simulation).build()
				assembledTx.sign(this.recorderKeypair)

				const result = await this.server.sendTransaction(assembledTx)
				console.log('[GamificationContractService] markOnboarded result:', {
					status: result.status,
					hash: result.hash,
					rewardPoints,
				})

				if (result.status === 'ERROR') {
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				return { success: true, rewardPoints }
			} catch (error) {
				console.error(
					'[GamificationContractService] Error marking onboarded:',
					error,
				)
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
	): Promise<{ success: boolean; completed?: boolean; error?: string }> {
		return enqueue(async () => {
			try {
				const { userAddress, questId, progressValue } = params

				console.log(
					'[GamificationContractService] updateQuestProgress called:',
					{
						contract: questContractAddress,
						userAddress,
						questId,
						progressValue,
					},
				)

				// Get recorder account
				console.log(
					'[GamificationContractService] Fetching recorder account...',
				)
				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => {
						const account = new Account(res.accountId(), res.sequenceNumber())
						console.log('[GamificationContractService] Recorder account:', {
							address: account.accountId(),
							sequence: account.sequenceNumber(),
						})
						return account
					})

				// Build contract invocation using Operation.invokeContractFunction()
				// Signature: update_progress(caller: Address, user: Address, quest_id: u32, progress_value: u32)
				// Note: The caller parameter must match the transaction source account (recorderAccount)
				console.log(
					'[GamificationContractService] Building contract invocation...',
				)
				const recorderAddressStr = this.recorderKeypair.publicKey()
				const recorderAddress = Address.fromString(recorderAddressStr)
				const userAddr = Address.fromString(userAddress)

				const args = [
					nativeToScVal(recorderAddress, { type: 'address' }), // caller (must match transaction source)
					nativeToScVal(userAddr, { type: 'address' }), // user
					nativeToScVal(questId, { type: 'u32' }), // quest_id
					nativeToScVal(progressValue, { type: 'u32' }), // progress_value
				]

				console.log('[GamificationContractService] Contract args:', {
					caller: recorderAddressStr,
					user: userAddress,
					questId,
					progressValue,
					argsCount: args.length,
				})

				const operation = Operation.invokeContractFunction({
					contract: questContractAddress,
					function: 'update_progress',
					args,
				})

				// Build transaction
				console.log('[GamificationContractService] Building transaction...')
				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				// Simulate transaction first
				console.log('[GamificationContractService] Simulating transaction...')
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] Simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Assemble transaction with simulation results
				const assembledTx = assembleTransaction(transaction, simulation).build()

				assembledTx.sign(this.recorderKeypair)
				console.log(
					'[GamificationContractService] Transaction signed, submitting...',
				)

				// Submit transaction
				const result = await this.server.sendTransaction(assembledTx)
				console.log(
					'[GamificationContractService] Transaction submission result:',
					{
						status: result.status,
						hash: result.hash,
						errorResult: result.errorResult,
					},
				)

				if (result.status === 'ERROR') {
					console.error(
						'[GamificationContractService] Transaction failed:',
						result,
					)
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				// Transaction submitted successfully
				console.log(
					'[GamificationContractService] Quest progress updated successfully',
				)
				return {
					success: true,
					completed: false, // TODO: Parse from transaction result after confirmation
				}
			} catch (error) {
				console.error(
					'[GamificationContractService] Error updating quest progress:',
					error,
				)
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
	): Promise<{ success: boolean; questId?: number; error?: string }> {
		return enqueue(async () => {
			try {
				const {
					questType,
					name,
					description,
					targetValue,
					rewardPoints,
					expiresAt,
				} = params

				console.log('[GamificationContractService] createQuest called:', {
					contract: questContractAddress,
					questType,
					name,
					targetValue,
					rewardPoints,
				})

				// Get admin account
				console.log('[GamificationContractService] Fetching admin account...')
				const adminAccount = await this.server
					.getAccount(adminKeypair.publicKey())
					.then((res) => {
						const account = new Account(res.accountId(), res.sequenceNumber())
						console.log('[GamificationContractService] Admin account:', {
							address: account.accountId(),
							sequence: account.sequenceNumber(),
						})
						return account
					})
					.catch((error) => {
						console.error(
							'[GamificationContractService] Error fetching admin account:',
							error,
						)
						throw error
					})

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

				console.log('[GamificationContractService] Contract args:', {
					caller: adminKeypair.publicKey(),
					questType,
					name,
					targetValue,
					rewardPoints,
					expiresAt,
					argsCount: args.length,
				})

				const operation = Operation.invokeContractFunction({
					contract: questContractAddress,
					function: 'create_quest',
					args,
				})

				// Build transaction
				console.log('[GamificationContractService] Building transaction...')
				const transaction = new TransactionBuilder(adminAccount, {
					fee: '100',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				// Simulate transaction first
				console.log('[GamificationContractService] Simulating transaction...')
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] Simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Assemble transaction with simulation results
				const assembledTx = assembleTransaction(transaction, simulation).build()

				assembledTx.sign(adminKeypair)
				console.log(
					'[GamificationContractService] Transaction signed, submitting...',
				)

				// Submit transaction
				const result = await this.server.sendTransaction(assembledTx)
				console.log(
					'[GamificationContractService] Transaction submission result:',
					{
						status: result.status,
						hash: result.hash,
						errorResult: result.errorResult,
					},
				)

				if (result.status === 'ERROR') {
					console.error(
						'[GamificationContractService] Transaction failed:',
						result,
					)
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				// Parse quest ID from simulation result
				// The create_quest function returns the quest_id (u32)
				let questId: number | undefined
				if (simulation.result?.retval) {
					try {
						// Convert ScVal to native value
						const { scValToNative } = await import('@stellar/stellar-sdk')
						questId = scValToNative(simulation.result.retval) as number
					} catch (e) {
						console.warn(
							'[GamificationContractService] Could not parse quest ID from simulation result',
							e,
						)
					}
				}

				console.log(
					'[GamificationContractService] Quest created successfully',
					{
						questId,
					},
				)
				return {
					success: true,
					questId,
				}
			} catch (error) {
				console.error(
					'[GamificationContractService] Error creating quest:',
					error,
				)
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
	private buildNFTAttributeScVal(attr: {
		trait_type: string
		value: string
		display_type?: string
		max_value?: string
	}) {
		const fields = [
			new xdr.ScMapEntry({
				key: nativeToScVal('display_type', { type: 'symbol' }),
				val:
					attr.display_type != null
						? xdr.ScVal.scvVec([
								nativeToScVal(attr.display_type, { type: 'string' }),
							])
						: xdr.ScVal.scvVoid(),
			}),
			new xdr.ScMapEntry({
				key: nativeToScVal('max_value', { type: 'symbol' }),
				val:
					attr.max_value != null
						? xdr.ScVal.scvVec([
								nativeToScVal(attr.max_value, { type: 'string' }),
							])
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
	private buildMetadataArg(metadata: MintNFTParams['metadata']) {
		const attrVec = metadata.attributes.map((a) =>
			this.buildNFTAttributeScVal(a),
		)

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
	): Promise<{ success: boolean; tokenId?: number; error?: string }> {
		return enqueue(async () => {
			try {
				const { toAddress, metadata } = params

				console.log('[GamificationContractService] mintNFT called:', {
					contract: nftContractAddress,
					to: toAddress,
					name: metadata.name,
				})

				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => new Account(res.accountId(), res.sequenceNumber()))

				const metadataArg = this.buildMetadataArg(metadata)

				const args = [
					nativeToScVal(Address.fromString(this.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(Address.fromString(toAddress), { type: 'address' }),
					metadataArg,
				]

				const operation = Operation.invokeContractFunction({
					contract: nftContractAddress,
					function: 'mint_with_metadata',
					args,
				})

				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '1000000',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				console.log(
					'[GamificationContractService] Simulating mint_with_metadata...',
				)
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] mintNFT simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				// Parse token ID from simulation result (returns u32)
				let tokenId: number | undefined
				if (simulation.result?.retval) {
					try {
						const { scValToNative } = await import('@stellar/stellar-sdk')
						tokenId = scValToNative(simulation.result.retval) as number
						console.log(
							'[GamificationContractService] Minted token ID:',
							tokenId,
						)
					} catch {
						console.warn(
							'[GamificationContractService] Could not parse token ID from simulation',
						)
					}
				}

				const assembledTx = assembleTransaction(transaction, simulation).build()
				assembledTx.sign(this.recorderKeypair)

				console.log(
					'[GamificationContractService] Submitting mint transaction...',
				)
				const result = await this.server.sendTransaction(assembledTx)
				console.log('[GamificationContractService] mintNFT result:', {
					status: result.status,
					hash: result.hash,
					tokenId,
				})

				if (result.status === 'ERROR') {
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				return { success: true, tokenId }
			} catch (error) {
				console.error('[GamificationContractService] Error minting NFT:', error)
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
	): Promise<{ success: boolean; error?: string }> {
		return enqueue(async () => {
			try {
				const { tokenId, metadata } = params

				console.log('[GamificationContractService] updateNFTMetadata called:', {
					contract: nftContractAddress,
					tokenId,
					name: metadata.name,
				})

				const recorderAccount = await this.server
					.getAccount(this.recorderKeypair.publicKey())
					.then((res) => new Account(res.accountId(), res.sequenceNumber()))

				const metadataArg = this.buildMetadataArg(metadata)

				const args = [
					nativeToScVal(Address.fromString(this.recorderKeypair.publicKey()), {
						type: 'address',
					}),
					nativeToScVal(tokenId, { type: 'u32' }),
					metadataArg,
				]

				const operation = Operation.invokeContractFunction({
					contract: nftContractAddress,
					function: 'update_metadata',
					args,
				})

				const transaction = new TransactionBuilder(recorderAccount, {
					fee: '1000000',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				console.log(
					'[GamificationContractService] Simulating update_metadata...',
				)
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] updateNFTMetadata simulation failed:',
						simulation,
					)
					return {
						success: false,
						error: `Simulation failed: ${JSON.stringify(simulation)}`,
					}
				}

				const assembledTx = assembleTransaction(transaction, simulation).build()
				assembledTx.sign(this.recorderKeypair)

				console.log(
					'[GamificationContractService] Submitting update_metadata transaction...',
				)
				const result = await this.server.sendTransaction(assembledTx)
				console.log('[GamificationContractService] updateNFTMetadata result:', {
					status: result.status,
					hash: result.hash,
				})

				if (result.status === 'ERROR') {
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result)}`,
					}
				}

				return { success: true }
			} catch (error) {
				console.error(
					'[GamificationContractService] Error updating NFT metadata:',
					error,
				)
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
	 */
	async grantRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
		adminKeypair: Keypair,
	): Promise<{ success: boolean; error?: string }> {
		return enqueue(async () => {
			try {
				console.log('[GamificationContractService] grantRole called:', {
					contract: contractAddress,
					account: accountAddress,
					role,
					admin: adminKeypair.publicKey(),
				})

				const adminAccount = await this.server
					.getAccount(adminKeypair.publicKey())
					.then((res) => new Account(res.accountId(), res.sequenceNumber()))

				const args = [
					nativeToScVal(Address.fromString(accountAddress), {
						type: 'address',
					}), // account
					nativeToScVal(role, { type: 'symbol' }), // role
					nativeToScVal(Address.fromString(adminKeypair.publicKey()), {
						type: 'address',
					}), // caller (admin)
				]

				const operation = Operation.invokeContractFunction({
					contract: contractAddress,
					function: 'grant_role',
					args,
				})

				const transaction = new TransactionBuilder(adminAccount, {
					fee: '1000000',
					networkPassphrase: this.networkPassphrase,
				})
					.addOperation(operation)
					.setTimeout(60)
					.build()

				console.log('[GamificationContractService] Simulating grant_role...')
				const simulation = await this.server.simulateTransaction(transaction)

				if (Api.isSimulationError(simulation)) {
					console.error(
						'[GamificationContractService] grant_role simulation failed:',
						simulation.error,
					)
					return {
						success: false,
						error: `Simulation failed: ${simulation.error}`,
					}
				}

				const assembledTx = assembleTransaction(transaction, simulation).build()
				assembledTx.sign(adminKeypair)

				console.log(
					'[GamificationContractService] Submitting grant_role transaction...',
				)
				const result = await this.server.sendTransaction(assembledTx)
				console.log(
					'[GamificationContractService] grant_role submission result:',
					{
						status: result.status,
						hash: result.hash,
					},
				)

				if (result.status === 'ERROR') {
					return {
						success: false,
						error: `Transaction failed: ${JSON.stringify(result.errorResult)}`,
					}
				}

				// Wait for confirmation
				if (result.status === 'PENDING') {
					console.log(
						'[GamificationContractService] Waiting for grant_role confirmation...',
					)
					const confirmed = await this.server.getTransaction(result.hash)
					if (confirmed.status === 'NOT_FOUND') {
						// Poll a few times
						for (let i = 0; i < 10; i++) {
							await new Promise((r) => setTimeout(r, 2000))
							const check = await this.server.getTransaction(result.hash)
							if (check.status === 'SUCCESS') {
								console.log(
									'[GamificationContractService] grant_role confirmed!',
								)
								return { success: true }
							}
							if (check.status === 'FAILED') {
								return { success: false, error: 'Transaction failed on-chain' }
							}
						}
					}
				}

				return { success: true }
			} catch (error) {
				console.error(
					'[GamificationContractService] Error granting role:',
					error,
				)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		}) // end enqueue – grantRole
	}

	/**
	 * Check if an account has a specific role on a contract.
	 */
	async hasRole(
		contractAddress: string,
		accountAddress: string,
		role: string,
	): Promise<{ hasRole: boolean; error?: string }> {
		try {
			const args = [
				nativeToScVal(Address.fromString(accountAddress), { type: 'address' }),
				nativeToScVal(role, { type: 'symbol' }),
			]

			const operation = Operation.invokeContractFunction({
				contract: contractAddress,
				function: 'has_role',
				args,
			})

			const account = await this.server
				.getAccount(this.recorderKeypair.publicKey())
				.then((res) => new Account(res.accountId(), res.sequenceNumber()))

			const transaction = new TransactionBuilder(account, {
				fee: '100',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(operation)
				.setTimeout(60)
				.build()

			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				return { hasRole: false, error: simulation.error }
			}

			// has_role returns Option<u32>: Some(index) means granted, None means not granted
			if (simulation.result?.retval) {
				const { scValToNative } = await import('@stellar/stellar-sdk')
				const result = scValToNative(simulation.result.retval)
				// None becomes undefined/null, Some(n) becomes a number
				const granted = result !== undefined && result !== null
				console.log(
					`[GamificationContractService] has_role result: ${JSON.stringify(result)} -> ${granted}`,
				)
				return { hasRole: granted }
			}

			return { hasRole: false }
		} catch (error) {
			return {
				hasRole: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
}

/**
 * Governance Contract Service
 *
 * Calls the KindFi Governance Soroban contract using the Stellar CLI.
 *
 * Uses the CLI instead of the JS SDK for contract invocations because
 * stellar-sdk v14 cannot parse Protocol 22 auth XDR returned by the
 * Soroban RPC ("Bad union switch: 4"). The CLI (Rust SDK) handles this
 * correctly. The JS SDK is still used for simple RPC reads (getLatestLedger).
 *
 * Required env vars:
 *   GOVERNANCE_CONTRACT_ADDRESS  — deployed contract address
 *   SOROBAN_PRIVATE_KEY          — service account secret key (admin + recorder)
 */

import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'

import { Keypair } from '@stellar/stellar-sdk'
import { Server } from '@stellar/stellar-sdk/rpc'
import type { NftTier } from '~/lib/governance/types'

const execFile = promisify(execFileCb)

const SECONDS_PER_LEDGER = 5

const TIER_TO_U32: Record<NftTier, number> = {
	bronze: 1,
	silver: 2,
	gold: 3,
	diamond: 4,
}

const VOTE_TYPE_TO_U32: Record<'up' | 'down', number> = {
	up: 0,
	down: 1,
}

// ============================================================================
// Stellar CLI wrapper
// ============================================================================

async function stellarInvoke(
	secretKey: string,
	contractAddress: string,
	functionName: string,
	fnArgs: string[],
): Promise<{ success: boolean; output?: string; error?: string }> {
	const cliArgs = [
		'contract',
		'invoke',
		'--source-account',
		secretKey,
		'--id',
		contractAddress,
		'--network',
		'testnet',
		'--fee',
		'10000000',
		'--',
		functionName,
		...fnArgs,
	]

	try {
		const { stdout } = await execFile('stellar', cliArgs, {
			timeout: 120_000,
		})
		return { success: true, output: stdout.trim() }
	} catch (err: unknown) {
		const execErr = err as { stderr?: string; message?: string }
		const msg = execErr.stderr?.trim() || execErr.message || String(err)
		return { success: false, error: msg }
	}
}

// ============================================================================
// Service
// ============================================================================

export class GovernanceContractService {
	private server: Server
	private secretKey: string
	private publicKey: string
	private contractAddress: string

	constructor() {
		const rpcUrl = process.env.RPC_URL ?? 'https://soroban-testnet.stellar.org'
		const secretKey = process.env.SOROBAN_PRIVATE_KEY
		const contractAddr = process.env.GOVERNANCE_CONTRACT_ADDRESS

		if (!secretKey) throw new Error('SOROBAN_PRIVATE_KEY is not configured')
		if (!contractAddr)
			throw new Error('GOVERNANCE_CONTRACT_ADDRESS is not configured')

		this.server = new Server(rpcUrl)
		this.secretKey = secretKey
		this.publicKey = Keypair.fromSecret(secretKey).publicKey()
		this.contractAddress = contractAddr
	}

	/**
	 * Convert an ISO timestamp string to an approximate Stellar ledger sequence
	 * by querying the current ledger and projecting forward/backward.
	 */
	private async timestampToLedger(isoTimestamp: string): Promise<number> {
		const targetMs = new Date(isoTimestamp).getTime()
		const nowMs = Date.now()
		const diffSeconds = (targetMs - nowMs) / 1000

		const latestLedger = await this.server.getLatestLedger()
		const ledgerOffset = Math.round(diffSeconds / SECONDS_PER_LEDGER)
		return Math.max(1, latestLedger.sequence + ledgerOffset)
	}

	// --------------------------------------------------------------------------
	// Admin operations
	// --------------------------------------------------------------------------

	async createRound(params: {
		title: string
		startsAt: string
		endsAt: string
		fundAmount: number
	}): Promise<{ success: boolean; roundId?: number; error?: string }> {
		const { title, startsAt, endsAt, fundAmount } = params

		const [startLedger, endLedger] = await Promise.all([
			this.timestampToLedger(startsAt),
			this.timestampToLedger(endsAt),
		])

		const fundAmountI128 = BigInt(Math.round(fundAmount * 10_000_000))

		const result = await stellarInvoke(
			this.secretKey,
			this.contractAddress,
			'create_round',
			[
				'--caller',
				this.publicKey,
				'--title',
				title,
				'--start_ledger',
				String(startLedger),
				'--end_ledger',
				String(endLedger),
				'--fund_amount',
				String(fundAmountI128),
			],
		)

		if (!result.success) {
			console.warn('[GovernanceContract] create_round failed:', result.error)
			return { success: false, error: result.error }
		}

		const roundId = Number.parseInt(result.output ?? '', 10)
		return {
			success: true,
			roundId: Number.isNaN(roundId) ? undefined : roundId,
		}
	}

	async addOption(params: {
		roundId: number
		title: string
	}): Promise<{ success: boolean; optionId?: number; error?: string }> {
		const { roundId, title } = params

		const result = await stellarInvoke(
			this.secretKey,
			this.contractAddress,
			'add_option',
			[
				'--caller',
				this.publicKey,
				'--round_id',
				String(roundId),
				'--title',
				title,
			],
		)

		if (!result.success) {
			console.warn('[GovernanceContract] add_option failed:', result.error)
			return { success: false, error: result.error }
		}

		const optionId = Number.parseInt(result.output ?? '', 10)
		return {
			success: true,
			optionId: Number.isNaN(optionId) ? undefined : optionId,
		}
	}

	// --------------------------------------------------------------------------
	// Recorder operations
	// --------------------------------------------------------------------------

	async recordVote(params: {
		voterAddress: string
		roundId: number
		optionId: number
		voteType: 'up' | 'down'
		tier: NftTier
	}): Promise<{ success: boolean; weight?: number; error?: string }> {
		const { voterAddress, roundId, optionId, voteType, tier } = params

		const result = await stellarInvoke(
			this.secretKey,
			this.contractAddress,
			'record_vote',
			[
				'--caller',
				this.publicKey,
				'--voter',
				voterAddress,
				'--round_id',
				String(roundId),
				'--option_id',
				String(optionId),
				'--vote_type',
				String(VOTE_TYPE_TO_U32[voteType]),
				'--tier',
				String(TIER_TO_U32[tier]),
			],
		)

		if (!result.success) {
			console.warn('[GovernanceContract] record_vote failed:', result.error)
			return { success: false, error: result.error }
		}

		const weight = Number.parseInt(result.output ?? '', 10)
		return {
			success: true,
			weight: Number.isNaN(weight) ? undefined : weight,
		}
	}
}

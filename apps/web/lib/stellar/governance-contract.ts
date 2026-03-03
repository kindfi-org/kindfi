/**
 * Governance Contract Service
 *
 * Calls the KindFi Governance Soroban contract using the backend service account.
 * The service account (SOROBAN_PRIVATE_KEY / kindfi-backend) holds both the
 * "admin" role (create_round, add_option) and the "recorder" role (record_vote).
 *
 * Required env vars:
 *   GOVERNANCE_CONTRACT_ADDRESS  — deployed contract address
 *   SOROBAN_PRIVATE_KEY          — service account secret key (admin + recorder)
 *   RPC_URL                      — Stellar Soroban RPC endpoint
 *   NETWORK_PASSPHRASE           — Stellar network passphrase
 */

import {
	Account,
	Address,
	Keypair,
	Networks,
	nativeToScVal,
	Operation,
	TransactionBuilder,
	type xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import type { NftTier } from '~/lib/governance/types'

// Approximate seconds per ledger on Stellar
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
// Core simulate-and-submit helper
// ============================================================================

async function simulateAndSend(
	server: Server,
	networkPassphrase: string,
	keypair: Keypair,
	contractAddress: string,
	functionName: string,
	args: xdr.ScVal[],
): Promise<{ success: boolean; returnValue?: xdr.ScVal; error?: string }> {
	try {
		const accountData = await server.getAccount(keypair.publicKey())
		const source = new Account(
			accountData.accountId(),
			accountData.sequenceNumber(),
		)

		const tx = new TransactionBuilder(source, {
			fee: '1000000',
			networkPassphrase,
		})
			.addOperation(
				Operation.invokeContractFunction({
					contract: contractAddress,
					function: functionName,
					args,
				}),
			)
			.setTimeout(30)
			.build()

		const simResult = await server.simulateTransaction(tx)

		if (Api.isSimulationError(simResult)) {
			return { success: false, error: simResult.error }
		}

		const assembled = assembleTransaction(tx, simResult)
		assembled.sign(keypair)

		const sendResult = await server.sendTransaction(assembled)
		if (sendResult.status === 'ERROR') {
			return {
				success: false,
				error: `Send failed: ${sendResult.errorResult?.toXDR('base64') ?? 'unknown'}`,
			}
		}

		// Poll for confirmation (max ~15 s)
		for (let i = 0; i < 10; i++) {
			const getResult = await server.getTransaction(sendResult.hash)
			if (getResult.status === Api.GetTransactionStatus.SUCCESS) {
				return { success: true, returnValue: getResult.returnValue }
			}
			if (getResult.status === Api.GetTransactionStatus.FAILED) {
				return { success: false, error: `Transaction failed on-chain` }
			}
			await new Promise((r) => setTimeout(r, 1500))
		}

		return { success: false, error: 'Confirmation timeout' }
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err),
		}
	}
}

// ============================================================================
// Service
// ============================================================================

export class GovernanceContractService {
	private server: Server
	private networkPassphrase: string
	private keypair: Keypair
	private contractAddress: string

	constructor() {
		const rpcUrl = process.env.RPC_URL ?? 'https://soroban-testnet.stellar.org'
		const passphrase = process.env.NETWORK_PASSPHRASE ?? Networks.TESTNET
		const secretKey = process.env.SOROBAN_PRIVATE_KEY
		const contractAddr = process.env.GOVERNANCE_CONTRACT_ADDRESS

		if (!secretKey) throw new Error('SOROBAN_PRIVATE_KEY is not configured')
		if (!contractAddr)
			throw new Error('GOVERNANCE_CONTRACT_ADDRESS is not configured')

		this.server = new Server(rpcUrl)
		this.networkPassphrase = passphrase
		this.keypair = Keypair.fromSecret(secretKey)
		this.contractAddress = contractAddr
	}

	// --------------------------------------------------------------------------
	// Helpers
	// --------------------------------------------------------------------------

	/**
	 * Convert an ISO timestamp string to an approximate Stellar ledger sequence
	 * by querying the current ledger and projecting forward/backward.
	 */
	private async timestampToLedger(isoTimestamp: string): Promise<number> {
		const targetMs = new Date(isoTimestamp).getTime()
		const nowMs = Date.now()
		const diffSeconds = (targetMs - nowMs) / 1000

		const latestLedger = await this.server.getLatestLedger()
		const currentSeq = latestLedger.sequence

		const ledgerOffset = Math.round(diffSeconds / SECONDS_PER_LEDGER)
		return Math.max(1, currentSeq + ledgerOffset)
	}

	// --------------------------------------------------------------------------
	// Admin operations
	// --------------------------------------------------------------------------

	/**
	 * Register a new governance round on-chain.
	 * Accepts ISO timestamps and converts them to approximate ledger sequences.
	 * Returns the on-chain round ID assigned by the contract.
	 */
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

		// fund_amount stored as i128 in stroops-equivalent (multiply by 1e7)
		const fundAmountI128 = BigInt(Math.round(fundAmount * 10_000_000))

		const callerAddr = Address.fromString(this.keypair.publicKey())

		const args: xdr.ScVal[] = [
			nativeToScVal(callerAddr, { type: 'address' }),
			nativeToScVal(title, { type: 'string' }),
			nativeToScVal(startLedger, { type: 'u32' }),
			nativeToScVal(endLedger, { type: 'u32' }),
			nativeToScVal(fundAmountI128, { type: 'i128' }),
		]

		const result = await simulateAndSend(
			this.server,
			this.networkPassphrase,
			this.keypair,
			this.contractAddress,
			'create_round',
			args,
		)

		if (!result.success) {
			console.warn('[GovernanceContract] create_round failed:', result.error)
			return { success: false, error: result.error }
		}

		const roundId = result.returnValue?.u32?.()
		return { success: true, roundId }
	}

	/**
	 * Add an option to an existing on-chain round.
	 * Returns the on-chain option ID assigned by the contract.
	 */
	async addOption(params: {
		roundId: number
		title: string
	}): Promise<{ success: boolean; optionId?: number; error?: string }> {
		const { roundId, title } = params
		const callerAddr = Address.fromString(this.keypair.publicKey())

		const args: xdr.ScVal[] = [
			nativeToScVal(callerAddr, { type: 'address' }),
			nativeToScVal(roundId, { type: 'u32' }),
			nativeToScVal(title, { type: 'string' }),
		]

		const result = await simulateAndSend(
			this.server,
			this.networkPassphrase,
			this.keypair,
			this.contractAddress,
			'add_option',
			args,
		)

		if (!result.success) {
			console.warn('[GovernanceContract] add_option failed:', result.error)
			return { success: false, error: result.error }
		}

		const optionId = result.returnValue?.u32?.()
		return { success: true, optionId }
	}

	// --------------------------------------------------------------------------
	// Recorder operations
	// --------------------------------------------------------------------------

	/**
	 * Record a vote on-chain via the recorder role.
	 * Called by /api/governance/vote after all off-chain checks pass.
	 */
	async recordVote(params: {
		voterAddress: string
		roundId: number
		optionId: number
		voteType: 'up' | 'down'
		tier: NftTier
	}): Promise<{ success: boolean; weight?: number; error?: string }> {
		const { voterAddress, roundId, optionId, voteType, tier } = params

		const callerAddr = Address.fromString(this.keypair.publicKey())
		const voterAddr = Address.fromString(voterAddress)

		// Contract enums: VoteType { Up = 0, Down = 1 }, NftTier { Bronze=1..Diamond=4 }
		const args: xdr.ScVal[] = [
			nativeToScVal(callerAddr, { type: 'address' }),
			nativeToScVal(voterAddr, { type: 'address' }),
			nativeToScVal(roundId, { type: 'u32' }),
			nativeToScVal(optionId, { type: 'u32' }),
			nativeToScVal(VOTE_TYPE_TO_U32[voteType], { type: 'u32' }),
			nativeToScVal(TIER_TO_U32[tier], { type: 'u32' }),
		]

		const result = await simulateAndSend(
			this.server,
			this.networkPassphrase,
			this.keypair,
			this.contractAddress,
			'record_vote',
			args,
		)

		if (!result.success) {
			console.warn('[GovernanceContract] record_vote failed:', result.error)
			return { success: false, error: result.error }
		}

		const weight = result.returnValue?.u32?.()
		return { success: true, weight }
	}
}

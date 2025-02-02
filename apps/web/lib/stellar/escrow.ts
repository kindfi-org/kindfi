import {
	Account,
	Asset,
	Keypair,
	Networks,
	Operation,
	TransactionBuilder,
	type xdr,
} from 'stellar-sdk'
import Predicate from 'stellar-sdk'
import Server from 'stellar-sdk'
import { AppError } from '../error'
import type { EscrowContractParams } from '../types/escrow'
import { getAccountSequence } from '../utils'
import { generateUniqueId } from '../utils/id'

interface EscrowContractResult {
	success: boolean
	contractAddress?: string
	engagementId?: string
	contributionId?: string
	totalAmount?: number
	error?: string
}

export async function initializeEscrowContract(
	params: EscrowContractParams & {
		parties: { payer: string; receiver: string }
	},
	secretKey: string,
): Promise<EscrowContractResult> {
	try {
		// Calculate total amount including all milestones
		const totalAmount = params.milestones.reduce(
			(sum, milestone) => sum + milestone.amount,
			0,
		)

		// Generate unique IDs
		const engagementId = generateUniqueId()
		const contributionId = generateUniqueId()
		// Initialize contract on Stellar
		const payerAccount = new Account(
			Keypair.fromSecret(params.parties.payer).publicKey(),
			await getAccountSequence(params.parties.payer).toString(),
		)
		const transaction = new TransactionBuilder(payerAccount, {
			fee: '100',
			networkPassphrase: Networks.TESTNET, // or MAINNET for production
		})
			.addOperation(
				Operation.createClaimableBalance({
					amount: totalAmount.toString(),
					asset: Asset.native(),
					claimants: [
						{
							destination: params.parties.receiver,
							predicate: Predicate.and([
								Predicate.beforeRelativeTime('12096000'), // 140 days
								Predicate.not(Predicate.beforeAbsoluteTime('0')),
							]),
							toXDRObject: (): xdr.Claimant => {
								throw new Error('Function not implemented.')
							},
						},
					],
				}),
			)
			.setTimeout(30)
			.build()

		// Sign the transaction
		transaction.sign(Keypair.fromSecret(secretKey))

		// Submit the transaction to the Stellar network
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const server = new Server(process.env.STELLAR_NETWORK_URL!) // Set your Stellar network URL
		const result = await server.submitTransaction(transaction)

		return {
			success: true,
			contractAddress: result.hash,
			engagementId,
			contributionId,
			totalAmount,
		}
	} catch (error) {
		console.error('Failed to initialize escrow contract:', error)
		throw new AppError(
			error instanceof Error ? error.message : 'Unknown error occurred',
			500,
			error,
		)
	}
}

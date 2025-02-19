import type { Escrow, MilestoneStatus } from './escrow.types'

// Escrow's Payload
export type EscrowPayload = Omit<
	Escrow,
	'user' | 'createdAt' | 'updatedAt' | 'id'
>

export type ChangeMilestoneStatusPayload = {
	contractId?: string
	milestoneIndex: string
	newStatus: MilestoneStatus
	serviceProvider?: string
}

export type ChangeMilestoneFlagPayload = Omit<
	ChangeMilestoneStatusPayload,
	'serviceProvider' | 'newStatus'
> & {
	approver?: string
	newFlag: boolean
}

export type StartDisputePayload = Pick<Escrow, 'contractId'> & {
	signer: string
}

export type ResolveDisputePayload = Pick<Escrow, 'contractId'> &
	Partial<Pick<Escrow, 'disputeResolver'>> & {
		approverFunds: string
		serviceProviderFunds: string
	}

export type FundEscrowPayload = Pick<Escrow, 'amount' | 'contractId'> & {
	signer: string
}

export type DistributeEscrowEarningsEscrowPayload = Pick<Escrow, 'contractId'> &
	Partial<Pick<Escrow, 'serviceProvider' | 'releaseSigner'>> & {
		signer: string
	}

export type EditMilestonesPayload = {
	contractId: string
	escrow: EscrowPayload
	signer: string
}

export type GetBalanceParams = {
	signer: string
	addresses: string[]
}

export type TransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED'

export type TransactionType =
	| 'DEPOSIT'
	| 'RELEASE'
	| 'REFUND'
	| 'DISPUTE'
	| 'FEE'

export interface EscrowFundParams {
	userId: string
	stellarTransactionHash: string
	amount: string
	transactionType: TransactionType
}

export interface EscrowTransactionMetadata {
	escrowId: string
	recipientAddress?: string
	reason?: string
	feeAmount?: string
	payerAddress: string
	referenceId?: string
	createdAt: string
	additionalData?: Record<string, string>
}

export interface EscrowFundData {
	fundParams: EscrowFundParams
	metadata: EscrowTransactionMetadata
}

export interface EscrowFundUpdateData {
	escrowId: string
	transactionHash: string
	status: TransactionStatus
}

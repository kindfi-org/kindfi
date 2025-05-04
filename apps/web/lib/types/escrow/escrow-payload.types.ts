import type { Escrow, MilestoneStatus } from './escrow.types';
import type {
    DisputePayload,
    DisputeResolutionPayload,
    MediatorAssignmentPayload,
    EvidenceSubmissionPayload,
    DisputeSignPayload,
    ReviewStatus as DisputeStatus
} from '@services/supabase/src/types';

// Escrow's Payload
export type EscrowPayload = Omit<
    Escrow,
    'user' | 'createdAt' | 'updatedAt' | 'id'
>

// Re-export the types from Supabase service for backward compatibility
export type { 
    DisputePayload,
    DisputeResolutionPayload,
    MediatorAssignmentPayload,
    EvidenceSubmissionPayload,
    DisputeSignPayload
}

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
	signer?: string; // Keep for backward compatibility
	signerAddress?: string; // New property for better security
}

export type ResolveDisputePayload = Pick<Escrow, 'contractId'> &
	Partial<Pick<Escrow, 'disputeResolver'>> & {
		approverAmount: string;
		serviceProviderAmount: string;
		signer?: string; // Keep for backward compatibility
		signerAddress?: string; // New property for better security
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
	amount: string
	transactionType: TransactionType
	escrowContract: string
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
	signer: string
}

export interface EscrowFundUpdateData {
	escrowId: string
	transactionHash: string
	status: TransactionStatus
}

export interface MilestoneReviewPayload {
	milestoneId: string
	reviewerId: string
	status: MilestoneStatus
	comments?: string
	signer: string
	escrowContractAddress: string
}

// Note: The dispute system types are now imported from @services/supabase/src/types
// See the imports and re-exports at the top of this file

export type EscrowState =
  | "NEW"
  | "ACTIVE"
  | "IN_DISPUTE"
  | "COMPLETED"
  | "CANCELLED";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dueDate: string;
}

export interface EscrowParties {
  payer: string; // Project supporter address
  receiver: string; // Project creator address
  reviewers: string[]; // Platform reviewers
}

export interface EscrowContractParams {
  parties: EscrowParties;
  milestones: Milestone[];
  disputeResolver: string;
  platformFee: number;
}

export interface EscrowMetadata {
  projectId: string;
  engagementType: string;
  description: string;
  tags: string[];
}

export interface EscrowInitialization {
  contractParams: EscrowContractParams;
  metadata: EscrowMetadata;
}

// Database types
export interface EscrowContract {
  id: string;
  engagement_id: string;
  contract_id: string;
  project_id: string;
  contribution_id: string;
  payer_address: string;
  receiver_address: string;
  amount: number;
  current_state: EscrowState;
  platform_fee: number;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  metadata: EscrowMetadata;
}

export type TransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export type TransactionType =
  | "DEPOSIT"
  | "RELEASE"
  | "REFUND"
  | "DISPUTE"
  | "FEE";

export interface EscrowFundParams {
  userId: string;
  stellarTransactionHash: string;
  amount: string;
  transactionType: TransactionType;
}

export interface EscrowTransactionMetadata {
  escrowId: string; // Unique identifier for escrow
  recipientAddress?: string; // Address receiving funds (for RELEASE)
  reason?: string; // Reason for dispute/refund (for DISPUTE or REFUND)
  feeAmount?: string; // Fee charged (for FEE transactions)
  payerAddress: string; // User who initiated the transaction
  referenceId?: string; // Optional reference to external system
  createdAt: string; // Timestamp for when transaction was created
  confirmedAt?: string; // Timestamp for successful transactions
  additionalData?: Record<string, string>; // Catch-all for extra data
}

export interface EscrowFundData {
  fundParams: EscrowFundParams;
  metadata: EscrowTransactionMetadata;
}

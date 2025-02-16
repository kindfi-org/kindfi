import { CreatedAt, UpdatedAt } from "./date.types";
import { EscrowEndpoint, HttpMethod, Status } from "./utils.types";

export type MilestoneStatus = "completed" | "approved" | "pending";

export type Milestone = {
  description: string;
  status?: MilestoneStatus;
  flag?: boolean;
};
export interface Escrow {
  id: string;
  title: string;
  description: string;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
  contractId?: string;
  balance?: string;
  token: string;
  milestones: Milestone[];
  serviceProvider: string;
  engagementId: string;
  disputeResolver: string;
  amount: string;
  platformAddress: string;
  platformFee: string;
  approver: string;
  releaseSigner: string;
  user: string;
  issuer: string;
  disputeFlag?: boolean;
  releaseFlag?: boolean;
  resolvedFlag?: boolean;
}

export type EscrowPayload = Omit<
  Escrow,
  "user" | "createdAt" | "updatedAt" | "id"
>;

export type TCreateEscrowRequest<T extends EscrowEndpoint> = {
  action: T;
  method: HttpMethod;
  data?: Record<string, any>;
  params?: Record<string, any>;
};

export type EscrowRequestResponse = {
  status: Status;
  unsignedTransaction?: string;
};

// Response from the escrow's endpoint
export type InitializeEscrowResponse = {
  contract_id: string;
  escrow: EscrowPayload;
  message: string;
  status: Status;
};

export type FundEscrowResponse = {
  message: string;
  status: Status;
};

export type SendTransactionResponse = InitializeEscrowResponse &
  FundEscrowResponse;

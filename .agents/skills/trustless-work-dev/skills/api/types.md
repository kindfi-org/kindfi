# TypeScript Types Reference

Complete TypeScript type definitions for all Trustless Work API payloads, responses, and errors.

## Payloads

### Milestone Payloads

#### Single Release Milestone Payload

```typescript
export type SingleReleaseMilestonePayload = {
  /**
   * Text describing the function of the milestone
   */
  description: string;
};
```

#### Multi Release Milestone Payload

```typescript
export type MultiReleaseMilestonePayload = {
  /**
   * Text describing the function of the milestone
   */
  description: string;
  /**
   * Amount to be transferred upon completion of this milestone
   */
  amount: number;
  /**
   * Address where milestone proceeds will be sent to
   */
  receiver: string;
};
```

### Initialize Escrow Payloads

#### Single Release Initialize Escrow Payload

```typescript
export type InitializeSingleReleaseEscrowPayload = {
  /**
   * Address of the user signing the contract transaction
   */
  signer: string;

  /**
   * Unique identifier for the escrow
   */
  engagementId: string;

  /**
   * Name of the escrow
   */
  title: string;

  /**
   * Roles that make up the escrow structure
   */
  roles: {
    /**
     * Address of the entity requiring the service.
     */
    approver: string;

    /**
     * Address of the entity providing the service.
     */
    serviceProvider: string;

    /**
     * Address of the entity that owns the escrow
     */
    platformAddress: string;

    /**
     * Address of the user in charge of releasing the escrow funds to the service provider.
     */
    releaseSigner: string;

    /**
     * Address in charge of resolving disputes within the escrow.
     */
    disputeResolver: string;

    /**
     * Address where escrow proceeds will be sent to
     */
    receiver: string;
  };

  /**
   * Text describing the function of the escrow
   */
  description: string;

  /**
   * Amount to be transferred upon completion of escrow milestones
   */
  amount: number;

  /**
   * Commission that the platform will receive when the escrow is completed
   */
  platformFee: number;

  /**
   * Flags validating certain escrow life states
   */
  flags?: {
    /**
     * Flag indicating that an escrow is in dispute.
     */
    disputed?: boolean;

    /**
     * Flag indicating that escrow funds have already been released.
     */
    released?: boolean;

    /**
     * Flag indicating that a disputed escrow has already been resolved.
     */
    resolved?: boolean;

    /**
     * Flag indicating whether a milestone has been approved by the approver.
     */
    approved?: boolean;
  };

  /**
   * Information on the trustline that will manage the movement of funds in escrow
   */
  trustline: {
    /**
     * Public address establishing permission to accept and use a specific token.
     */
    address: string;
    
    /**
     * Official abbreviation representing the token in wallets, exchanges, and documentation.
     */
    symbol: string;
  };

  /**
   * Objectives to be completed to define the escrow as completed
   */
  milestones: {
    /**
     * Text describing the function of the milestone
     */
    description: string;
  }[];
};
```

#### Multi Release Initialize Escrow Payload

```typescript
export type InitializeMultiReleaseEscrowPayload = {
  /**
   * Address of the user signing the contract transaction
   */
  signer: string;

  /**
   * Unique identifier for the escrow
   */
  engagementId: string;

  /**
   * Name of the escrow
   */
  title: string;

  /**
   * Roles that make up the escrow structure (without receiver, as each milestone has its own receiver)
   */
  roles: {
    /**
     * Address of the entity requiring the service.
     */
    approver: string;

    /**
     * Address of the entity providing the service.
     */
    serviceProvider: string;

    /**
     * Address of the entity that owns the escrow
     */
    platformAddress: string;

    /**
     * Address of the user in charge of releasing the escrow funds to the service provider.
     */
    releaseSigner: string;

    /**
     * Address in charge of resolving disputes within the escrow.
     */
    disputeResolver: string;
  };

  /**
   * Text describing the function of the escrow
   */
  description: string;

  /**
   * Commission that the platform will receive when the escrow is completed
   */
  platformFee: number;

  /**
   * Information on the trustline that will manage the movement of funds in escrow
   */
  trustline: {
    /**
     * Public address establishing permission to accept and use a specific token.
     */
    address: string;
    
    /**
     * Official abbreviation representing the token in wallets, exchanges, and documentation.
     */
    symbol: string;
  };

  /**
   * Objectives to be completed to define the escrow as completed
   */
  milestones: {
    /**
     * Text describing the function of the milestone
     */
    description: string;
    /**
     * Amount to be transferred upon completion of this milestone
     */
    amount: number;
    /**
     * Address where milestone proceeds will be sent to
     */
    receiver: string;
  }[];
};
```

### Update Escrow Payloads

#### Single Release Update Escrow Payload

```typescript
export type UpdateSingleReleaseEscrowPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Escrow data
   */
  escrow: {
    /**
     * Unique identifier for the escrow
     */
    engagementId: string;

    /**
     * Name of the escrow
     */
    title: string;

    /**
     * Roles that make up the escrow structure
     */
    roles: {
      approver: string;
      serviceProvider: string;
      platformAddress: string;
      releaseSigner: string;
      disputeResolver: string;
      receiver: string;
    };

    /**
     * Text describing the function of the escrow
     */
    description: string;

    /**
     * Amount to be transferred upon completion of escrow milestones
     */
    amount: number;

    /**
     * Commission that the platform will receive when the escrow is completed
     */
    platformFee: number;

    /**
     * Objectives to be completed to define the escrow as completed
     */
    milestones: {
      /**
       * Text describing the function of the milestone.
       */
      description: string;

      /**
       * Milestone status. Ex: Approved, In dispute, etc...
       */
      status?: string;

      /**
       * Evidence of work performed by the service provider.
       */
      evidence?: string;

      /**
       * Approved flag, only if the escrow is single-release
       */
      approved?: boolean;
    }[];

    /**
     * Flags validating certain escrow life states
     */
    flags?: {
      disputed?: boolean;
      released?: boolean;
      resolved?: boolean;
      approved?: boolean;
    };

    /**
     * Information on the trustline that will manage the movement of funds in escrow
     */
    trustline: {
      symbol: string;
      address: string;
    };

    /**
     * Whether the escrow is active. This comes from DB, not from the blockchain.
     */
    isActive?: boolean;
  };

  /**
   * Address of the user signing the contract transaction
   */
  signer: string;
};
```

#### Multi Release Update Escrow Payload

```typescript
export type UpdateMultiReleaseEscrowPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Escrow data
   */
  escrow: {
    engagementId: string;
    title: string;
    roles: {
      approver: string;
      serviceProvider: string;
      platformAddress: string;
      releaseSigner: string;
      disputeResolver: string;
    };
    description: string;
    platformFee: number;
    milestones: {
      description: string;
      status?: string;
      evidence?: string;
      amount: number;
      receiver: string;
      /**
       * Flags validating certain milestone life states, only if the escrow is multi-release
       */
      flags?: {
        disputed?: boolean;
        released?: boolean;
        resolved?: boolean;
        approved?: boolean;
      };
    }[];
    trustline: {
      symbol: string;
      address: string;
    };
    isActive?: boolean;
  };

  /**
   * Address of the user signing the contract transaction
   */
  signer: string;
};
```

### Change Milestone Status Payload

```typescript
export type ChangeMilestoneStatusPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Index of the milestone to be updated
   */
  milestoneIndex: string;

  /**
   * New status of the milestone
   */
  newStatus: string;

  /**
   * New evidence of work performed by the service provider.
   */
  newEvidence?: string;

  /**
   * Address of the entity providing the service.
   */
  serviceProvider: string;
};
```

### Approve Milestone Payload

```typescript
export type ApproveMilestonePayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Index of the milestone to be updated
   */
  milestoneIndex: string;

  /**
   * New evidence of work performed by the service provider.
   */
  newEvidence?: string;

  /**
   * Address of the entity requiring the service.
   */
  approver: string;
};
```

### Fund Escrow Payload

```typescript
export type FundEscrowPayload = {
  /**
   * Amount to be transferred upon completion of escrow milestones
   */
  amount: number;

  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address of the user signing the contract transaction
   */
  signer: string;
};
```

### Release Funds Payloads

#### Single Release Release Funds Payload

```typescript
export type SingleReleaseReleaseFundsPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address of the user in charge of releasing the escrow funds to the service provider.
   */
  releaseSigner: string;
};
```

#### Multi Release Release Funds Payload

```typescript
export type MultiReleaseReleaseFundsPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address of the user in charge of releasing the escrow funds to the service provider.
   */
  releaseSigner: string;

  /**
   * Index of the milestone to be released
   */
  milestoneIndex: string;
};
```

### Start Dispute Payloads

#### Single Release Start Dispute Payload

```typescript
export type SingleReleaseStartDisputePayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address of the user signing the contract transaction
   */
  signer: string;
};
```

#### Multi Release Start Dispute Payload

```typescript
export type MultiReleaseStartDisputePayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address of the user signing the contract transaction
   */
  signer: string;

  /**
   * Index of the milestone to be disputed
   */
  milestoneIndex: string;
};
```

### Resolve Dispute Payloads

#### Single Release Resolve Dispute Payload

```typescript
export type SingleReleaseResolveDisputePayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address in charge of resolving disputes within the escrow.
   */
  disputeResolver: string;

  /**
   * Distributions of the escrow amount to the receivers.
   */
  distributions: [
    {
      /**
       * Address of the receiver
       */
      address: string;
      /**
       * Amount to be transferred to the receiver. All the amount must be equal to the total amount of the escrow.
       */
      amount: number;
    },
  ];
};
```

#### Multi Release Resolve Dispute Payload

```typescript
export type MultiReleaseResolveDisputePayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address in charge of resolving disputes within the escrow.
   */
  disputeResolver: string;

  /**
   * Distributions of the escrow amount to the receivers.
   */
  distributions: [
    {
      address: string;
      amount: number;
    },
  ];

  /**
   * Index of the milestone to be resolved
   */
  milestoneIndex: string;
};
```

### Withdraw Remaining Funds Payload

```typescript
export type WithdrawRemainingFundsPayload = {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Address in charge of resolving disputes within the escrow.
   */
  disputeResolver: string;

  /**
   * Distributions of the escrow amount to the receivers.
   */
  distributions: [
    {
      address: string;
      amount: number;
    },
  ];
};
```

### Query Payloads

#### Get Escrows From Indexer Params

```typescript
export type GetEscrowsFromIndexerParams = {
  /**
   * Page number. Pagination
   */
  page?: number;

  /**
   * Sorting direction. Sorting
   */
  orderDirection?: "asc" | "desc";

  /**
   * Order by property. Sorting
   */
  orderBy?: "createdAt" | "updatedAt" | "amount";

  /**
   * Created at = start date. Filtering
   */
  startDate?: string;

  /**
   * Created at = end date. Filtering
   */
  endDate?: string;

  /**
   * Max amount. Filtering
   */
  maxAmount?: number;

  /**
   * Min amount. Filtering
   */
  minAmount?: number;

  /**
   * Is active. Filtering
   */
  isActive?: boolean;

  /**
   * Escrow that you are looking for. Filtering
   */
  title?: string;

  /**
   * Engagement ID. Filtering
   */
  engagementId?: string;

  /**
   * Status of the single-release escrow. Filtering
   */
  status?: SingleReleaseEscrowStatus;

  /**
   * Type of the escrow. Filtering
   */
  type?: EscrowType;

  /**
   * If true, the escrows will be validated on the blockchain to ensure data consistency.
   * This performs an additional verification step to confirm that the escrow data
   * returned from the indexer matches the current state on the blockchain.
   * Use this when you need to ensure the most up-to-date and accurate escrow information.
   * If you active this param, your request will take longer to complete.
   */
  validateOnChain?: boolean;
};
```

#### Get Escrows From Indexer By Signer Params

```typescript
export type GetEscrowsFromIndexerBySignerParams = GetEscrowsFromIndexerParams & {
  /**
   * Address of the user signing the contract transaction.
   */
  signer: string;
};
```

#### Get Escrows From Indexer By Role Params

```typescript
export type GetEscrowsFromIndexerByRoleParams = GetEscrowsFromIndexerParams & {
  /**
   * Role of the user. Required
   */
  role: Role;

  /**
   * Address of the owner of the escrows. If you want to get all escrows from a specific role, you can use this parameter. But with this parameter, you can't use the signer parameter.
   */
  roleAddress: string;
};
```

#### Get Escrow From Indexer By Contract Ids Params

```typescript
export type GetEscrowFromIndexerByContractIdsParams = {
  /**
   * IDs (addresses) that identifies the escrow contracts.
   */
  contractIds: string[];

  /**
   * If true, the escrows will be validated on the blockchain to ensure data consistency.
   * This performs an additional verification step to confirm that the escrow data
   * returned from the indexer matches the current state on the blockchain.
   * Use this when you need to ensure the most up-to-date and accurate escrow information.
   * If you active this param, your request will take longer to complete.
   */
  validateOnChain?: boolean;
};
```

#### Get Balance Params

```typescript
export type GetBalanceParams = {
  /**
   * Addresses of the escrows to get the balance
   */
  addresses: string[];
};
```

#### Update From Transaction Hash Payload

```typescript
export type UpdateFromTxHashPayload = {
  /**
   * Transaction hash to be used for the update.
   */
  txHash: string;
};
```

## Responses

### Escrow Request Response

```typescript
export type EscrowRequestResponse = {
  /**
   * Status of the request
   */
  status: Status;

  /**
   * Unsigned transaction
   */
  unsignedTransaction?: string;
};
```

### Send Transaction Response

```typescript
export type SendTransactionResponse = {
  /**
   * Status of the request
   */
  status: Status;

  /**
   * Message of the request
   */
  message: string;
};
```

### Initialize Escrow Responses

#### Initialize Single Release Escrow Response

```typescript
export type InitializeSingleReleaseEscrowResponse = EscrowRequestResponse & {
  /**
   * ID (address) that identifies the escrow contract
   */
  contractId: string;

  /**
   * Escrow data
   */
  escrow: SingleReleaseEscrow;

  /**
   * Message of the request
   */
  message: string;
};
```

#### Initialize Multi Release Escrow Response

```typescript
export type InitializeMultiReleaseEscrowResponse = InitializeSingleReleaseEscrowResponse & {
  /**
   * Escrow data
   */
  escrow: MultiReleaseEscrow;
};
```

### Update Escrow Responses

```typescript
export type UpdateSingleReleaseEscrowResponse = InitializeSingleReleaseEscrowResponse;

export type UpdateMultiReleaseEscrowResponse = InitializeMultiReleaseEscrowResponse;
```

### Get Escrow Balances Response

```typescript
export type GetEscrowBalancesResponse = {
  /**
   * Address of the escrow
   */
  address: string;

  /**
   * Balance of the escrow
   */
  balance: number;
};
```

### Get Escrows From Indexer Response

```typescript
export type GetEscrowsFromIndexerResponse = {
  signer?: string;
  contractId?: string;
  engagementId: string;
  title: string;
  roles: Roles;
  description: string;
  amount: number;
  platformFee: number;
  balance?: number;
  milestones:
    | SingleReleaseMilestone[]
    | (MultiReleaseMilestone[] & { disputeStartedBy: Roles });
  flags?: Flags;
  trustline: Trustline & { name: string };
  receiverMemo?: number;
  disputeStartedBy?: string;
  fundedBy?: string;
  isActive?: boolean;
  approverFunds?: string;
  receiverFunds?: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;
  type: EscrowType;
};
```

### Update From Transaction Hash Response

```typescript
export type UpdateFromTxHashResponse = {
  /**
   * Status of the request
   */
  status: "SUCCESS" | "FAILED";

  /**
   * Message describing the result
   */
  message: string;
};
```

## Errors

### Error Response

```typescript
export type ErrorResponse = {
  message: string;
  code: number;
  type: ApiErrorTypes;
};
```

### API Error Types

```typescript
export enum ApiErrorTypes {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  WALLET_ERROR = "WALLET_ERROR",
}
```

### Error Types

```typescript
/**
 * Types for TW errors
 */
export type ApiError = Pick<ErrorResponse, "message" | "code">;

/**
 * Types for Wallet errors
 */
export type WalletError = Pick<ErrorResponse, "message" | "code">;

/**
 * Types for Request errors
 */
export type RequestError = ApiError | Error | WalletError;
```

## Common Enums

### Escrow Type

```typescript
export type EscrowType = "single-release" | "multi-release";
```

### Single Release Escrow Status

```typescript
export type SingleReleaseEscrowStatus = 
  | "pending"
  | "funded"
  | "in_progress"
  | "completed"
  | "disputed"
  | "resolved"
  | "released";
```

### Status

```typescript
export type Status = "SUCCESS" | "FAILED" | "PENDING";
```

## Usage Examples

### Initialize Escrow

```typescript
import { InitializeSingleReleaseEscrowPayload } from '@trustless-work/types';

const payload: InitializeSingleReleaseEscrowPayload = {
  signer: walletAddress,
  engagementId: 'project-123',
  title: 'Website Development',
  roles: {
    approver: approverAddress,
    serviceProvider: serviceProviderAddress,
    platformAddress: platformAddress,
    releaseSigner: releaseSignerAddress,
    disputeResolver: disputeResolverAddress,
    receiver: receiverAddress,
  },
  description: 'Build responsive website',
  amount: 5000,
  platformFee: 100,
  trustline: {
    address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
    symbol: 'USDC',
  },
  milestones: [
    { description: 'Design mockups' },
    { description: 'Frontend development' },
  ],
};
```

### Fund Escrow

```typescript
import { FundEscrowPayload } from '@trustless-work/types';

const payload: FundEscrowPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  amount: 5000,
  signer: walletAddress,
};
```

### Approve Milestone

```typescript
import { ApproveMilestonePayload } from '@trustless-work/types';

const payload: ApproveMilestonePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  approver: approverAddress,
  newEvidence: 'https://example.com/proof.pdf',
};
```

## Resources

- [Complete Payloads Documentation](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types/payloads)
- [Responses Documentation](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types/responses)
- [Errors Documentation](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types/errors)

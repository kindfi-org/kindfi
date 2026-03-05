# React SDK Hooks Reference

Complete reference for all Trustless Work React SDK hooks with detailed usage examples.

## useInitializeEscrow

Deploy and initialize an escrow contract.

### Usage

```typescript
import { useInitializeEscrow } from "@trustless-work/escrow/hooks";
import { InitializeSingleReleaseEscrowPayload, InitializeMultiReleaseEscrowPayload } from "@trustless-work/escrow/types";

const { deployEscrow } = useInitializeEscrow();

// Returns unsigned transaction
const { unsignedTransaction } = await deployEscrow(payload, "multi-release");
// or
const { unsignedTransaction } = await deployEscrow(payload, "single-release");
```

### Function: `deployEscrow`

Builds and returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload type)
- **payload**: `InitializeSingleReleaseEscrowPayload` or `InitializeMultiReleaseEscrowPayload`

**Return Value:**
- `unsignedTransaction`: Object representing the constructed transaction, ready to be signed

### Complete Example

```typescript
import {
  useInitializeEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import {
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload
} from "@trustless-work/escrow/types";

export const useInitializeEscrowForm = () => {
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (
    payload: InitializeSingleReleaseEscrowPayload | InitializeMultiReleaseEscrowPayload
  ) => {
    try {
      // Step 1: Get unsigned transaction
      const { unsignedTransaction } = await deployEscrow(
        payload,
        "multi-release" // or "single-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from deployEscrow response.");
      }

      // Step 2: Sign transaction
      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      if (!signedXdr) {
        throw new Error("Signed transaction is missing.");
      }

      // Step 3: Send transaction
      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Escrow Created");
        // data contains: { status, message, contractId, escrow }
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useFundEscrow

Deposit funds into an existing escrow contract.

### Usage

```typescript
import { useFundEscrow } from "@trustless-work/escrow/hooks";
import { FundEscrowPayload } from "@trustless-work/escrow/types";

const { fundEscrow } = useFundEscrow();

const { unsignedTransaction } = await fundEscrow(payload, "multi-release");
```

### Function: `fundEscrow`

Returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type
- **payload**: `FundEscrowPayload` - Applicable for both escrow types

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useFundEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { FundEscrowPayload } from "@trustless-work/escrow/types";

export const useFundEscrowForm = () => {
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (payload: FundEscrowPayload) => {
    try {
      const { unsignedTransaction } = await fundEscrow(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from fundEscrow response.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Escrow Funded");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useChangeMilestoneStatus

Update the custom status of a milestone (service provider action).

### Usage

```typescript
import { useChangeMilestoneStatus } from "@trustless-work/escrow/hooks";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow/types";

const { changeMilestoneStatus } = useChangeMilestoneStatus();

const { unsignedTransaction } = await changeMilestoneStatus(payload, "multi-release");
```

### Function: `changeMilestoneStatus`

Returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `ChangeMilestoneStatusPayload` - Applicable for both escrow types

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useChangeMilestoneStatus,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow/types";

export const useChangeMilestoneStatusForm = () => {
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (payload: ChangeMilestoneStatusPayload) => {
    try {
      const { unsignedTransaction } = await changeMilestoneStatus(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success(
          `Milestone index - ${payload.milestoneIndex} updated to ${payload.newStatus}`
        );
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useApproveMilestone

Approve a milestone for release (approver action).

### Usage

```typescript
import { useApproveMilestone } from "@trustless-work/escrow/hooks";
import { ApproveMilestonePayload } from "@trustless-work/escrow/types";

const { approveMilestone, isPending, isError, isSuccess } = useApproveMilestone();

const { unsignedTransaction } = await approveMilestone(payload, "multi-release");
```

### Function: `approveMilestone`

Returns an unsigned transaction based on the provided payload.

**Status Flags:**
- `isPending`: Operation in progress
- `isError`: Operation failed
- `isSuccess`: Operation completed successfully

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `ApproveMilestonePayload` - Applicable for both escrow types

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useApproveMilestone,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { ApproveMilestonePayload } from "@trustless-work/escrow/types";

export const useApproveMilestoneForm = () => {
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (payload: ApproveMilestonePayload) => {
    try {
      const { unsignedTransaction } = await approveMilestone(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from approveMilestone response.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success(
          `Milestone index - ${payload.milestoneIndex} has been approved`
        );
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useReleaseFunds

Release escrow funds to the service provider.

### Usage

```typescript
import { useReleaseFunds } from "@trustless-work/escrow/hooks";
import { SingleReleaseReleaseFundsPayload, MultiReleaseReleaseFundsPayload } from "@trustless-work/escrow/types";

const { releaseFunds } = useReleaseFunds();

// Single-release
const { unsignedTransaction } = await releaseFunds(payload, "single-release");

// Multi-release (per milestone)
const { unsignedTransaction } = await releaseFunds(payload, "multi-release");
```

### Function: `releaseFunds`

Builds and returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `SingleReleaseReleaseFundsPayload` or `MultiReleaseReleaseFundsPayload`

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useReleaseFunds,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import {
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload
} from "@trustless-work/escrow/types";

export const useReleaseFundsForm = () => {
  const { releaseFunds } = useReleaseFunds();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (
    payload: MultiReleaseReleaseFundsPayload | SingleReleaseReleaseFundsPayload
  ) => {
    try {
      const { unsignedTransaction } = await releaseFunds(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from useReleaseFunds.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("The escrow has been released");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useStartDispute

Initiate a dispute for an escrow.

### Usage

```typescript
import { useStartDispute } from "@trustless-work/escrow/hooks";
import { SingleReleaseStartDisputePayload, MultiReleaseStartDisputePayload } from "@trustless-work/escrow/types";

const { startDispute } = useStartDispute();

// Single-release (disputes entire escrow)
const { unsignedTransaction } = await startDispute(payload, "single-release");

// Multi-release (disputes specific milestone)
const { unsignedTransaction } = await startDispute(payload, "multi-release");
```

### Function: `startDispute`

Builds and returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `SingleReleaseStartDisputePayload` or `MultiReleaseStartDisputePayload`

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useStartDispute,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import {
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload
} from "@trustless-work/escrow/types";

export const useStartDisputeForm = () => {
  const { startDispute } = useStartDispute();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (
    payload: SingleReleaseStartDisputePayload | MultiReleaseStartDisputePayload
  ) => {
    try {
      const { unsignedTransaction } = await startDispute(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from startDispute.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Dispute Started");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useResolveDispute

Resolve a dispute by distributing funds.

### Usage

```typescript
import { useResolveDispute } from "@trustless-work/escrow/hooks";
import { MultiReleaseResolveDisputePayload, SingleReleaseResolveDisputePayload } from "@trustless-work/escrow/types";

const { resolveDispute } = useResolveDispute();

const { unsignedTransaction } = await resolveDispute(payload, "multi-release");
```

### Function: `resolveDispute`

Builds and returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `SingleReleaseResolveDisputePayload` or `MultiReleaseResolveDisputePayload`

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useResolveDispute,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import {
  MultiReleaseResolveDisputePayload,
  SingleReleaseResolveDisputePayload
} from "@trustless-work/escrow/types";

export const useResolveDisputeForm = () => {
  const { resolveDispute } = useResolveDispute();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (
    payload: MultiReleaseResolveDisputePayload | SingleReleaseResolveDisputePayload
  ) => {
    try {
      const { unsignedTransaction } = await resolveDispute(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from resolveDispute.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Dispute Resolved");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useUpdateEscrow

Update escrow properties (title, description, milestones, etc.).

### Usage

```typescript
import { useUpdateEscrow } from "@trustless-work/escrow/hooks";
import { UpdateSingleReleaseEscrowPayload, UpdateMultiReleaseEscrowPayload } from "@trustless-work/escrow/types";

const { updateEscrow } = useUpdateEscrow();

const { unsignedTransaction } = await updateEscrow(payload, "multi-release");
```

### Function: `updateEscrow`

Builds and returns an unsigned transaction based on the provided payload.

**Parameters:**
- **type**: `"multi-release"` or `"single-release"` - Escrow type (must match payload)
- **payload**: `UpdateSingleReleaseEscrowPayload` or `UpdateMultiReleaseEscrowPayload`

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useUpdateEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import {
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload
} from "@trustless-work/escrow/types";

export const useUpdateEscrowForm = () => {
  const { updateEscrow } = useUpdateEscrow();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (
    payload: UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload
  ) => {
    try {
      const { unsignedTransaction } = await updateEscrow(
        payload,
        "multi-release"
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from updateEscrow response.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Escrow Updated");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useWithdrawRemainingFunds

Withdraw remaining funds from a multi-release escrow (after completion or resolution).

### Usage

```typescript
import { useWithdrawRemainingFunds } from "@trustless-work/escrow/hooks";
import { WithdrawRemainingFundsPayload } from "@trustless-work/escrow/types";

const { withdrawRemainingFunds } = useWithdrawRemainingFunds();

// Only works with multi-release escrows
const { unsignedTransaction } = await withdrawRemainingFunds(payload);
```

### Function: `withdrawRemainingFunds`

Builds and returns an unsigned transaction based on the provided payload.

**Important:** Only allows multi-release escrows.

**Parameters:**
- **payload**: `WithdrawRemainingFundsPayload` - Contains distributions array

**Return Value:**
- `unsignedTransaction`: Object ready to be signed and broadcast

### Complete Example

```typescript
import {
  useWithdrawRemainingFunds,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { WithdrawRemainingFundsPayload } from "@trustless-work/escrow/types";

export const useWithdrawRemainingFundsForm = () => {
  const { withdrawRemainingFunds } = useWithdrawRemainingFunds();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (payload: WithdrawRemainingFundsPayload) => {
    try {
      const { unsignedTransaction } = await withdrawRemainingFunds(payload);

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from withdrawRemainingFunds.");
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      const data = await sendTransaction(signedXdr);

      if (data.status === "SUCCESS") {
        toast.success("Withdrawal successful");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## useSendTransaction

Send a signed transaction to the network. **Must be used after all mutation hooks.**

{% hint style="info" %}
This endpoint must be used for all endpoints after executing them, except:
- `getEscrowBalances`
- `getEscrowsByContractId`
- `getEscrowsByRole`
- `getEscrowsBySigner`
{% endhint %}

### Usage

```typescript
import { useSendTransaction } from "@trustless-work/escrow/hooks";

const { sendTransaction } = useSendTransaction();

// signedXdr is a string from wallet.signTransaction()
const data = await sendTransaction(signedXdr);
```

### Function: `sendTransaction`

Sends a signed transaction to the network and returns the response.

**Parameters:**
- **payload**: `string` - Signed XDR transaction from wallet

**Return Value:**

**For:** Fund Escrow, Resolve Dispute, Change Milestone Status, Start Dispute, Release Funds:
- `SendTransactionResponse` with `status` and `message`

**For:** Initialize Escrow:
- `SendTransactionResponse` or `InitializeEscrowResponse` (contains `contractId` and `escrow`)

**For:** Update Escrow:
- `SendTransactionResponse` or `UpdateEscrowResponse` (contains `contractId` and `escrow`)

### Response Types

```typescript
// Standard response
type SendTransactionResponse = {
  status: "SUCCESS" | "FAILED";
  message: string;
};

// Initialize Escrow response
type InitializeEscrowResponse = SendTransactionResponse & {
  contractId: string;
  escrow: SingleReleaseEscrow | MultiReleaseEscrow;
};

// Update Escrow response
type UpdateEscrowResponse = SendTransactionResponse & {
  contractId: string;
  escrow: SingleReleaseEscrow | MultiReleaseEscrow;
};
```

### Complete Example

```typescript
import {
  useFundEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { FundEscrowPayload } from "@trustless-work/escrow/types";

export const useSomeEndpointForm = () => {
  const { someFunction } = useSomeEndpoint();
  const { sendTransaction } = useSendTransaction();

  const onSubmit = async (payload: SomeEndpointPayload) => {
    try {
      // Step 1: Get unsigned transaction
      const { unsignedTransaction } = await someFunction(payload, "multi-release");

      // Step 2: Sign transaction
      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || "",
      });

      if (!signedXdr) {
        throw new Error("Signed transaction is missing.");
      }

      // Step 3: Send transaction
      const data = await sendTransaction(signedXdr);

      // Handle response
      if (data.status === "SUCCESS") {
        toast.success("Operation successful");
      }
    } catch (error: unknown) {
      // Handle error
    }
  };
};
```

## Common Pattern

All mutation hooks follow this 3-step pattern:

1. **Execute hook function** → Get unsigned transaction
2. **Sign with wallet** → Create signed XDR
3. **Send transaction** → Broadcast to network

```typescript
// Step 1: Execute hook
const { unsignedTransaction } = await hookFunction(payload, escrowType);

// Step 2: Sign transaction
const signedXdr = await wallet.signTransaction({
  unsignedTransaction,
  address: walletAddress,
});

// Step 3: Send transaction
const response = await sendTransaction(signedXdr);
```

## Type Matching Rules

**Critical:** The `type` parameter must match the payload type:

- `"single-release"` → Use `SingleRelease*Payload` types
- `"multi-release"` → Use `MultiRelease*Payload` types

**Examples:**
- ✅ `deployEscrow(singlePayload, "single-release")`
- ✅ `deployEscrow(multiPayload, "multi-release")`
- ❌ `deployEscrow(singlePayload, "multi-release")` - Type mismatch!

## Resources

- [React SDK Documentation](https://docs.trustlesswork.com/trustless-work/escrow-react-sdk/escrows)
- [TypeScript Types](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types)

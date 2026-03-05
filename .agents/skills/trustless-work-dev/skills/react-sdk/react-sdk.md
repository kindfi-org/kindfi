# React SDK

The Trustless Work React SDK provides custom hooks for integrating escrow functionality into React/Next.js applications.

> **See [hooks-reference.md](hooks-reference.md) for complete detailed documentation of all hooks with examples.**

## Installation

```bash
npm install @trustless-work/escrow
# or
yarn add @trustless-work/escrow
# or
pnpm add @trustless-work/escrow
```

## Setup

### Provider Configuration

Wrap your application with the Trustless Work provider:

```tsx
import { TrustlessWorkProvider } from '@trustless-work/escrow';

function App() {
  return (
    <TrustlessWorkProvider apiKey={process.env.NEXT_PUBLIC_TW_API_KEY}>
      {/* Your app */}
    </TrustlessWorkProvider>
  );
}
```

### Environment Variables

```env
NEXT_PUBLIC_TW_API_KEY=your_api_key_here
```

## Hooks Overview

All hooks return an unsigned transaction that must be signed with a wallet and submitted via `/helper/send-transaction`.

### Common Pattern

```tsx
import { useSomeHook } from '@trustless-work/escrow/hooks';
import { SomePayload } from '@trustless-work/escrow/types';

function MyComponent() {
  const { someFunction, isPending, isError, isSuccess } = useSomeHook();

  const handleAction = async () => {
    try {
      // 1. Get unsigned transaction
      const { unsignedTransaction } = await someFunction(payload);

      // 2. Sign with wallet
      const signedTx = await wallet.signTransaction(unsignedTransaction);

      // 3. Submit transaction
      await fetch('/helper/send-transaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ xdr: signedTx })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleAction} disabled={isPending}>
      {isPending ? 'Processing...' : 'Execute'}
    </button>
  );
}
```

## Escrow Hooks

### useInitializeEscrow

Deploy and initialize an escrow contract.

**Import:**
```tsx
import { useInitializeEscrow } from '@trustless-work/escrow/hooks';
import { 
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload 
} from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { initializeEscrow, isPending, isError, isSuccess } = useInitializeEscrow();

// Single-release
const payload: InitializeSingleReleaseEscrowPayload = {
  signer: payerAddress,
  engagementId: 'project-123',
  title: 'Website Development',
  description: 'Build responsive website',
  roles: [
    { address: payerAddress, type: 'payer' },
    { address: serviceProviderAddress, type: 'serviceProvider' },
    { address: approverAddress, type: 'approver' },
    { address: disputeResolverAddress, type: 'disputeResolver' }
  ],
  amount: 5000,
  platformFee: 100,
  milestones: [
    { description: 'Design mockups' },
    { description: 'Frontend development' },
    { description: 'Backend integration' }
  ],
  trustline: [{
    assetCode: 'USDC',
    issuer: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'
  }]
};

// Multi-release
const payload: InitializeMultiReleaseEscrowPayload = {
  signer: payerAddress,
  engagementId: 'project-456',
  title: 'Mobile App Development',
  description: 'Build iOS and Android apps',
  roles: [
    { address: payerAddress, type: 'payer' },
    { address: serviceProviderAddress, type: 'serviceProvider' },
    { address: approverAddress, type: 'approver' },
    { address: disputeResolverAddress, type: 'disputeResolver' }
  ],
  platformFee: 200,
  milestones: [
    { description: 'UI/UX Design', amount: 2000, receiver: serviceProviderAddress },
    { description: 'iOS Development', amount: 3000, receiver: serviceProviderAddress },
    { description: 'Android Development', amount: 3000, receiver: serviceProviderAddress }
  ],
  trustline: [{
    assetCode: 'USDC',
    issuer: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'
  }]
};

const { unsignedTransaction } = await initializeEscrow(payload);
```

### useFundEscrow

Deposit funds into an existing escrow contract.

**Import:**
```tsx
import { useFundEscrow } from '@trustless-work/escrow/hooks';
import { FundEscrowPayload } from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { fundEscrow, isPending, isError, isSuccess } = useFundEscrow();

const payload: FundEscrowPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  amount: 5000,
  signer: payerAddress
};

const { unsignedTransaction } = await fundEscrow(payload);
```

### useApproveMilestone

Approve a milestone for release.

**Import:**
```tsx
import { useApproveMilestone } from '@trustless-work/escrow/hooks';
import { ApproveMilestonePayload } from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { approveMilestone, isPending, isError, isSuccess } = useApproveMilestone();

const payload: ApproveMilestonePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  approver: approverAddress
};

const { unsignedTransaction } = await approveMilestone(payload);
```

### useChangeMilestoneStatus

Update the custom status of a milestone (for service provider).

**Import:**
```tsx
import { useChangeMilestoneStatus } from '@trustless-work/escrow/hooks';
import { ChangeMilestoneStatusPayload } from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { changeMilestoneStatus, isPending, isError, isSuccess } = useChangeMilestoneStatus();

const payload: ChangeMilestoneStatusPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  newStatus: 'In Progress',
  newEvidence: 'https://example.com/proof-of-work.pdf',
  serviceProvider: serviceProviderAddress
};

const { unsignedTransaction } = await changeMilestoneStatus(payload);
```

### useReleaseFunds

Release escrow funds to the service provider.

**Import:**
```tsx
import { useReleaseFunds } from '@trustless-work/escrow/hooks';
import { 
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload 
} from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { releaseFunds, isPending, isError, isSuccess } = useReleaseFunds();

// Single-release
const payload: SingleReleaseReleaseFundsPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  releaseSigner: approverAddress
};

// Multi-release (per milestone)
const payload: MultiReleaseReleaseFundsPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  releaseSigner: approverAddress
};

const { unsignedTransaction } = await releaseFunds(payload);
```

### useStartDispute

Initiate a dispute for an escrow.

**Import:**
```tsx
import { useStartDispute } from '@trustless-work/escrow/hooks';
import { 
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload 
} from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { startDispute, isPending, isError, isSuccess } = useStartDispute();

// Single-release (disputes entire escrow)
const payload: SingleReleaseStartDisputePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  signer: payerAddress
};

// Multi-release (disputes specific milestone)
const payload: MultiReleaseStartDisputePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  signer: payerAddress
};

const { unsignedTransaction } = await startDispute(payload);
```

### useResolveDispute

Resolve a dispute by distributing funds.

**Import:**
```tsx
import { useResolveDispute } from '@trustless-work/escrow/hooks';
import { 
  SingleReleaseResolveDisputePayload,
  MultiReleaseResolveDisputePayload 
} from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { resolveDispute, isPending, isError, isSuccess } = useResolveDispute();

// Single-release
const payload: SingleReleaseResolveDisputePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  disputeResolver: disputeResolverAddress,
  distributions: [
    {
      address: serviceProviderAddress,
      amount: 4000  // Amount after fees
    },
    {
      address: payerAddress,
      amount: 900    // Refund amount
    }
  ]
};

// Multi-release (resolve specific milestone dispute)
const payload: MultiReleaseResolveDisputePayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  milestoneIndex: '0',
  disputeResolver: disputeResolverAddress,
  distributions: [
    {
      address: serviceProviderAddress,
      amount: 2000
    }
  ]
};

const { unsignedTransaction } = await resolveDispute(payload);
```

### useUpdateEscrow

Update escrow properties (title, description, etc.).

**Import:**
```tsx
import { useUpdateEscrow } from '@trustless-work/escrow/hooks';
import { 
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload 
} from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { updateEscrow, isPending, isError, isSuccess } = useUpdateEscrow();

const payload: UpdateSingleReleaseEscrowPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  signer: payerAddress,
  escrow: {
    title: 'Updated Project Title',
    description: 'Updated description',
    engagementId: 'project-123',
    roles: [...],
    amount: 5000,
    platformFee: 100,
    milestones: [...],
    trustline: [...],
    isActive: true
  }
};

const { unsignedTransaction } = await updateEscrow(payload);
```

### useWithdrawRemainingFunds

Withdraw remaining funds from a multi-release escrow (after completion or resolution).

**Import:**
```tsx
import { useWithdrawRemainingFunds } from '@trustless-work/escrow/hooks';
import { WithdrawRemainingFundsPayload } from '@trustless-work/escrow/types';
```

**Usage:**
```tsx
const { withdrawRemainingFunds, isPending, isError, isSuccess } = useWithdrawRemainingFunds();

const payload: WithdrawRemainingFundsPayload = {
  contractId: 'CHASVBD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  disputeResolver: disputeResolverAddress,
  distributions: [
    {
      address: serviceProviderAddress,
      amount: 100  // Remaining amount after all milestones
    }
  ]
};

const { unsignedTransaction } = await withdrawRemainingFunds(payload);
```

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { useInitializeEscrow } from '@trustless-work/escrow/hooks';
import { InitializeSingleReleaseEscrowPayload } from '@trustless-work/escrow/types';
import { useWallet } from '@stellar/wallet-kit';

export function CreateEscrowForm() {
  const { signTransaction } = useWallet();
  const { initializeEscrow, isPending, isError, isSuccess } = useInitializeEscrow();
  const [contractId, setContractId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Prepare payload
      const payload: InitializeSingleReleaseEscrowPayload = {
        signer: walletAddress,
        engagementId: 'project-123',
        title: 'Website Development',
        description: 'Build responsive website',
        roles: [
          { address: payerAddress, type: 'payer' },
          { address: serviceProviderAddress, type: 'serviceProvider' },
          { address: approverAddress, type: 'approver' },
          { address: disputeResolverAddress, type: 'disputeResolver' }
        ],
        amount: 5000,
        platformFee: 100,
        milestones: [
          { description: 'Design mockups' },
          { description: 'Frontend development' },
          { description: 'Backend integration' }
        ],
        trustline: [{
          assetCode: 'USDC',
          issuer: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'
        }]
      };

      // 2. Get unsigned transaction
      const { unsignedTransaction } = await initializeEscrow(payload);

      // 3. Sign with wallet
      const signedTx = await signTransaction(unsignedTransaction);

      // 4. Submit transaction
      const response = await fetch('/api/trustless-work/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ xdr: signedTx })
      });

      const result = await response.json();
      setContractId(result.contractId);
    } catch (error) {
      console.error('Error creating escrow:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Escrow'}
      </button>
      {isSuccess && contractId && (
        <p>Escrow created: {contractId}</p>
      )}
      {isError && (
        <p>Error creating escrow</p>
      )}
    </form>
  );
}
```

## Hook Status Flags

All hooks return status flags:

- `isPending`: Operation is in progress
- `isError`: Operation failed
- `isSuccess`: Operation completed successfully

Use these flags to update UI state and show loading/error messages.

## TypeScript Types

Import types from `@trustless-work/escrow/types`:

```tsx
import type {
  // Payloads
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  FundEscrowPayload,
  ApproveMilestonePayload,
  ChangeMilestoneStatusPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  MultiReleaseResolveDisputePayload,
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  WithdrawRemainingFundsPayload,
  
  // Entities
  SingleReleaseEscrow,
  MultiReleaseEscrow,
  Role,
  
  // Enums
  EscrowType,
  SingleReleaseEscrowStatus
} from '@trustless-work/escrow/types';
```

## Best Practices

1. **Always follow the 3-step pattern**: Get unsigned transaction → Sign → Submit
2. **Handle errors**: Use `isError` flag and try-catch blocks
3. **Show loading states**: Use `isPending` flag for UI feedback
4. **Validate payloads**: Ensure all required fields are present
5. **Type safety**: Use TypeScript types for all payloads
6. **Error messages**: Provide user-friendly error messages
7. **Transaction verification**: Verify transactions on-chain after submission

## Resources

- [React SDK Documentation](https://docs.trustlesswork.com/trustless-work/escrow-react-sdk/escrows)
- [TypeScript Types Documentation](https://docs.trustlesswork.com/trustless-work/developer-resources/tipos/payloads)
- [API Reference](https://docs.trustlesswork.com/trustless-work/api-reference)

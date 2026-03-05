# Blocks TanStack Query Hooks

TanStack Query hooks for fetching and mutating escrows.

## Installation

```bash
npx trustless-work add tanstack
```

## Query Hooks

### Get Escrows by Signer

Fetch escrows created by a specific signer.

```tsx
import { useGetEscrowsBySigner } from '@trustless-work/blocks';

function EscrowsList() {
  const { data, isLoading, error } = useGetEscrowsBySigner({
    signer: walletAddress,
    page: 1,
    pageSize: 10,
    orderBy: 'createdAt',
    orderDirection: 'desc',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.escrows.map(escrow => (
        <EscrowCard key={escrow.contractId} escrow={escrow} />
      ))}
    </div>
  );
}
```

### Get Escrows by Role

Fetch escrows filtered by user role.

```tsx
import { useGetEscrowsByRole } from '@trustless-work/blocks';

function MyEscrowsAsProvider() {
  const { data, isLoading } = useGetEscrowsByRole({
    role: 'serviceProvider',
    roleAddress: walletAddress,
    isActive: true,
  });

  // ...
}
```

### Get Escrow by Contract ID

Fetch a specific escrow by contract ID.

```tsx
import { useGetEscrowByContractId } from '@trustless-work/blocks';

function EscrowDetails({ contractId }: { contractId: string }) {
  const { data, isLoading } = useGetEscrowByContractId({
    contractIds: [contractId],
    validateOnChain: true,
  });

  // ...
}
```

## Mutation Hooks

### Initialize Escrow

```tsx
import { useInitializeEscrow } from '@trustless-work/blocks';

function CreateEscrowForm() {
  const { mutateAsync, isPending } = useInitializeEscrow();

  const handleSubmit = async (payload) => {
    try {
      const result = await mutateAsync({
        payload,
        type: 'single-release',
        address: walletAddress,
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Escrow'}
      </button>
    </form>
  );
}
```

### Fund Escrow

```tsx
import { useFundEscrow } from '@trustless-work/blocks';

function FundEscrowButton({ contractId }: { contractId: string }) {
  const { mutateAsync, isPending } = useFundEscrow();
  const { selectedEscrow } = useEscrowContext();

  const handleFund = async () => {
    await mutateAsync({
      payload: {
        contractId,
        amount: 5000,
        signer: walletAddress,
      },
      type: selectedEscrow?.type || 'single-release',
      address: walletAddress,
    });
  };

  return (
    <button onClick={handleFund} disabled={isPending}>
      Fund Escrow
    </button>
  );
}
```

### Approve Milestone

```tsx
import { useApproveMilestone } from '@trustless-work/blocks';

function ApproveMilestoneButton({ milestoneIndex }: { milestoneIndex: number }) {
  const { mutateAsync, isPending } = useApproveMilestone();
  const { selectedEscrow, updateEscrow } = useEscrowContext();

  const handleApprove = async () => {
    await mutateAsync({
      payload: {
        contractId: selectedEscrow?.contractId || '',
        milestoneIndex: milestoneIndex.toString(),
        approver: walletAddress,
      },
      type: selectedEscrow?.type || 'multi-release',
      address: walletAddress,
    });

    // Update context
    updateEscrow({
      ...selectedEscrow,
      milestones: selectedEscrow?.milestones.map((m, i) => 
        i === milestoneIndex ? { ...m, approved: true } : m
      ),
    });
  };

  return (
    <button onClick={handleApprove} disabled={isPending}>
      Approve Milestone
    </button>
  );
}
```

### Change Milestone Status

```tsx
import { useChangeMilestoneStatus } from '@trustless-work/blocks';

function ChangeStatusForm() {
  const { mutateAsync, isPending } = useChangeMilestoneStatus();
  const { selectedEscrow, updateEscrow } = useEscrowContext();

  const handleSubmit = async (payload) => {
    await mutateAsync({
      payload: {
        contractId: selectedEscrow?.contractId || '',
        milestoneIndex: payload.milestoneIndex,
        newStatus: payload.status,
        newEvidence: payload.evidence,
        serviceProvider: walletAddress,
      },
      type: selectedEscrow?.type || 'multi-release',
      address: walletAddress,
    });

    // Update context
    updateEscrow({
      ...selectedEscrow,
      milestones: selectedEscrow?.milestones.map((m, i) => 
        i === Number(payload.milestoneIndex) 
          ? { ...m, status: payload.status, evidence: payload.evidence }
          : m
      ),
    });
  };

  // ...
}
```

### Release Funds

```tsx
import { useReleaseFunds } from '@trustless-work/blocks';

function ReleaseFundsButton() {
  const { mutateAsync, isPending } = useReleaseFunds();
  const { selectedEscrow } = useEscrowContext();

  const handleRelease = async () => {
    await mutateAsync({
      payload: {
        contractId: selectedEscrow?.contractId || '',
        releaseSigner: walletAddress,
        ...(selectedEscrow?.type === 'multi-release' && {
          milestoneIndex: '0',
        }),
      },
      type: selectedEscrow?.type || 'single-release',
      address: walletAddress,
    });
  };

  return (
    <button onClick={handleRelease} disabled={isPending}>
      Release Funds
    </button>
  );
}
```

### Start Dispute

```tsx
import { useStartDispute } from '@trustless-work/blocks';

function DisputeButton() {
  const { mutateAsync, isPending } = useStartDispute();
  const { selectedEscrow } = useEscrowContext();

  const handleDispute = async () => {
    await mutateAsync({
      payload: {
        contractId: selectedEscrow?.contractId || '',
        signer: walletAddress,
        ...(selectedEscrow?.type === 'multi-release' && {
          milestoneIndex: '0',
        }),
      },
      type: selectedEscrow?.type || 'single-release',
      address: walletAddress,
    });
  };

  return (
    <button onClick={handleDispute} disabled={isPending}>
      Start Dispute
    </button>
  );
}
```

### Resolve Dispute

```tsx
import { useResolveDispute } from '@trustless-work/blocks';

function ResolveDisputeDialog() {
  const { mutateAsync, isPending } = useResolveDispute();
  const { selectedEscrow } = useEscrowContext();

  const handleResolve = async (distributions) => {
    await mutateAsync({
      payload: {
        contractId: selectedEscrow?.contractId || '',
        disputeResolver: walletAddress,
        distributions,
        ...(selectedEscrow?.type === 'multi-release' && {
          milestoneIndex: '0',
        }),
      },
      type: selectedEscrow?.type || 'single-release',
      address: walletAddress,
    });
  };

  // ...
}
```

## Hook Pattern

All mutation hooks follow this pattern:

1. **Get unsigned transaction** from hook
2. **Sign with wallet**
3. **Submit transaction** via `/helper/send-transaction`
4. **Update context** (if needed)

The hooks handle steps 1-3 internally. You may need to update context manually after mutations.

## Query Options

### Filtering

```tsx
useGetEscrowsBySigner({
  signer: walletAddress,
  isActive: true,
  type: 'single-release',
  minAmount: 1000,
  maxAmount: 10000,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

### Pagination

```tsx
useGetEscrowsBySigner({
  signer: walletAddress,
  page: 1,
  pageSize: 20,
});
```

### Sorting

```tsx
useGetEscrowsBySigner({
  signer: walletAddress,
  orderBy: 'createdAt', // 'createdAt' | 'updatedAt' | 'amount'
  orderDirection: 'desc', // 'asc' | 'desc'
});
```

### On-Chain Validation

```tsx
useGetEscrowByContractId({
  contractIds: [contractId],
  validateOnChain: true, // Verify against blockchain
});
```

## Error Handling

```tsx
const { data, error, isLoading } = useGetEscrowsBySigner({ signer });

if (error) {
  // Handle error
  console.error('Failed to fetch escrows:', error);
}
```

## Loading States

```tsx
const { isLoading, isFetching } = useGetEscrowsBySigner({ signer });

if (isLoading) {
  return <LoadingSpinner />;
}
```

# Blocks Providers

Providers for API configuration, wallet context, dialogs, and amount formatting.

## EscrowContext Provider

Global state management for escrow data.

### Setup

```tsx
import { EscrowProvider } from '@trustless-work/blocks';

function App() {
  return (
    <EscrowProvider>
      {/* Your app */}
    </EscrowProvider>
  );
}
```

### Usage

```tsx
import { useEscrowContext } from '@trustless-work/blocks';

function MyComponent() {
  const { 
    selectedEscrow, 
    setSelectedEscrow, 
    updateEscrow 
  } = useEscrowContext();

  // Use selectedEscrow to access current escrow
  // Use setSelectedEscrow to change selection
  // Use updateEscrow to update escrow state
}
```

### API

#### selectedEscrow

Currently selected escrow object. Contains:
- `contractId`: Escrow contract address
- `type`: `'single-release'` or `'multi-release'`
- `roles`: Array of role objects
- `milestones`: Array of milestone objects
- `flags`: Escrow status flags
- Other escrow properties

#### setSelectedEscrow(escrow)

Sets the currently selected escrow. Used when:
- Clicking on an escrow card/row
- Opening escrow details dialog
- Navigating to escrow view

**Example:**

```tsx
const { setSelectedEscrow } = useEscrowContext();

const onCardClick = (escrow: Escrow) => {
  setSelectedEscrow(escrow);
  dialogStates.details.setIsOpen(true);
};
```

#### updateEscrow(escrow)

Updates the selected escrow in context. Used after mutations to keep UI in sync.

**Example:**

```tsx
const { selectedEscrow, updateEscrow } = useEscrowContext();

const handleMilestoneUpdate = async (payload) => {
  await changeMilestoneStatus.mutateAsync({ payload });

  // Update context with new milestone status
  updateEscrow({
    ...selectedEscrow,
    milestones: selectedEscrow.milestones.map((milestone, index) => {
      if (index === Number(payload.milestoneIndex)) {
        return {
          ...milestone,
          status: payload.newStatus,
          evidence: payload.newEvidence,
        };
      }
      return milestone;
    }),
  });
};
```

## Wallet Provider

Wallet integration provider (uses Stellar Wallet Kit).

### Setup

```tsx
import { WalletProvider } from '@trustless-work/blocks';

function App() {
  return (
    <WalletProvider>
      <EscrowProvider>
        {/* Your app */}
      </EscrowProvider>
    </WalletProvider>
  );
}
```

## API Config Provider

Configuration for Trustless Work API.

### Setup

```tsx
import { ApiConfigProvider } from '@trustless-work/blocks';

function App() {
  return (
    <ApiConfigProvider apiKey={process.env.NEXT_PUBLIC_TW_API_KEY}>
      <WalletProvider>
        <EscrowProvider>
          {/* Your app */}
        </EscrowProvider>
      </WalletProvider>
    </ApiConfigProvider>
  );
}
```

## Dialog Provider

Manages dialog state for modals.

### Setup

```tsx
import { DialogProvider } from '@trustless-work/blocks';

function App() {
  return (
    <DialogProvider>
      <ApiConfigProvider apiKey={apiKey}>
        <WalletProvider>
          <EscrowProvider>
            {/* Your app */}
          </EscrowProvider>
        </WalletProvider>
      </ApiConfigProvider>
    </DialogProvider>
  );
}
```

### Usage

```tsx
import { useDialogState } from '@trustless-work/blocks';

function MyComponent() {
  const dialogStates = useDialogState();

  const openDialog = () => {
    dialogStates.first.setIsOpen(true);
  };

  return (
    <>
      <button onClick={openDialog}>Open Dialog</button>
      <Dialog open={dialogStates.first.isOpen}>
        {/* Dialog content */}
      </Dialog>
    </>
  );
}
```

## Amount Provider

Formats and displays amounts with proper decimals.

### Setup

```tsx
import { AmountProvider } from '@trustless-work/blocks';

function App() {
  return (
    <AmountProvider>
      {/* Your app */}
    </AmountProvider>
  );
}
```

### Usage

```tsx
import { useAmountFormatter } from '@trustless-work/blocks';

function AmountDisplay({ amount }: { amount: number }) {
  const formatAmount = useAmountFormatter();
  
  return <span>{formatAmount(amount)}</span>;
}
```

## Complete Provider Setup

```tsx
import { 
  ApiConfigProvider,
  WalletProvider,
  EscrowProvider,
  DialogProvider,
  AmountProvider
} from '@trustless-work/blocks';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApiConfigProvider apiKey={process.env.NEXT_PUBLIC_TW_API_KEY}>
      <WalletProvider>
        <DialogProvider>
          <AmountProvider>
            <EscrowProvider>
              {children}
            </EscrowProvider>
          </AmountProvider>
        </DialogProvider>
      </WalletProvider>
    </ApiConfigProvider>
  );
}
```

## Alternative State Management

You can use alternative state management instead of Context API:

- **Redux**: Use Redux store for escrow state
- **Zustand**: Use Zustand store
- **React Query**: Use TanStack Query cache directly

**Important**: Ensure `selectedEscrow` data is available to endpoint hooks, regardless of state management solution.

# Blocks SDK Introduction

The Trustless Work Blocks SDK provides pre-built UI components, providers, and TanStack Query hooks for quickly building escrow management interfaces.

## What You Get

- **UI Blocks**: Cards, tables, dialogs, forms to list and manage escrows
- **Providers**: API config, wallet context, dialogs, and amount formatting
- **TanStack Query Hooks**: For fetching and mutating escrows
- **Wallet-kit Helpers**: Wallet integration utilities
- **Error Handling**: Built-in error handling utilities

## Installation

```bash
npm install @trustless-work/blocks
```

## Resources

- [Blocks Playground](https://blocks.trustlesswork.com/blocks)
- [GitHub Repository](https://github.com/Trustless-Work/react-library-trustless-work-blocks)
- [NPM Package](https://www.npmjs.com/package/@trustless-work/blocks)

## List Available Blocks

Use the CLI to discover all available blocks:

```bash
npx trustless-work list
```

This prints all available folder paths for `npx trustless-work add ...`.

## Installation Methods

### Install by Folder Path

Install entire folders (and all child blocks) with one command:

```bash
# Install all escrow blocks
npx trustless-work add escrows

# Install only single-release escrow blocks
npx trustless-work add escrows/single-release

# Install specific component
npx trustless-work add escrows/escrows-by-role/table
# or
npx trustless-work add escrows/escrows-by-role/cards
```

**Tip**: Start broad (`escrows`), then narrow down as needed (`escrows/single-release/...`).

### Install TanStack Query

Add TanStack Query to your app:

```bash
npx trustless-work add tanstack
```

## Context API

The Blocks SDK uses a Context API for global escrow state management.

### EscrowContext

The `EscrowContext` provides utilities for managing escrow state:

- `selectedEscrow`: Currently selected escrow
- `setSelectedEscrow`: Set the selected escrow
- `updateEscrow`: Update the selected escrow in context

### How Context is Used

Endpoint hooks read from `selectedEscrow` to extract data like `contractId`, roles, etc. UI blocks use `setSelectedEscrow` to store the selected escrow when opening details dialogs.

**Example: Using selectedEscrow**

```tsx
import { useEscrowContext } from '@trustless-work/blocks';

function ChangeMilestoneStatus() {
  const { selectedEscrow } = useEscrowContext();

  const handleSubmit = async (payload) => {
    const finalPayload = {
      contractId: selectedEscrow?.contractId || '',
      milestoneIndex: payload.milestoneIndex,
      newStatus: payload.status,
      serviceProvider: walletAddress || '',
    };

    await changeMilestoneStatus.mutateAsync({
      payload: finalPayload,
      type: selectedEscrow?.type || 'multi-release',
      address: walletAddress || '',
    });
  };
}
```

**Example: Setting selectedEscrow**

```tsx
import { useEscrowContext } from '@trustless-work/blocks';

function EscrowsCards() {
  const { setSelectedEscrow } = useEscrowContext();

  const onCardClick = (escrow: Escrow) => {
    setSelectedEscrow(escrow);
    dialogStates.second.setIsOpen(true);
  };
}
```

**Example: Updating escrow**

```tsx
import { useEscrowContext } from '@trustless-work/blocks';

function UpdateMilestone() {
  const { selectedEscrow, updateEscrow } = useEscrowContext();

  const handleSubmit = async (payload) => {
    await changeMilestoneStatus.mutateAsync({
      payload: finalPayload,
      type: selectedEscrow?.type || 'multi-release',
      address: walletAddress || '',
    });

    // Update the selected escrow in context
    updateEscrow({
      ...selectedEscrow,
      milestones: selectedEscrow?.milestones.map((milestone, index) => {
        if (index === Number(payload.milestoneIndex)) {
          return {
            ...milestone,
            status: payload.status,
            evidence: payload.evidence || undefined,
          };
        }
        return milestone;
      }),
    });
  };
}
```

## Customization

{% hint style="info" %}
Want to customize the blocks?

Edit the generated components however you want.
{% endhint %}

All blocks are fully customizable. After installation, you can modify the generated components to match your design system.

## Alternative State Management

You don't have to use the Context API approach. You can use:
- Redux
- Zustand
- Any other state management solution

Just ensure the target escrow data is available to each endpoint hook.

## Next Steps

- See [components.md](components.md) for available UI components
- See [providers.md](providers.md) for provider setup
- See [hooks.md](hooks.md) for TanStack Query hooks

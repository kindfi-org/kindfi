# Blocks Components

Pre-built UI components for escrow management interfaces. All components can be installed via CLI and are fully customizable.

## Installation

All components are installed using the `npx trustless-work add` command:

```bash
npx trustless-work add <component-path>
```

## Component Categories

### Listing Components

#### Escrows by Signer

List escrows created by a specific signer.

**Installation:**
```bash
# Table view
npx trustless-work add escrows/escrows-by-signer/table

# Cards view
npx trustless-work add escrows/escrows-by-signer/cards
```

**Usage:**
```tsx
import { EscrowsBySignerCards } from "@/components/tw-blocks/escrows/escrows-by-signer/cards/EscrowsCards";
// or
import { EscrowsBySignerTable } from "@/components/tw-blocks/escrows/escrows-by-signer/table/EscrowsTable";

function MyPage() {
  return (
    <div>
      <EscrowsBySignerCards />
      {/* or */}
      <EscrowsBySignerTable />
    </div>
  );
}
```

#### Escrows by Role

List escrows filtered by user role (serviceProvider, approver, etc.).

**Installation:**
```bash
# Table view
npx trustless-work add escrows/escrows-by-role/table

# Cards view
npx trustless-work add escrows/escrows-by-role/cards
```

**Usage:**
```tsx
import { EscrowsByRoleCards } from "@/components/tw-blocks/escrows/escrows-by-role/cards/EscrowsCards";
// or
import { EscrowsByRoleTable } from "@/components/tw-blocks/escrows/escrows-by-role/table/EscrowsTable";

function MyPage() {
  return (
    <div>
      <EscrowsByRoleCards />
      {/* or */}
      <EscrowsByRoleTable />
    </div>
  );
}
```

### Initialize Escrow Components

#### Single Release Initialize Escrow

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-release/initialize-escrow/form

# Dialog component
npx trustless-work add escrows/single-release/initialize-escrow/dialog
```

**Usage:**
```tsx
import { InitializeEscrowForm } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/form/InitializeEscrow";
// or
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/dialog/InitializeEscrow";

function MyPage() {
  return (
    <div>
      <InitializeEscrowForm />
      {/* or */}
      <InitializeEscrowDialog />
    </div>
  );
}
```

#### Multi Release Initialize Escrow

**Installation:**
```bash
# Form component
npx trustless-work add escrows/multi-release/initialize-escrow/form

# Dialog component
npx trustless-work add escrows/multi-release/initialize-escrow/dialog
```

**Usage:**
```tsx
import { InitializeEscrowForm } from "@/components/tw-blocks/escrows/multi-release/initialize-escrow/form/InitializeEscrow";
// or
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/multi-release/initialize-escrow/dialog/InitializeEscrow";

function MyPage() {
  return (
    <div>
      <InitializeEscrowForm />
      {/* or */}
      <InitializeEscrowDialog />
    </div>
  );
}
```

### Fund Escrow Components

Works with both single-release and multi-release escrows.

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-multi-release/fund-escrow/form

# Button component
npx trustless-work add escrows/single-multi-release/fund-escrow/button

# Dialog component
npx trustless-work add escrows/single-multi-release/fund-escrow/dialog
```

**Usage:**
```tsx
import { FundEscrowForm } from "@/components/tw-blocks/escrows/single-multi-release/fund-escrow/form/FundEscrow";
import { FundEscrowButton } from "@/components/tw-blocks/escrows/single-multi-release/fund-escrow/button/FundEscrow";
import { FundEscrowDialog } from "@/components/tw-blocks/escrows/single-multi-release/fund-escrow/dialog/FundEscrow";

function MyPage() {
  return (
    <div>
      <FundEscrowForm />
      {/* or */}
      <FundEscrowButton />
      {/* or */}
      <FundEscrowDialog />
    </div>
  );
}
```

### Approve Milestone Components

Works with both single-release and multi-release escrows.

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-multi-release/approve-milestone/form

# Button component
npx trustless-work add escrows/single-multi-release/approve-milestone/button

# Dialog component
npx trustless-work add escrows/single-multi-release/approve-milestone/dialog
```

**Usage:**
```tsx
import { ApproveMilestoneForm } from "@/components/tw-blocks/escrows/single-multi-release/approve-milestone/form/ApproveMilestone";
import { ApproveMilestoneButton } from "@/components/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
import { ApproveMilestoneDialog } from "@/components/tw-blocks/escrows/single-multi-release/approve-milestone/dialog/ApproveMilestone";

function MyPage() {
  return (
    <div>
      <ApproveMilestoneForm />
      {/* or */}
      <ApproveMilestoneButton />
      {/* or */}
      <ApproveMilestoneDialog />
    </div>
  );
}
```

### Change Milestone Status Components

Works with both single-release and multi-release escrows.

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-multi-release/change-milestone-status/form

# Button component
npx trustless-work add escrows/single-multi-release/change-milestone-status/button

# Dialog component
npx trustless-work add escrows/single-multi-release/change-milestone-status/dialog
```

**Usage:**
```tsx
import { ChangeMilestoneStatusForm } from "@/components/tw-blocks/escrows/single-multi-release/change-milestone-status/form/ChangeMilestoneStatus";
import { ChangeMilestoneStatusButton } from "@/components/tw-blocks/escrows/single-multi-release/change-milestone-status/button/ChangeMilestoneStatus";
import { ChangeMilestoneStatusDialog } from "@/components/tw-blocks/escrows/single-multi-release/change-milestone-status/dialog/ChangeMilestoneStatus";

function MyPage() {
  return (
    <div>
      <ChangeMilestoneStatusForm />
      {/* or */}
      <ChangeMilestoneStatusButton />
      {/* or */}
      <ChangeMilestoneStatusDialog />
    </div>
  );
}
```

### Release Funds Components

#### Single Release Release Escrow

**Installation:**
```bash
npx trustless-work add escrows/single-release/release-escrow/button
```

**Usage:**
```tsx
import { ReleaseEscrowButton } from "@/components/tw-blocks/escrows/single-release/release-escrow/button/ReleaseEscrow";

function MyPage() {
  return (
    <div>
      <ReleaseEscrowButton />
    </div>
  );
}
```

#### Multi Release Release Milestone

**Installation:**
```bash
npx trustless-work add escrows/multi-release/release-milestone/button
```

**Usage:**
```tsx
import { ReleaseMilestoneButton } from "@/components/tw-blocks/escrows/multi-release/release-milestone/button/ReleaseMilestone";

function MyPage() {
  return (
    <div>
      <ReleaseMilestoneButton />
    </div>
  );
}
```

### Dispute Escrow Components

#### Single Release Dispute Escrow

**Installation:**
```bash
npx trustless-work add escrows/single-release/dispute-escrow/button
```

**Usage:**
```tsx
import { DisputeEscrowButton } from "@/components/tw-blocks/escrows/single-release/dispute-escrow/button/DisputeEscrow";

function MyPage() {
  return (
    <div>
      <DisputeEscrowButton />
    </div>
  );
}
```

#### Multi Release Dispute Milestone

**Installation:**
```bash
npx trustless-work add escrows/multi-release/dispute-milestone/button
```

**Usage:**
```tsx
import { DisputeMilestoneButton } from "@/components/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";

function MyPage() {
  return (
    <div>
      <DisputeMilestoneButton />
    </div>
  );
}
```

### Resolve Dispute Components

#### Single Release Resolve Dispute

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-release/resolve-dispute/form

# Button component
npx trustless-work add escrows/single-release/resolve-dispute/button

# Dialog component
npx trustless-work add escrows/single-release/resolve-dispute/dialog
```

**Usage:**
```tsx
import { ResolveDisputeForm } from "@/components/tw-blocks/escrows/single-release/resolve-dispute/form/ResolveDispute";
import { ResolveDisputeButton } from "@/components/tw-blocks/escrows/single-release/resolve-dispute/button/ResolveDispute";
import { ResolveDisputeDialog } from "@/components/tw-blocks/escrows/single-release/resolve-dispute/dialog/ResolveDispute";

function MyPage() {
  return (
    <div>
      <ResolveDisputeForm />
      {/* or */}
      <ResolveDisputeButton />
      {/* or */}
      <ResolveDisputeDialog />
    </div>
  );
}
```

#### Multi Release Resolve Dispute

**Installation:**
```bash
# Form component
npx trustless-work add escrows/multi-release/resolve-dispute/form

# Button component
npx trustless-work add escrows/multi-release/resolve-dispute/button

# Dialog component
npx trustless-work add escrows/multi-release/resolve-dispute/dialog
```

**Usage:**
```tsx
import { ResolveDisputeForm } from "@/components/tw-blocks/escrows/multi-release/resolve-dispute/form/ResolveDispute";
import { ResolveDisputeButton } from "@/components/tw-blocks/escrows/multi-release/resolve-dispute/button/ResolveDispute";
import { ResolveDisputeDialog } from "@/components/tw-blocks/escrows/multi-release/resolve-dispute/dialog/ResolveDispute";

function MyPage() {
  return (
    <div>
      <ResolveDisputeForm />
      {/* or */}
      <ResolveDisputeButton />
      {/* or */}
      <ResolveDisputeDialog />
    </div>
  );
}
```

### Update Escrow Components

#### Single Release Update Escrow

**Installation:**
```bash
# Form component
npx trustless-work add escrows/single-release/update-escrow/form

# Dialog component
npx trustless-work add escrows/single-release/update-escrow/dialog
```

**Usage:**
```tsx
import { UpdateEscrowForm } from "@/components/tw-blocks/escrows/single-release/update-escrow/form/UpdateEscrow";
// or
import { UpdateEscrowDialog } from "@/components/tw-blocks/escrows/single-release/update-escrow/dialog/UpdateEscrow";

function MyPage() {
  return (
    <div>
      <UpdateEscrowForm />
      {/* or */}
      <UpdateEscrowDialog />
    </div>
  );
}
```

#### Multi Release Update Escrow

**Installation:**
```bash
# Form component
npx trustless-work add escrows/multi-release/update-escrow/form

# Dialog component
npx trustless-work add escrows/multi-release/update-escrow/dialog
```

**Usage:**
```tsx
import { UpdateEscrowForm } from "@/components/tw-blocks/escrows/multi-release/update-escrow/form/UpdateEscrow";
// or
import { UpdateEscrowDialog } from "@/components/tw-blocks/escrows/multi-release/update-escrow/dialog/UpdateEscrow";

function MyPage() {
  return (
    <div>
      <UpdateEscrowForm />
      {/* or */}
      <UpdateEscrowDialog />
    </div>
  );
}
```

### Withdraw Remaining Funds Components

**Multi Release Only**

**Installation:**
```bash
# Form component
npx trustless-work add escrows/multi-release/withdraw-remaining-funds/form

# Button component
npx trustless-work add escrows/multi-release/withdraw-remaining-funds/button

# Dialog component
npx trustless-work add escrows/multi-release/withdraw-remaining-funds/dialog
```

**Usage:**
```tsx
import { WithdrawRemainingFundsForm } from "@/components/tw-blocks/escrows/multi-release/withdraw-remaining-funds/form/WithdrawRemainingFunds";
import { WithdrawRemainingFundsButton } from "@/components/tw-blocks/escrows/multi-release/withdraw-remaining-funds/button/WithdrawRemainingFunds";
import { WithdrawRemainingFundsDialog } from "@/components/tw-blocks/escrows/multi-release/withdraw-remaining-funds/dialog/WithdrawRemainingFunds";

function MyPage() {
  return (
    <div>
      <WithdrawRemainingFundsForm />
      {/* or */}
      <WithdrawRemainingFundsButton />
      {/* or */}
      <WithdrawRemainingFundsDialog />
    </div>
  );
}
```

## Component Types

### Forms

Form components provide full form UI with inputs, validation, and submission handling.

**Examples:**
- `InitializeEscrowForm`
- `FundEscrowForm`
- `ApproveMilestoneForm`
- `ChangeMilestoneStatusForm`
- `ResolveDisputeForm`
- `UpdateEscrowForm`
- `WithdrawRemainingFundsForm`

### Buttons

Button components trigger actions with a single click. Usually used inline in lists or detail views.

**Examples:**
- `FundEscrowButton`
- `ApproveMilestoneButton`
- `ChangeMilestoneStatusButton`
- `ReleaseEscrowButton`
- `ReleaseMilestoneButton`
- `DisputeEscrowButton`
- `DisputeMilestoneButton`
- `ResolveDisputeButton`
- `WithdrawRemainingFundsButton`

### Dialogs

Dialog components provide modal interfaces for actions. Usually triggered by buttons or other UI elements.

**Examples:**
- `InitializeEscrowDialog`
- `FundEscrowDialog`
- `ApproveMilestoneDialog`
- `ChangeMilestoneStatusDialog`
- `ResolveDisputeDialog`
- `UpdateEscrowDialog`
- `WithdrawRemainingFundsDialog`

### Cards

Card-based UI for displaying escrow lists in a grid layout.

**Examples:**
- `EscrowsBySignerCards`
- `EscrowsByRoleCards`

### Tables

Table-based UI for displaying escrow lists in a tabular format.

**Examples:**
- `EscrowsBySignerTable`
- `EscrowsByRoleTable`

## Complete Example: Escrow Details Actions

Here's how to use multiple components together in an escrow details view:

```tsx
// escrows/escrows-by-role/details/Actions.tsx
import { UpdateEscrowDialog } from "../../single-release/update-escrow/dialog/UpdateEscrow";
/* import { UpdateEscrowDialog as UpdateEscrowDialogMultiRelease } from "../../multi-release/update-escrow/dialog/UpdateEscrow"; */
import { FundEscrowDialog } from "../../single-multi-release/fund-escrow/dialog/FundEscrow";
import { DisputeEscrowButton } from "../../single-release/dispute-escrow/button/DisputeEscrow";
import { ResolveDisputeDialog } from "../../single-release/resolve-dispute/dialog/ResolveDispute";
import { ReleaseEscrowButton } from "../../single-release/release-escrow/button/ReleaseEscrow";
import { useEscrowContext } from "@trustless-work/blocks";

export function EscrowActions() {
  const { selectedEscrow } = useEscrowContext();

  // Conditional rendering based on escrow flags and user roles
  const shouldShowEditButton = /* your logic */;
  const shouldShowDisputeButton = /* your logic */;
  const shouldShowResolveButton = /* your logic */;
  const shouldShowReleaseFundsButton = /* your logic */;
  const hasConditionalButtons = shouldShowEditButton || shouldShowDisputeButton || 
                                 shouldShowResolveButton || shouldShowReleaseFundsButton;

  return (
    <div className="flex items-start justify-start flex-col gap-2 w-full">
      {hasConditionalButtons && (
        <div className="flex flex-col gap-2 w-full">
          {/* Render based on escrow type */}
          {selectedEscrow?.type === 'single-release' && shouldShowEditButton && (
            <UpdateEscrowDialog />
          )}
          {selectedEscrow?.type === 'multi-release' && shouldShowEditButton && (
            <UpdateEscrowDialogMultiRelease />
          )}
          
          {/* Single-release only */}
          {shouldShowDisputeButton && <DisputeEscrowButton />}
          {shouldShowResolveButton && <ResolveDisputeDialog />}
          {shouldShowReleaseFundsButton && <ReleaseEscrowButton />}
        </div>
      )}
      
      {/* Works with both types */}
      <FundEscrowDialog />
    </div>
  );
}
```

## Conditional Rendering

Components should be conditionally rendered based on:

1. **Escrow type**: `single-release` vs `multi-release`
2. **Escrow flags**: `approved`, `dispute`, `released`, `resolved`
3. **User roles**: `payer`, `serviceProvider`, `approver`, `disputeResolver`
4. **Milestone state**: Completed, approved, disputed, etc.

**Example:**

```tsx
// Check escrow type
if (selectedEscrow?.type === 'single-release') {
  // Render single-release components
} else if (selectedEscrow?.type === 'multi-release') {
  // Render multi-release components
}

// Check flags
if (selectedEscrow?.flags?.dispute && !selectedEscrow?.flags?.resolved) {
  // Show resolve dispute dialog
}

// Check user role
if (userRole === 'approver' && allMilestonesApproved) {
  // Show release button
}
```

## Installation Patterns

### Install Entire Category

```bash
# Install all escrow blocks
npx trustless-work add escrows

# Install all single-release blocks
npx trustless-work add escrows/single-release

# Install all multi-release blocks
npx trustless-work add escrows/multi-release

# Install all shared blocks (single-multi-release)
npx trustless-work add escrows/single-multi-release
```

### Install Specific Component

```bash
# Specific component
npx trustless-work add escrows/single-release/initialize-escrow/dialog

# Multiple components
npx trustless-work add escrows/escrows-by-role/cards
npx trustless-work add escrows/single-release/release-escrow/button
```

## Customization

All components are fully customizable. After installation:

1. **Edit generated files** - Modify components in `components/tw-blocks/`
2. **Update styles** - Change Tailwind classes to match your design system
3. **Adjust logic** - Modify component logic for your use case
4. **Add features** - Extend components with additional functionality

## Discover All Components

Use the CLI to discover all available components:

```bash
npx trustless-work list
```

This prints all available folder paths for installation.

## Component Checklist

When building an escrow management interface, consider:

- [ ] **Listings**: Escrows by signer or role (cards/table)
- [ ] **Initialize**: Create new escrows (form/dialog)
- [ ] **Fund**: Deposit funds (form/button/dialog)
- [ ] **Update**: Modify escrow properties (form/dialog)
- [ ] **Change Status**: Update milestone status (form/button/dialog)
- [ ] **Approve**: Approve milestones (form/button/dialog)
- [ ] **Release**: Release funds (button)
- [ ] **Dispute**: Start disputes (button)
- [ ] **Resolve**: Resolve disputes (form/button/dialog)
- [ ] **Withdraw**: Withdraw remaining funds - multi-release only (form/button/dialog)

## Resources

- [Blocks Playground](https://blocks.trustlesswork.com/blocks) - See all components live
- [GitHub Repository](https://github.com/Trustless-Work/react-library-trustless-work-blocks)
- [NPM Package](https://www.npmjs.com/package/@trustless-work/blocks)

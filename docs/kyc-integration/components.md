# Didit KYC Integration - Components

## Overview

The KYC integration consists of several React components and hooks that manage the verification flow and status display.

## Components

### 1. Profile Dashboard

**File**: `/apps/web/components/sections/profile/profile-dashboard.tsx`

**Purpose**: Main container component for the profile page.

**Props**:

```typescript
interface ProfileDashboardProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    profile: {
      role: Role;
      display_name: string | null;
      bio: string | null;
      image_url: string | null;
      slug?: string | null;
    } | null;
  };
  defaultTab?: "overview" | "settings";
  kycCompleted?: boolean;
}
```

**Key Features**:

- Handles callback URL parameters (`kyc=completed`, `status`, `verificationSessionId`)
- Shows appropriate toast notifications based on status
- Triggers page reload after callback processing
- Displays KYC card component

---

### 2. KYC Card

**File**: `/apps/web/components/sections/profile/cards/kyc-card.tsx`

**Purpose**: Displays KYC status and provides "Start KYC Process" button.

**Props**:

```typescript
interface KYCCardProps {
  userId: string;
  shouldRefresh?: boolean;
}
```

**Features**:

- Shows current KYC status badge (Not Started, In Progress, Verified, Rejected)
- Displays status message
- "Start KYC Process" button (shown when status is null or rejected)
- "Retry Verification" button (shown when status is rejected)
- Listens for `kyc-status-updated` events
- Refreshes status on mount and when `shouldRefresh` prop changes

**Status Badges**:

- **Not Started**: Gray badge
- **In Progress**: Yellow badge with "In Progress" text
- **Verified**: Green badge with checkmark icon
- **Rejected**: Red badge with "Rejected" text
- **Error**: Orange badge with "Error" text

---

### 3. KYC Redirect Modal

**File**: `/apps/web/components/sections/profile/modals/kyc-redirect-modal.tsx`

**Purpose**: Shows countdown modal before redirecting to Didit verification page.

**Props**:

```typescript
interface KYCRedirectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationUrl: string;
  onCancel: () => void;
  countdownSeconds?: number; // Default: 3
}
```

**Features**:

- 3-second countdown before redirect
- "Cancel" button to abort redirect
- "Continue Now" button to redirect immediately
- Clear explanation of what will happen

---

## Hooks

### useDiditKYC

**File**: `/apps/web/hooks/use-didit-kyc.ts`

**Purpose**: Custom React hook for managing KYC state and operations.

**Usage**:

```typescript
const { kycStatus, createSession, refreshStatus, checkStatusFromDidit } =
  useDiditKYC(userId);
```

**Returns**:

```typescript
{
  kycStatus: {
    status: "pending" | "approved" | "rejected" | "verified" | null;
    isLoading: boolean;
    error: string | null;
  }
  createSession: (redirectUrl?: string) => Promise<CreateSessionResponse>;
  refreshStatus: () => Promise<void>;
  checkStatusFromDidit: () => Promise<CheckStatusResponse>;
}
```

**Features**:

- Loads KYC status on mount via `/api/kyc/status`
- Polls for status updates every 5 seconds
- Provides `createSession` function to start verification
- Provides `refreshStatus` function to reload from database
- Provides `checkStatusFromDidit` function to query Didit API directly

**Status Loading**:

- Uses `/api/kyc/status` endpoint (server-side, bypasses RLS)
- Automatically polls every 5 seconds
- Handles errors gracefully

---

## Component Hierarchy

```
ProfilePage (Server Component)
  └─ ProfileDashboard (Client Component)
      ├─ ProfileHeader
      ├─ Quick Stats Cards
      │   ├─ WalletCard
      │   ├─ KYCCard ← KYC Status Display
      │   └─ RoleCard
      └─ Tabs (Overview/Settings)
```

---

## State Management

### KYC Status State

Managed by `useDiditKYC` hook:

```typescript
interface KYCStatus {
  status: "pending" | "approved" | "rejected" | "verified" | null;
  isLoading: boolean;
  error: string | null;
}
```

### Component State

**KYCCard**:

- `isCreating`: Boolean - Whether session creation is in progress
- `showRedirectModal`: Boolean - Whether redirect modal is visible
- `verificationUrl`: string | null - Didit verification URL

**KYCRedirectModal**:

- `redirectCountdown`: number - Countdown seconds remaining

---

## Event System

### Custom Events

**`kyc-status-updated`**: Dispatched when callback API completes

```typescript
window.dispatchEvent(new CustomEvent('kyc-status-updated', {
  detail: { status: 'approved', ... }
}))
```

**Listeners**:

- `KYCCard` component listens for this event and refreshes status

---

## Refresh Strategies

### 1. On Mount

- Component loads status immediately via `refreshStatus()`

### 2. After Callback

- Page reloads automatically after callback API completes
- Fresh page load fetches latest status

### 3. Polling

- Hook polls every 5 seconds for status updates
- Useful for catching webhook updates

### 4. Event-Driven

- Listens for `kyc-status-updated` custom event
- Refreshes immediately when event fires

### 5. Prop-Based

- `shouldRefresh` prop triggers refresh when changed
- Used when parent component detects callback completion

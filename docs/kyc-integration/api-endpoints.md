# Didit KYC Integration - API Endpoints

## Overview

All API endpoints require NextAuth session authentication. The user must be logged in to access these endpoints.

## Endpoints

### 1. Create Verification Session

**Endpoint**: `POST /api/kyc/didit/create-session`

**Description**: Creates a new Didit verification session and stores it in the database.

**Request Body**:

```typescript
{
  redirectUrl?: string  // Optional callback URL
}
```

**Response**:

```typescript
{
  success: boolean
  sessionId?: string
  verificationUrl?: string
  error?: string
}
```

**Flow**:

1. Validates NextAuth session
2. Reuses an active Didit session when one already exists
3. Creates a Didit session via the Didit API if needed
4. Stores `session_id` on `kyc.didit_sessions` (not in `kyc_reviews.notes`)
5. Returns `verificationUrl` for redirect

**Error Handling**:

- `401`: Unauthorized (no session)
- `500`: Didit API error or database error

---

### 2. Handle Callback

**Endpoint**: `POST /api/kyc/didit/callback`

**Description**: Processes callback from Didit with status update.

**Request Body**:

```typescript
{
  verificationSessionId: string;
  status: string; // "Approved", "Declined", "In Review", etc.
}
```

**Response**:

```typescript
{
  success: boolean;
  status: "pending" | "approved" | "rejected" | "verified";
  diditStatus: string;
}
```

**Flow**:

1. Validates NextAuth session
2. Looks up the session in `kyc.didit_sessions` by `session_id`
3. Applies the status update through `applyDiditStatusUpdate` (idempotent, monotonic)
4. Returns the canonical status

**Error Handling**:

- `401`: Unauthorized
- `400`: Missing required parameters
- `500`: Database update error

---

### 3. Webhook Handler

**Endpoint**: `POST /api/kyc/didit/webhook`

**Description**: Receives webhook events from Didit for status updates.

**Headers**:

- `X-Signature-V2` or `X-Signature-Simple`: HMAC signature
- `X-Timestamp`: Timestamp for signature verification

**Request Body**:

```typescript
{
  session_id: string
  status: string
  timestamp: number
  webhook_type: string
  decision?: object
}
```

**Response**:

```typescript
{
  received: boolean;
}
```

**Flow**:

1. Verifies webhook signature (HMAC) before any payload is processed
2. Looks up the session in `kyc.didit_sessions` by `session_id`
3. Records the Didit event id for idempotency
4. Skips delayed events that would regress a newer status
5. Updates canonical status and Pollar-activates on `approved`
6. Returns `{ received: true }`

Decision payloads, documents, and biometrics are not stored or logged.

**Security**:

- Webhook signature verification prevents unauthorized requests
- Supports both V2 and Simple signature methods

**Error Handling**:

- `401`: Invalid signature
- `500`: Database update error

---

### 4. Check Status from Didit

**Endpoint**: `POST /api/kyc/didit/check-status`

**Description**: Queries Didit API directly for current session status.

**Response**:

```typescript
{
  success: boolean
  status?: CanonicalKycStatus | null
  canonicalStatus?: CanonicalKycStatus
  storedCanonicalStatus?: CanonicalKycStatus
  diditStatus?: string
  message?: string
}

type CanonicalKycStatus =
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'manual_review'
  | 'provider_unavailable'
```

These HTTP 200 bodies are the contract clients should switch on:

- **Didit reachable**: `success: true`. `status` and `canonicalStatus` are the mapped KindFi status. `diditStatus` is the raw Didit session value (for example `Approved`, `In Review`). `message` is omitted.
- **No session**: `success: false`, `status: null`, `canonicalStatus: "not_started"`, `message: "No KYC session found"`.
- **`provider_unavailable`**: `success: false` when the Didit API cannot be reached. `canonicalStatus` is `"provider_unavailable"`. `status` and `storedCanonicalStatus` are the last persisted canonical status. `message` is `"Didit status is temporarily unavailable"`. The stored session row is not overwritten.

`storedCanonicalStatus` is present only on the `provider_unavailable` outcome. Use it (or `status`) to keep showing the last known decision; do not treat `canonicalStatus: "provider_unavailable"` as a new Didit result.

**Flow**:

1. Validates NextAuth session
2. Loads the latest row from `kyc.didit_sessions`
3. Queries Didit for the current status
4. Applies the update through `applyDiditStatusUpdate`
5. Returns `canonicalStatus` (or `provider_unavailable` if Didit cannot be reached)

**Error Handling**:

- `401`: Unauthorized
- `500`: Unexpected database or server error
- Provider and missing-session cases above return HTTP 200 with `success: false` (not 4xx/5xx)

---

### 5. Get KYC Status

**Endpoint**: `GET /api/kyc/status`

**Description**: Fetches the current KYC status for the authenticated user.

**Response**:

```typescript
{
  status: "pending" | "approved" | "rejected" | "verified" | null;
  canonicalStatus: string;
  updatedAt: string | null;
  hasActiveSession: boolean;
  enforcement: {
    mode: "disabled" | "monitor" | "enforced";
    enforcedActions: string[];
  };
}
```

`enforcement` is a UI hint only. Authorization always happens on the server
via `authorizeFinancialAction`.

**Flow**:

1. Validates NextAuth session
2. Resolves canonical Didit status from `kyc.didit_sessions` (falling back to `kyc_reviews`)
3. Returns status plus a derived enforcement hint

**Error Handling**:

- `401`: Unauthorized
- `500`: Database query error

**Note**: This endpoint uses the service role client to bypass RLS, but user authentication is validated via NextAuth first.

---

### 6. Preflight authorization

**Endpoint**: `POST /api/kyc/authorize`

**Description**: Server-side preflight for a financial action. The browser may
use this to render the KYC gate; it is not the security boundary. API routes
and server actions call `requireKycAuthorization` independently.

**Request Body**:

```typescript
{
  action: "donate" | "submit_campaign" | "release_escrow_funds" | "send_assets" | "use_on_ramp" | "use_off_ramp"
  amount?: number
  asset?: string
  network?: string
}
```

**Response** (200 when allowed, 403 when enforced and denied):

```typescript
{
  allowed: boolean
  enforced: boolean
  mode: "disabled" | "monitor" | "enforced"
  currentKycStatus: string
  policyResult: "allow" | "deny"
  reasonCode?: string
  requiredAction?: "start_kyc" | "wait_for_review" | "contact_support"
}
```

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
2. Creates Didit session via Didit API
3. Stores `session_id` and `session_token` in `kyc_reviews` table
4. Returns `verification_url` for redirect

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
2. Maps Didit status to internal enum
3. Finds KYC record by `verificationSessionId`
4. Updates status in database
5. Returns updated status

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

1. Verifies webhook signature (HMAC)
2. Finds KYC record by `session_id` in notes
3. Maps Didit status to internal enum
4. Updates database record
5. Returns success

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
  status?: 'pending' | 'approved' | 'rejected' | 'verified'
  diditStatus?: string
  message?: string
}
```

**Flow**:

1. Validates NextAuth session
2. Retrieves most recent KYC record from database
3. Extracts `session_id` from notes
4. Queries Didit API for current status
5. Updates database with latest status
6. Returns status

**Error Handling**:

- `401`: Unauthorized
- `404`: No KYC session found
- `500`: Didit API error or database error

---

### 5. Get KYC Status

**Endpoint**: `GET /api/kyc/status`

**Description**: Fetches the current KYC status for the authenticated user.

**Response**:

```typescript
{
  status: "pending" | "approved" | "rejected" | "verified" | null;
  updatedAt: string | null;
}
```

**Flow**:

1. Validates NextAuth session
2. Queries `kyc_reviews` table for user's most recent record
3. Returns status and updated timestamp

**Error Handling**:

- `401`: Unauthorized
- `500`: Database query error

**Note**: This endpoint uses the service role client to bypass RLS, but user authentication is validated via NextAuth first.

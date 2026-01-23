# Didit KYC Integration - Architecture

## Overview

The Didit KYC integration follows a server-side and client-side architecture pattern, ensuring secure handling of verification sessions and status updates.

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ 1. User clicks "Start KYC"
       ▼
┌─────────────────────────┐
│  /api/kyc/didit/        │
│  create-session         │
│  (Next.js API Route)    │
└──────┬──────────────────┘
       │
       │ 2. Creates Didit session
       │    Stores session_id in DB
       ▼
┌─────────────────────────┐
│   Didit.me Service      │
│   (External API)        │
└──────┬──────────────────┘
       │
       │ 3. User completes verification
       │    Redirects back with status
       ▼
┌─────────────────────────┐
│  /profile?kyc=completed│
│  &status=Approved       │
│  (Server Component)     │
└──────┬──────────────────┘
       │
       │ 4. Updates database
       │    Triggers page reload
       ▼
┌─────────────────────────┐
│  /api/kyc/status        │
│  (Fetches latest status) │
└─────────────────────────┘
```

## Key Components

### 1. Server-Side Components

- **Profile Page (`/app/(routes)/profile/page.tsx`)**: Handles callback URL parameters and updates database
- **API Routes**:
  - `/api/kyc/didit/create-session`: Creates Didit verification session
  - `/api/kyc/didit/callback`: Handles status updates from callback
  - `/api/kyc/didit/webhook`: Receives webhook events from Didit
  - `/api/kyc/didit/check-status`: Checks status directly from Didit API
  - `/api/kyc/status`: Fetches current KYC status for authenticated user

### 2. Client-Side Components

- **Profile Dashboard**: Main profile page component
- **KYC Card**: Displays KYC status and initiates verification
- **KYC Redirect Modal**: Shows countdown before redirecting to Didit
- **useDiditKYC Hook**: Manages KYC state and API calls

### 3. Database Layer

- **Table**: `kyc_reviews`
- **RLS Policies**: Users can view/update their own records
- **Service Role Client**: Used for server-side operations to bypass RLS

## Data Flow

### Session Creation Flow

1. User clicks "Start KYC Process" button
2. Client calls `/api/kyc/didit/create-session`
3. Server creates Didit session via Didit API
4. Server stores `session_id` and `session_token` in `kyc_reviews` table
5. Server returns `verification_url` to client
6. Client shows redirect modal with countdown
7. User is redirected to Didit verification page

### Status Update Flow

1. User completes verification on Didit
2. Didit redirects to `/profile?kyc=completed&status=Approved&verificationSessionId=...`
3. Server-side page component:
   - Extracts status from URL params
   - Maps Didit status to internal status enum
   - Updates `kyc_reviews` table with new status
4. Client-side component:
   - Calls `/api/kyc/didit/callback` API
   - Triggers page reload to show updated status
5. After reload, `/api/kyc/status` fetches and displays current status

### Webhook Flow (Alternative)

1. Didit sends webhook event to `/api/kyc/didit/webhook`
2. Server verifies webhook signature
3. Server finds KYC record by `session_id`
4. Server updates status in database
5. Status is reflected on next page load or polling refresh

## Security Considerations

1. **Authentication**: All API routes validate NextAuth session
2. **RLS Policies**: Database queries respect Row Level Security
3. **Service Role**: Used only server-side after user validation
4. **Webhook Verification**: HMAC signature verification for webhooks
5. **JWT Claims**: `current_auth_user_id()` function extracts user ID from JWT

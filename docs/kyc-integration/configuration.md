# Didit KYC Integration - Configuration

## Environment Variables

The following environment variables are required for the Didit KYC integration:

```bash
# Didit API Configuration
DIDIT_API_KEY=your_didit_api_key
DIDIT_WEBHOOK_SECRET_KEY=your_webhook_secret_key
DIDIT_WORKFLOW_ID=your_workflow_id

# Supabase Configuration (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth Configuration (already configured)
NEXTAUTH_URL=https://kindfi.org
NEXTAUTH_SECRET=your_nextauth_secret
```

## Didit Dashboard Configuration

### Callback URL

Configure the callback URL in your Didit dashboard:

```
https://kindfi.org/profile?kyc=completed
```

### Webhook URL

Configure the webhook URL in your Didit dashboard:

```
https://kindfi.org/api/kyc/didit/webhook
```

**Important**: Ensure both URLs use your production domain (`kindfi.org`) in production.

## Database Setup

### Required Migration

The following migration must be applied to enable user-initiated KYC reviews:

```sql
-- File: services/supabase/migrations/20250120000000_allow_users_create_own_kyc_reviews.sql

-- Allow users to create their own KYC reviews
CREATE POLICY "User can create own KYC reviews"
ON public.kyc_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  public.kyc_reviews.user_id = public.current_auth_user_id()
);

-- Allow users to update their own KYC reviews
CREATE POLICY "User can update own KYC reviews"
ON public.kyc_reviews
FOR UPDATE
TO authenticated
USING (
  public.kyc_reviews.user_id = public.current_auth_user_id()
)
WITH CHECK (
  public.kyc_reviews.user_id = public.current_auth_user_id()
);
```

### Existing RLS Policies

The following policies already exist (from `20250925004426_update_rls_to_nextauth.sql`):

- **"User can view own KYC reviews"**: Allows users to SELECT their own records
- **"Whitelisted admin can view all KYC reviews"**: Admins can view all records
- **"Whitelisted admin can create KYC reviews"**: Admins can create records
- **"Whitelisted admin can update KYC reviews"**: Admins can update records

## Service Configuration

### Didit API Client

The Didit API client is configured in `/apps/web/lib/services/didit.ts`:

- **Base URL**: `https://verification.didit.me`
- **API Version**: `v3`
- **Authentication**: `x-api-key` header
- **Webhook Verification**: Supports both V2 and Simple signature methods

### Status Mapping

Didit status values are mapped to internal enum values:

| Didit Status  | Internal Status | Description               |
| ------------- | --------------- | ------------------------- |
| `Approved`    | `approved`      | Verification approved     |
| `Declined`    | `rejected`      | Verification declined     |
| `In Progress` | `pending`       | Verification in progress  |
| `In Review`   | `pending`       | Verification under review |
| `Not Started` | `pending`       | Verification not started  |
| `Abandoned`   | `pending`       | Verification abandoned    |

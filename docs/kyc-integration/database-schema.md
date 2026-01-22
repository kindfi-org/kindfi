# Didit KYC Integration - Database Schema

## Table: `kyc_reviews`

### Schema

```sql
CREATE TABLE public.kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    status kyc_status_enum NOT NULL DEFAULT 'pending',
    verification_level kyc_verification_enum NOT NULL DEFAULT 'enhanced',
    reviewer_id UUID REFERENCES next_auth.users(id) ON DELETE SET NULL DEFAULT current_auth_user_id(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Columns

| Column               | Type        | Description                                               |
| -------------------- | ----------- | --------------------------------------------------------- |
| `id`                 | UUID        | Primary key                                               |
| `user_id`            | UUID        | Foreign key to `next_auth.users.id`                       |
| `status`             | Enum        | KYC status: `pending`, `approved`, `rejected`, `verified` |
| `verification_level` | Enum        | Verification level: `basic`, `enhanced`                   |
| `reviewer_id`        | UUID        | Admin reviewer (nullable, defaults to current user)       |
| `notes`              | TEXT        | JSON string containing Didit session metadata             |
| `created_at`         | TIMESTAMPTZ | Record creation timestamp                                 |
| `updated_at`         | TIMESTAMPTZ | Last update timestamp                                     |

### Notes Field Structure

The `notes` field stores JSON data with the following structure:

```typescript
{
  diditSessionId: string
  diditSessionToken?: string
  diditStatus: string
  callbackReceived?: string  // ISO timestamp
  lastUpdated?: string       // ISO timestamp
  lastChecked?: string       // ISO timestamp
  webhookEvent?: string
  decision?: object
}
```

## Row Level Security (RLS) Policies

### SELECT Policies

1. **"User can view own KYC reviews"**

   ```sql
   CREATE POLICY "User can view own KYC reviews"
   ON public.kyc_reviews
   FOR SELECT
   TO authenticated
   USING ( public.kyc_reviews.user_id = public.current_auth_user_id() );
   ```

2. **"Whitelisted admin can view all KYC reviews"**
   ```sql
   CREATE POLICY "Whitelisted admin can view all KYC reviews"
   ON public.kyc_reviews
   FOR SELECT
   TO authenticated
   USING (
     EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w
             WHERE w.user_id = public.current_auth_user_id())
   );
   ```

### INSERT Policies

1. **"User can create own KYC reviews"**

   ```sql
   CREATE POLICY "User can create own KYC reviews"
   ON public.kyc_reviews
   FOR INSERT
   TO authenticated
   WITH CHECK (
     public.kyc_reviews.user_id = public.current_auth_user_id()
   );
   ```

2. **"Whitelisted admin can create KYC reviews"**
   ```sql
   CREATE POLICY "Whitelisted admin can create KYC reviews"
   ON public.kyc_reviews
   FOR INSERT
   TO authenticated
   WITH CHECK (
     EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w
             WHERE w.user_id = public.current_auth_user_id())
     AND public.kyc_reviews.reviewer_id = public.current_auth_user_id()
   );
   ```

### UPDATE Policies

1. **"User can update own KYC reviews"**

   ```sql
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

2. **"Whitelisted admin can update KYC reviews"**
   ```sql
   CREATE POLICY "Whitelisted admin can update KYC reviews"
   ON public.kyc_reviews
   FOR UPDATE
   TO authenticated
   USING (
     EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w
             WHERE w.user_id = public.current_auth_user_id())
   )
   WITH CHECK (
     EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w
             WHERE w.user_id = public.current_auth_user_id())
   );
   ```

## Helper Function

### `current_auth_user_id()`

Extracts the user ID from JWT claims for RLS policies:

```sql
CREATE OR REPLACE FUNCTION public.current_auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
  COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
    auth.uid()
  )
$$;
```

This function:

- Reads `sub` claim from JWT (`request.jwt.claim.sub`)
- Falls back to `auth.uid()` for Supabase Auth compatibility
- Used in all RLS policies to identify the current user

## Indexes

```sql
CREATE INDEX idx_kyc_reviews_user_id ON public.kyc_reviews(user_id);
CREATE INDEX idx_kyc_reviews_reviewer_id ON public.kyc_reviews(reviewer_id);
```

## Service Role Client Usage

For server-side operations, the service role client is used to bypass RLS:

```typescript
import { supabase as supabaseServiceRole } from "@packages/lib/supabase";

// After validating user via NextAuth:
const { data } = await supabaseServiceRole
  .from("kyc_reviews")
  .select("*")
  .eq("user_id", session.user.id);
```

**Security Note**: The service role client is only used after user authentication has been validated via NextAuth session. This ensures security while allowing server-side operations to update records.

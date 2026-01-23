-- Migration: Allow users to create and update their own KYC reviews
-- Purpose: Enable Didit KYC integration where users can initiate their own verification sessions
-- Date: 2025-01-20

-- Allow users to create their own KYC reviews (for Didit integration)
-- This policy allows authenticated users to insert KYC reviews where they are the user_id
CREATE POLICY "User can create own KYC reviews"
ON public.kyc_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  public.kyc_reviews.user_id = public.current_auth_user_id()
);

-- Allow users to update their own KYC reviews (for status updates from webhooks/API)
-- This allows the check-status endpoint and webhooks to update the user's own KYC record
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

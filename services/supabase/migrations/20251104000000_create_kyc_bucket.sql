-- Create the KYC bucket for storing user verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc',
  'kyc',
  false, -- Private bucket, not publicly accessible
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEMPORARY OPEN POLICIES FOR TESTING PHASE
-- TODO: Remove or restrict these policies when kyc_admin_whitelist is complete
-- ============================================================================

-- TEMPORARY: Allow service role full access (for admin operations and testing)
CREATE POLICY "Service role can manage all KYC documents"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'kyc')
WITH CHECK (bucket_id = 'kyc');

-- TEMPORARY: Allow authenticated users to view all KYC documents (for testing)
-- TODO: Replace with kyc_admin_whitelist policy after implementation
CREATE POLICY "Temporary: Authenticated users can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'kyc');

-- TEMPORARY: Allow authenticated users to manage all KYC documents (for testing)
-- TODO: Restrict to user's own documents after testing phase
CREATE POLICY "Temporary: Authenticated users can manage all KYC documents"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'kyc')
WITH CHECK (bucket_id = 'kyc');

-- ============================================================================
-- FUTURE PRODUCTION POLICIES (currently commented out)
-- Uncomment these and remove temporary policies after testing phase
-- ============================================================================

-- Policy: Users can upload their own KYC documents
-- CREATE POLICY "Users can upload their own KYC documents"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'kyc'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can view their own KYC documents
-- CREATE POLICY "Users can view their own KYC documents"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'kyc'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can update their own KYC documents
-- CREATE POLICY "Users can update their own KYC documents"
-- ON storage.objects
-- FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'kyc'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- )
-- WITH CHECK (
--   bucket_id = 'kyc'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can delete their own KYC documents
-- CREATE POLICY "Users can delete their own KYC documents"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'kyc'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: KYC Admins (whitelisted users) can view all KYC documents
-- CREATE POLICY "KYC admins can view all KYC documents"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'kyc'
--   AND EXISTS (
--     SELECT 1
--     FROM kyc_admin_whitelist
--     WHERE kyc_admin_whitelist.user_id = auth.uid()
--   )
-- );

-- Comment on the bucket



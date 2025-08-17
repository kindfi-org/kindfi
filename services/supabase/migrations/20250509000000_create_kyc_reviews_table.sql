DO $$ BEGIN
    -- Recreate or ensure the 'kyc_status_enum' type exists as required for the 'status' column.
    CREATE TYPE kyc_status_enum AS ENUM ('pending', 'approved', 'rejected', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- Recreate or ensure the 'kyc_verification_enum' type exists as required for the 'verification_level' column.
    CREATE TYPE kyc_verification_enum AS ENUM ('basic', 'enhanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the old tables to avoid conflicts if they already exist.
DROP TABLE IF EXISTS kyc_reviews, kyc_status CASCADE;

CREATE TABLE IF NOT EXISTS kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status kyc_status_enum NOT NULL,
    verification_level kyc_verification_enum NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_user_id ON kyc_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_reviewer_id ON kyc_reviews(reviewer_id);

--------------------------------------------------------------------------------
Row-Level Security (RLS) Policies



ALTER TABLE kyc_reviews ENABLE ROW LEVEL SECURITY;

-- Allow admins to create new KYC reviews.
CREATE POLICY "Admins can create KYC reviews"
    ON kyc_reviews FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to view all KYC reviews.
CREATE POLICY "Admins can view all KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update any KYC review.
CREATE POLICY "Admins can update KYC reviews"
    ON kyc_reviews FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Allow users to view their own KYC reviews.
CREATE POLICY "Users can view their own KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (auth.uid() = user_id);



CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kyc_reviews_updated_at
    BEFORE UPDATE ON kyc_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('pending', 'approved', 'rejected', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_verification_enum AS ENUM ('basic', 'enhanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS kyc_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status kyc_status_enum NOT NULL DEFAULT 'pending',
    verification_level kyc_verification_enum NOT NULL DEFAULT 'basic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_status_id UUID NOT NULL REFERENCES kyc_status(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    decision kyc_status_enum NOT NULL,
    reason TEXT,
    additional_notes TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(kyc_status_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_kyc_status_user_id ON kyc_status(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_kyc_status_id ON kyc_reviews(kyc_status_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_reviewer_id ON kyc_reviews(reviewer_id);

ALTER TABLE kyc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC status"
    ON kyc_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC statuses"
    ON kyc_status FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update KYC statuses"
    ON kyc_status FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kyc_status
            WHERE kyc_status.id = kyc_reviews.kyc_status_id
            AND kyc_status.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can create KYC reviews"
    ON kyc_reviews FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update KYC reviews"
    ON kyc_reviews FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kyc_status_updated_at
    BEFORE UPDATE ON kyc_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_reviews_updated_at
    BEFORE UPDATE ON kyc_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
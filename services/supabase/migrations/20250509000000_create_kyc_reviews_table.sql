
DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('pending', 'approved', 'rejected');
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
    user_id TEXT NOT NULL,
    status kyc_status_enum NOT NULL DEFAULT 'pending',
    verification_level kyc_verification_enum NOT NULL DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_status_id UUID NOT NULL REFERENCES kyc_status(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    decision kyc_status_enum NOT NULL,
    reason TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_status_user_id ON kyc_status(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_kyc_status_id ON kyc_reviews(kyc_status_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_reviewer_id ON kyc_reviews(reviewer_id);

ALTER TABLE kyc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC status"
    ON kyc_status FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all KYC statuses"
    ON kyc_status FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kyc_status
            WHERE kyc_status.id = kyc_reviews.kyc_status_id
            AND kyc_status.user_id = auth.uid()::text
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
    NEW.updated_at = CURRENT_TIMESTAMP;
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
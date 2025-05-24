-- Create enum types for KYC reviews
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'verified');
CREATE TYPE verification_level AS ENUM ('basic', 'enhanced');

-- Create kyc_reviews table
CREATE TABLE kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    status kyc_status NOT NULL DEFAULT 'pending',
    verification_level verification_level NOT NULL DEFAULT 'basic',
    reviewer_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Add foreign key constraints for user_id and reviewer_id
    CONSTRAINT fk_kyc_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_kyc_reviews_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_kyc_reviews_user_id ON kyc_reviews(user_id);
CREATE INDEX idx_kyc_reviews_status ON kyc_reviews(status);
CREATE INDEX idx_kyc_reviews_reviewer_id ON kyc_reviews(reviewer_id);
CREATE INDEX idx_kyc_reviews_created_at ON kyc_reviews(created_at);

-- Create updated_at trigger
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

-- Add comments for documentation
COMMENT ON TABLE kyc_reviews IS 'Tracks KYC verification decisions and audit trail';
COMMENT ON COLUMN kyc_reviews.user_id IS 'Reference to the user being verified';
COMMENT ON COLUMN kyc_reviews.status IS 'The KYC status decision (pending, approved, rejected, verified)';
COMMENT ON COLUMN kyc_reviews.verification_level IS 'Level of verification (basic, enhanced)';
COMMENT ON COLUMN kyc_reviews.reviewer_id IS 'ID of the reviewer who made the decision';
COMMENT ON COLUMN kyc_reviews.notes IS 'Any notes or comments regarding the decision';
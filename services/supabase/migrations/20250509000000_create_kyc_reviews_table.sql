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
DROP TABLE IF EXISTS kyc_reviews, kyc_status, kyc_admin_whitelist CASCADE;

-- Create the admin whitelist table first
CREATE TABLE IF NOT EXISTS kyc_admin_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS kyc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status kyc_status_enum NOT NULL,
    verification_level kyc_verification_enum NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_user_id ON kyc_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_reviews_reviewer_id ON kyc_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_admin_whitelist_user_id ON kyc_admin_whitelist(user_id);

--------------------------------------------------------------------------------
-- Row-Level Security (RLS) Policies

-- Enable RLS on both tables
ALTER TABLE kyc_reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE kyc_admin_whitelist FORCE ROW LEVEL SECURITY;

-- Whitelist table policies
CREATE POLICY "Allow reading admin whitelist" 
    ON kyc_admin_whitelist FOR SELECT 
    USING (true);


CREATE POLICY "Whitelisted admins can manage whitelist"
    ON kyc_admin_whitelist FOR ALL
    USING (EXISTS (SELECT 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid()));

-- KYC Reviews policies using whitelist
CREATE POLICY "Whitelisted users can create KYC reviews"
    ON kyc_reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyc_admin_whitelist 
            WHERE user_id = auth.uid()
        )
        AND reviewer_id = auth.uid()
    );

CREATE POLICY "Whitelisted users can view all KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kyc_admin_whitelist 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Whitelisted users can update KYC reviews"
    ON kyc_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM kyc_admin_whitelist 
            WHERE user_id = auth.uid()
        )
    );

-- Allow users to view their own KYC reviews
CREATE POLICY "Users can view their own KYC reviews"
    ON kyc_reviews FOR SELECT
    USING (auth.uid() = user_id);

-- Helper functions for managing the whitelist
CREATE OR REPLACE FUNCTION add_kyc_admin(target_user_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    PERFORM 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
    END IF;

    INSERT INTO kyc_admin_whitelist (user_id, created_by, notes)
    VALUES (target_user_id, auth.uid(), admin_notes)
    ON CONFLICT (user_id) DO UPDATE SET
        notes = EXCLUDED.notes,
        created_by = auth.uid(),
        created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION remove_kyc_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
    END IF;

    DELETE FROM kyc_admin_whitelist WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_kyc_admin TO authenticated;
GRANT EXECUTE ON FUNCTION remove_kyc_admin TO authenticated;

-- Trigger function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_kyc_reviews_updated_at
    BEFORE UPDATE ON kyc_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

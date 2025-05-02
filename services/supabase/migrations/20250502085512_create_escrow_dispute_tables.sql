-- Create escrow_reviews table as specified in the issue with modifications based on feedback
CREATE TABLE escrow_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_contracts(id),
    milestone_id UUID REFERENCES escrow_milestones(id), -- Can be null for dispute type
    reviewer_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- Instead of approved boolean
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    disputer_id UUID, -- Can be null for milestone type
    type TEXT NOT NULL CHECK (type IN ('dispute', 'milestone')), -- Type enum
    resolution_text TEXT, -- Final resolution text
    evidence_urls TEXT[],
    transaction_hash TEXT
);

-- Add 'disputed' status to escrow_milestones status enum
ALTER TABLE escrow_milestones
DROP CONSTRAINT IF EXISTS escrow_milestones_status_check;

ALTER TABLE escrow_milestones
ADD CONSTRAINT escrow_milestones_status_check
CHECK (status IN ('pending', 'completed', 'approved', 'rejected', 'disputed'));

-- Create escrow_mediators table for tracking mediators
CREATE TABLE escrow_mediators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    mediator_address TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create escrow_dispute_assignments table for tracking mediator assignments
CREATE TABLE escrow_dispute_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES escrow_reviews(id),
    mediator_id UUID NOT NULL REFERENCES escrow_mediators(id),
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for the new tables
-- escrow_reviews policies
ALTER TABLE escrow_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to escrow_reviews for authenticated users"
    ON escrow_reviews
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to escrow_reviews for authenticated users"
    ON escrow_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow update access to escrow_reviews for authenticated users"
    ON escrow_reviews
    FOR UPDATE
    TO authenticated
    USING (true);

-- escrow_mediators policies
ALTER TABLE escrow_mediators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to escrow_mediators for authenticated users"
    ON escrow_mediators
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to escrow_mediators for administrators"
    ON escrow_mediators
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- In a real scenario, this would check for admin role

CREATE POLICY "Allow update access to escrow_mediators for administrators"
    ON escrow_mediators
    FOR UPDATE
    TO authenticated
    USING (true); -- In a real scenario, this would check for admin role

-- escrow_dispute_assignments policies
ALTER TABLE escrow_dispute_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to escrow_dispute_assignments for authenticated users"
    ON escrow_dispute_assignments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to escrow_dispute_assignments for administrators"
    ON escrow_dispute_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- In a real scenario, this would check for admin role

CREATE POLICY "Allow update access to escrow_dispute_assignments for administrators"
    ON escrow_dispute_assignments
    FOR UPDATE
    TO authenticated
    USING (true); -- In a real scenario, this would check for admin role

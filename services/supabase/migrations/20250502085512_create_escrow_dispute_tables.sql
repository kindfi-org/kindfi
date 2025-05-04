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

-- Add indexes for frequently queried columns
CREATE INDEX escrow_reviews_escrow_id_idx ON escrow_reviews(escrow_id);
CREATE INDEX escrow_reviews_milestone_id_idx ON escrow_reviews(milestone_id);
CREATE INDEX escrow_reviews_type_idx ON escrow_reviews(type);

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

-- Add unique constraint for mediator_address
ALTER TABLE escrow_mediators ADD CONSTRAINT escrow_mediators_mediator_address_key UNIQUE (mediator_address);

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

CREATE POLICY "Allow read access to escrow_reviews for participants and mediators"
    ON escrow_reviews
    FOR SELECT
    TO authenticated
    USING (
        -- Only allow reads if the user is a participant in the escrow contract or an assigned mediator
        EXISTS (
            SELECT 1 FROM escrow_contracts ec
            WHERE ec.id = escrow_id
            AND (
                ec.approver_id = auth.uid() OR
                ec.service_provider_id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM escrow_dispute_assignments eda
            JOIN escrow_mediators em ON eda.mediator_id = em.id
            WHERE eda.review_id = id
            AND em.user_id = auth.uid()
        ) OR
        -- Allow administrators to read all disputes
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Allow insert access to escrow_reviews for contract participants"
    ON escrow_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Only allow inserts if the user is a participant in the escrow contract
        EXISTS (
            SELECT 1 FROM escrow_contracts ec
            WHERE ec.id = escrow_id
            AND (
                ec.approver_id = auth.uid() OR
                ec.service_provider_id = auth.uid()
            )
        )
    );

CREATE POLICY "Allow update access to escrow_reviews for participants and mediators"
    ON escrow_reviews
    FOR UPDATE
    TO authenticated
    USING (
        -- Allow updates if the user is a participant in the escrow contract or an assigned mediator
        EXISTS (
            SELECT 1 FROM escrow_contracts ec
            WHERE ec.id = escrow_id
            AND (
                ec.approver_id = auth.uid() OR
                ec.service_provider_id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM escrow_dispute_assignments eda
            WHERE eda.review_id = id
            AND eda.mediator_id = auth.uid()
        )
    );

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
    WITH CHECK (
        -- Only allow administrators to insert mediators
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Allow update access to escrow_mediators for administrators"
    ON escrow_mediators
    FOR UPDATE
    TO authenticated
    USING (
        -- Only allow administrators to update mediators
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

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
    WITH CHECK (
        -- Only allow administrators to assign mediators to disputes
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Allow update access to escrow_dispute_assignments for administrators"
    ON escrow_dispute_assignments
    FOR UPDATE
    TO authenticated
    USING (
        -- Only allow administrators to update mediator assignments
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

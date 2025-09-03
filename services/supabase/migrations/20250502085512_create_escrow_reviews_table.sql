-- Create escrow_reviews table as specified in the issue with modifications based on feedback
CREATE TABLE escrow_reviews (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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

-- Create RLS policies for the new tables
-- escrow_reviews policies
ALTER TABLE escrow_reviews ENABLE ROW LEVEL SECURITY;

-- TODO: Uncomment and adjust the policies as per requirements. Such fields doesn't exist in the current schema.
-- CREATE POLICY "Allow read access to escrow_reviews for participants and mediators"
--     ON escrow_reviews
--     FOR SELECT
--     TO authenticated
--     USING (
--         -- Only allow reads if the user is a participant in the escrow contract or an assigned mediator
--         EXISTS (
--             SELECT 1 FROM escrow_contracts ec
--             WHERE ec.id = escrow_id
--             AND (
--                 ec.approver_id = auth.uid() OR
--                 ec.service_provider_id = auth.uid()
--             )
--         ) OR
--         -- Allow administrators to read all disputes
--         EXISTS (
--             SELECT 1 FROM user_roles ur
--             WHERE ur.user_id = auth.uid()
--             AND ur.role = 'admin'
--         )
--     );

-- CREATE POLICY "Allow insert access to escrow_reviews for contract participants"
--     ON escrow_reviews
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (
--         -- Only allow inserts if the user is a participant in the escrow contract
--         EXISTS (
--             SELECT 1 FROM escrow_contracts ec
--             WHERE ec.id = escrow_id
--             AND (
--                 ec.approver_id = auth.uid() OR
--                 ec.service_provider_id = auth.uid()
--             )
--         )
--     );

-- CREATE POLICY "Allow update access to escrow_reviews for participants and mediators"
--     ON escrow_reviews
--     FOR UPDATE
--     TO authenticated
--     USING (
--         -- Allow updates if the user is a participant in the escrow contract or an assigned mediator
--         EXISTS (
--             SELECT 1 FROM escrow_contracts ec
--             WHERE ec.id = escrow_id
--             AND (
--                 ec.approver_id = auth.uid() OR
--                 ec.service_provider_id = auth.uid()
--             )
--         )
--     );


-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create escrow disputes table
CREATE TABLE IF NOT EXISTS escrow_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_contracts(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
    reason TEXT NOT NULL,
    initiator TEXT NOT NULL,
    mediator TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create escrow dispute evidence table
CREATE TABLE IF NOT EXISTS escrow_dispute_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_dispute_id UUID NOT NULL REFERENCES escrow_disputes(id),
    evidence_url TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_escrow_id ON escrow_disputes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_status ON escrow_disputes(status);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_initiator ON escrow_disputes(initiator);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_mediator ON escrow_disputes(mediator);
CREATE INDEX IF NOT EXISTS idx_escrow_dispute_evidences_dispute_id ON escrow_dispute_evidences(escrow_dispute_id);

-- Create trigger for automatically updating updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON escrow_disputes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for escrow_disputes table
ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view disputes" ON escrow_disputes
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create disputes" ON escrow_disputes
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow initiator and mediator to update disputes" ON escrow_disputes
    FOR UPDATE
    USING (
        auth.uid()::text = initiator OR 
        auth.uid()::text = mediator
    );

-- Add RLS policies for escrow_dispute_evidences table
ALTER TABLE escrow_dispute_evidences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view evidences" ON escrow_dispute_evidences
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to add evidences" ON escrow_dispute_evidences
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add dispute_flag column to escrow_contracts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'escrow_contracts' AND column_name = 'dispute_flag'
    ) THEN
        ALTER TABLE escrow_contracts ADD COLUMN dispute_flag BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

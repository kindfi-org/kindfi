-- Create the enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE escrow_status_type AS ENUM (
        'NEW',
        'FUNDED',
        'ACTIVE',
        'COMPLETED',
        'DISPUTED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the table if it exists and recreate it
DROP TABLE IF EXISTS escrow_status;

-- Create the escrow status table
CREATE TABLE escrow_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id TEXT NOT NULL,
    status escrow_status_type NOT NULL,
    current_milestone INTEGER,
    total_funded NUMERIC(20,7),
    total_released NUMERIC(20,7),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_amounts CHECK (total_funded >= total_released)
);

-- Create indexes for better performance
CREATE INDEX idx_escrow_status_escrow_id ON escrow_status(escrow_id);
CREATE INDEX idx_escrow_status_status ON escrow_status(status);
CREATE INDEX idx_escrow_status_last_updated ON escrow_status(last_updated);
CREATE INDEX idx_escrow_status_composite ON escrow_status(escrow_id, status, last_updated);

-- Grant necessary permissions
GRANT ALL ON TABLE escrow_status TO authenticated;
GRANT ALL ON TABLE escrow_status TO service_role;
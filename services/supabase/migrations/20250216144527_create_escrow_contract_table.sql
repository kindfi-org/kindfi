

CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    contributor_id UUID NOT NULL,
    amount NUMERIC(20,7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS escrow_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id TEXT UNIQUE NOT NULL,
    contract_id TEXT UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    contribution_id UUID NOT NULL REFERENCES contributions(id),
    payer_address TEXT NOT NULL,
    receiver_address TEXT NOT NULL,
    amount NUMERIC(20,7) NOT NULL,
    current_state escrow_status_type NOT NULL DEFAULT 'NEW',
    platform_fee NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_escrow_amount CHECK (amount > 0),
    CONSTRAINT valid_platform_fee CHECK (platform_fee >= 0)
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: allow read access to all
CREATE POLICY public_select_escrow_contracts
    ON escrow_contracts
    FOR SELECT
    USING (true);
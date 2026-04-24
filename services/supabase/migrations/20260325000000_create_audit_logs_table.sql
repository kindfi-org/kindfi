-- Create audit_logs table for structured audit logging of escrow and NFT operations
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    actor_id TEXT,
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_code TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS audit_logs_correlation_id_idx ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS audit_logs_operation_idx ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_id_idx ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_status_idx ON audit_logs(status);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for server-side inserts)
CREATE POLICY "Service role has full access to audit_logs"
    ON audit_logs FOR ALL
    USING (auth.role() = 'service_role');

-- Authenticated users can read audit logs
CREATE POLICY "Authenticated users can read audit_logs"
    ON audit_logs FOR SELECT
    USING (auth.role() = 'authenticated');

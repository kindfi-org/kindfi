-- Audit trail for notification delivery and service operations (server-side only)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    level TEXT NOT NULL CHECK (level IN ('error', 'info', 'warning')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_logs_notification_id_idx
    ON notification_logs(notification_id);

CREATE INDEX IF NOT EXISTS notification_logs_level_idx
    ON notification_logs(level);

CREATE INDEX IF NOT EXISTS notification_logs_created_at_idx
    ON notification_logs(created_at);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to notification_logs"
    ON notification_logs FOR ALL
    USING (auth.role() = 'service_role');

GRANT ALL ON notification_logs TO service_role;

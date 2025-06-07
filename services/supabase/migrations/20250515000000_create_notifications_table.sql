-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'project_update',
        'project_comment',
        'project_investment',
        'project_milestone',
        'escrow_update',
        'escrow_dispute',
        'kyc_status',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification priority enum
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification delivery status enum
DO $$ BEGIN
    CREATE TYPE notification_delivery_status AS ENUM (
        'pending',
        'sent',
        'delivered',
        'failed',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notifications table with all features
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    metadata_hash TEXT,
    delivery_status notification_delivery_status NOT NULL DEFAULT 'pending',
    delivery_attempts INTEGER NOT NULL DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    push_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('error', 'info')),
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX idx_notifications_metadata ON notifications USING gin(metadata);
CREATE INDEX idx_notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX idx_notifications_next_retry_at ON notifications(next_retry_at);
CREATE INDEX idx_notifications_user_unread_recent ON notifications(user_id, is_read, created_at DESC);

-- Create indexes for notification logs
CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notification_logs_level ON notification_logs(level);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for notification logs
CREATE POLICY "Users can view logs for their notifications"
    ON notification_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM notifications
            WHERE notifications.id = notification_logs.notification_id
            AND notifications.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- Create function to calculate HMAC hash
CREATE OR REPLACE FUNCTION calculate_metadata_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Use a secure key from environment variables
    NEW.metadata_hash := encode(
        hmac(
            NEW.metadata::text::bytea,
            current_setting('app.settings.metadata_hmac_key')::bytea,
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for metadata hash
CREATE TRIGGER set_metadata_hash
    BEFORE INSERT OR UPDATE OF metadata ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION calculate_metadata_hash();

-- Create function to handle retry logic
CREATE OR REPLACE FUNCTION handle_notification_retry()
RETURNS TRIGGER AS $$
DECLARE
    backoff_seconds INTEGER;
BEGIN
    -- Calculate exponential backoff (2^attempts * 60 seconds, max 24 hours)
    backoff_seconds := LEAST((POWER(2, NEW.delivery_attempts) * 60)::INTEGER, 86400);
    
    -- Set next retry time
    NEW.next_retry_at := NOW() + (backoff_seconds || ' seconds')::interval;
    
    -- Update delivery status
    IF NEW.delivery_attempts >= 5 THEN
        NEW.delivery_status := 'failed';
    ELSE
        NEW.delivery_status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for retry handling
CREATE TRIGGER handle_notification_retry
    AFTER UPDATE OF delivery_status ON notifications
    FOR EACH ROW
    WHEN (NEW.delivery_status = 'failed' AND OLD.delivery_status != 'failed')
    EXECUTE FUNCTION handle_notification_retry();

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete notifications older than 30 days
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND (
        delivery_status IN ('delivered', 'failed', 'expired')
        OR (delivery_status = 'pending' AND next_retry_at < NOW() - INTERVAL '7 days')
    );
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'cleanup-old-notifications',
    '0 0 * * *', -- Run at midnight every day
    $$SELECT cleanup_old_notifications()$$
);

-- Grant appropriate permissions
GRANT SELECT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;
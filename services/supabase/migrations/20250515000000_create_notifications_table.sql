-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
    'info',
    'success',
    'warning',
    'error'
);

-- Create notification priority enum
CREATE TYPE notification_priority AS ENUM (
    'low',
    'medium',
    'high'
);

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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium' NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    metadata_hash TEXT,
    delivery_status notification_delivery_status NOT NULL DEFAULT 'pending',
    delivery_attempts INTEGER NOT NULL DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    push_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ,
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    metadata JSONB
);

-- Create indexes for better query performance
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);
CREATE INDEX notification_logs_notification_id_idx ON notification_logs(notification_id);
CREATE INDEX notification_logs_user_id_idx ON notification_logs(user_id);
CREATE INDEX notifications_priority ON notifications(priority);
CREATE INDEX notifications_read_at ON notifications(read_at);
CREATE INDEX notifications_action_url ON notifications(action_url);
CREATE INDEX notifications_metadata ON notifications USING gin(metadata);
CREATE INDEX notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX notifications_next_retry_at ON notifications(next_retry_at);
CREATE INDEX notifications_user_unread_recent ON notifications(user_id, is_read, created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification logs"
    ON notification_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification logs"
    ON notification_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

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

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;
GRANT INSERT ON notification_logs TO authenticated;
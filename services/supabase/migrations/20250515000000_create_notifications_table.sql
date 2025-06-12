-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'info',
            'success',
            'warning',
            'error'
        );
    END IF;
END$$;

-- Create notification priority enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
        CREATE TYPE notification_priority AS ENUM (
            'low',
            'medium',
            'high',
            'urgent'
        );
    END IF;
END$$;

-- Create notification delivery status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_delivery_status') THEN
        CREATE TYPE notification_delivery_status AS ENUM (
            'pending',
            'delivered',
            'failed'
        );
    END IF;
END$$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    priority notification_priority NOT NULL DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    delivery_status notification_delivery_status DEFAULT 'pending',
    delivery_attempts INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email BOOLEAN DEFAULT true,
    push BOOLEAN DEFAULT true,
    in_app BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);

-- Create RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
    BEFORE UPDATE OF delivery_status ON notifications
    FOR EACH ROW
    WHEN (NEW.delivery_status = 'failed' AND OLD.delivery_status != 'failed')
    EXECUTE FUNCTION handle_notification_retry();

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- Remove metadata hash function and trigger since they're not being used
DROP TRIGGER IF EXISTS set_metadata_hash ON notifications;
DROP FUNCTION IF EXISTS calculate_metadata_hash();
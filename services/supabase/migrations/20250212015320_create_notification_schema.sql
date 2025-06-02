-- Create notification type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'project_update',
            'milestone_completed',
            'escrow_released',
            'kyc_status_change',
            'comment_added',
            'member_joined',
            'system_alert'
        );
    END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    "from" UUID REFERENCES auth.users(id),
    "to" UUID NOT NULL REFERENCES auth.users(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_to ON public.notifications("to");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON public.notifications("to", read_at) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = "to");

CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = "to")
    WITH CHECK (auth.uid() = "to");

-- Create function to hash metadata
CREATE OR REPLACE FUNCTION public.hash_notification_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Hash the metadata using HMAC-SHA256
    NEW.metadata = jsonb_build_object(
        'hashed_data',
        encode(hmac(
            NEW.metadata::text,
            current_setting('app.settings.jwt_secret', true),
            'sha256'
        ), 'hex')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for metadata hashing
CREATE TRIGGER hash_notification_metadata_trigger
    BEFORE INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.hash_notification_metadata();

-- Create function to handle notification creation with retry logic
CREATE OR REPLACE FUNCTION public.create_notification(
    p_type notification_type,
    p_message TEXT,
    p_from UUID,
    p_to UUID,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
    v_retry_count INTEGER := 0;
    v_max_retries INTEGER := 3;
BEGIN
    WHILE v_retry_count < v_max_retries LOOP
        BEGIN
            INSERT INTO public.notifications (
                type,
                message,
                "from",
                "to",
                metadata
            ) VALUES (
                p_type,
                p_message,
                p_from,
                p_to,
                p_metadata
            )
            RETURNING id INTO v_notification_id;
            
            -- If successful, return the notification ID
            RETURN v_notification_id;
        EXCEPTION WHEN OTHERS THEN
            v_retry_count := v_retry_count + 1;
            IF v_retry_count = v_max_retries THEN
                RAISE EXCEPTION 'Failed to create notification after % retries: %', v_max_retries, SQLERRM;
            END IF;
            -- Wait for a short time before retrying
            PERFORM pg_sleep(0.1 * v_retry_count);
        END;
    END LOOP;
    
    RETURN NULL;
END;
$$;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(
    p_notification_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read_at = now()
    WHERE id = ANY(p_notification_ids)
    AND "to" = auth.uid();
END;
$$;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notifications_as_read TO authenticated;

COMMENT ON TABLE public.notifications IS 'Stores user notifications with secure metadata handling and delivery guarantees'; 
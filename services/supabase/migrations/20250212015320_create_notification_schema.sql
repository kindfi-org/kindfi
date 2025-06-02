-- Create notification type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM (
            'project_update',
            'milestone_completed',
            'escrow_released',
            'kyc_status_change',
            'comment_added',
            'member_joined',
            'system_alert'
        );
    END IF;
END
$$;

-- Create notification status enum
CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'delivered',
    'failed'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "from" uuid REFERENCES auth.users(id),
    "to" uuid NOT NULL REFERENCES auth.users(id),
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp with time zone,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = "to");

-- Add update trigger for updated_at
CREATE TRIGGER update_notifications_modtime
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Grant access to authenticated users
GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT INSERT ON TABLE public.notifications TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated; 
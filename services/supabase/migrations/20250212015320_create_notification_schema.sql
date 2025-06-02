-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
    'project_update',
    'milestone_completed',
    'escrow_released',
    'kyc_status_change',
    'comment_added',
    'member_joined',
    'system_alert'
);

-- Create notification status enum
CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'delivered',
    'failed'
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Add update trigger for updated_at
CREATE TRIGGER update_notifications_modtime
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Grant access to authenticated users
GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT INSERT ON TABLE public.notifications TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated; 
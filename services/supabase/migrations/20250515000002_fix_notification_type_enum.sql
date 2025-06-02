-- Create notification_type enum if it doesn't exist
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
END
$$;

-- Temporarily disable the check constraint
ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS valid_notification_type;

-- Convert existing text values to the enum type
ALTER TABLE public.notifications 
    ALTER COLUMN type TYPE notification_type 
    USING type::notification_type;

-- Add a new check constraint using the enum type
ALTER TABLE public.notifications 
    ADD CONSTRAINT valid_notification_type 
    CHECK (type::text = ANY (
        ARRAY[
            'project_update',
            'milestone_completed',
            'escrow_released',
            'kyc_status_change',
            'comment_added',
            'member_joined',
            'system_alert'
        ]::text[]
    )); 
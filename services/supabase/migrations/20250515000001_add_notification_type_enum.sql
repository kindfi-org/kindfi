-- Create notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'project_update',
        'milestone_completed',
        'escrow_released',
        'kyc_status_change',
        'comment_added',
        'member_joined',
        'system_alert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Convert type column to use enum
ALTER TABLE public.notifications 
    ALTER COLUMN type TYPE notification_type 
    USING type::notification_type;

-- Drop the old check constraint as it's no longer needed
ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS valid_notification_type; 
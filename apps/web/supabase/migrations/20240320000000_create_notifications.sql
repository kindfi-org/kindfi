-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'PROJECT_UPDATE',
  'MILESTONE_COMPLETED',
  'ESCROW_RELEASED',
  'KYC_STATUS_CHANGE',
  'COMMENT_ADDED',
  'MEMBER_JOINED',
  'SYSTEM_ALERT'
);

-- Create notification status enum
CREATE TYPE public.notification_status AS ENUM (
  'pending',
  'delivered',
  'failed',
  'read'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  delivery_status notification_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  CHECK (retry_count >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id
  ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status
  ON public.notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON public.notifications(recipient_id, read_at)
  WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status_created
  ON public.notifications(recipient_id, delivery_status, created_at DESC);

-- Optional index to optimize queue consumption:
CREATE INDEX IF NOT EXISTS idx_notifications_status_created_at
  ON public.notifications(delivery_status, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_pending_queue
  ON public.notifications(delivery_status, created_at)
  WHERE delivery_status = 'pending';

-- Create metadata hash trigger function
-- This function automatically generates a SHA-256 hash of the metadata field
-- for data integrity verification. The hash is generated on INSERT
-- and whenever metadata is updated.
CREATE OR REPLACE FUNCTION public.generate_metadata_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.metadata_hash = encode(digest(NEW.metadata::text, 'sha256'), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for metadata hash
CREATE TRIGGER set_metadata_hash
  BEFORE INSERT OR UPDATE OF metadata
  ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_metadata_hash();

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(p_notification_ids UUID[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Validate array size
  IF array_length(p_notification_ids, 1) > 100 THEN
    RAISE EXCEPTION 'Too many notification IDs provided. Maximum is 100.';
  END IF;

  -- Update notifications and get count
  WITH updated AS (
    UPDATE public.notifications
    SET read_at = now()
    WHERE id = ANY(p_notification_ids)
      AND recipient_id = auth.uid()
    RETURNING 1
  )
  SELECT count(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_notifications_as_read(UUID[])
  TO authenticated, anon;

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < now() - interval '90 days'
    AND read_at IS NOT NULL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'cleanup_old_notifications removed % notifications', deleted_count;
END;
$$;

-- Schedule cleanup job to run daily at 3 AM
-- First, unschedule any existing job with the same name
SELECT cron.unschedule('cleanup_old_notifications');
-- Then schedule the new job
SELECT cron.schedule('cleanup_old_notifications', '0 3 * * *', 'SELECT public.cleanup_old_notifications();'); 
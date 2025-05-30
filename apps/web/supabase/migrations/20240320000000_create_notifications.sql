-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'system',
  'transaction',
  'security',
  'account',
  'market',
  'kyc',
  'support'
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
  "from" UUID,
  "to" UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  delivery_status notification_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_to ON public.notifications("to");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON public.notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_to_unread ON public.notifications("to", read_at) WHERE read_at IS NULL;

-- Create metadata hash trigger function
CREATE OR REPLACE FUNCTION public.generate_metadata_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.metadata_hash = encode(digest(NEW.metadata::text, 'sha256'), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create metadata hash trigger
CREATE TRIGGER generate_metadata_hash_trigger
  BEFORE INSERT OR UPDATE OF metadata ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_metadata_hash();

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING ("to" = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING ("to" = auth.uid());

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < now() - interval '90 days'
  AND read_at IS NOT NULL;
END;
$$;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(p_notification_ids UUID[])
RETURNS void
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
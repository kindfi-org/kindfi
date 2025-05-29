-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_to_idx ON public.notifications ("to");
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON public.notifications (read_at);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications (type);
CREATE INDEX IF NOT EXISTS notifications_delivery_status_idx ON public.notifications (delivery_status);

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

-- Set up RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING ("to" = auth.uid());

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications
  FOR UPDATE
  USING ("to" = auth.uid())
  WITH CHECK ("to" = auth.uid());

-- Create function to clean up old notifications
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
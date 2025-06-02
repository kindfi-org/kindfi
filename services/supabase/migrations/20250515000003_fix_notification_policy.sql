-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Recreate the policy
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = "to"); 
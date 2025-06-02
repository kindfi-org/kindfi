-- Drop the specific policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Drop any other variations of the policy name that might exist
DROP POLICY IF EXISTS "users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users_can_view_their_own_notifications" ON public.notifications;

-- Recreate the policy
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = "to"); 
-- Drop all existing notification policies
DO $$ 
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', policy_name);
    END LOOP;
END $$;

-- Recreate the policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = "to");

CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = "to")
    WITH CHECK (auth.uid() = "to"); 
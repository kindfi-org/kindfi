BEGIN;

-- 1. Create the project_updates table
CREATE TABLE public.project_updates (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id     UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  content        TEXT,
  creator_id     UUID NOT NULL REFERENCES public.kindlers(id) ON DELETE CASCADE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the join table for Many-to-Many notifications (project_updates ↔ kindlers)
CREATE TABLE public.project_update_notifications (
  update_id  UUID NOT NULL REFERENCES public.project_updates(id) ON DELETE CASCADE,
  kindler_id UUID NOT NULL REFERENCES public.kindlers(id) ON DELETE CASCADE,
  PRIMARY KEY (update_id, kindler_id)
);

-- 3. Create indexes to optimize query performance
CREATE INDEX idx_project_updates_project_id ON public.project_updates (project_id);
CREATE INDEX idx_project_updates_creator_id ON public.project_updates (creator_id);
CREATE INDEX idx_project_update_notifications_kindler_id ON public.project_update_notifications (kindler_id);

-- 4. Enable Row-Level Security (RLS) on project_updates
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies
-- SELECT Policy: Only the creator or an admin can see the update
CREATE POLICY select_project_updates ON public.project_updates
FOR SELECT TO authenticated
USING (creator_id = auth.uid() OR auth.role() = 'admin');

-- INSERT Policy: Only allow inserting a row if the creator matches the current user or if the user is an admin
CREATE POLICY insert_project_updates ON public.project_updates
FOR INSERT TO authenticated
WITH CHECK (creator_id = auth.uid() OR auth.role() = 'admin');

-- UPDATE Policy: Only allow updates if the current user is the creator or an admin
CREATE POLICY update_project_updates ON public.project_updates
FOR UPDATE TO authenticated
USING (creator_id = auth.uid() OR auth.role() = 'admin')
WITH CHECK (creator_id = auth.uid() OR auth.role() = 'admin');

-- DELETE Policy: Only allow deletion if the current user is the creator or an admin
CREATE POLICY delete_project_updates ON public.project_updates
FOR DELETE TO authenticated
USING (creator_id = auth.uid() OR auth.role() = 'admin');

COMMIT;

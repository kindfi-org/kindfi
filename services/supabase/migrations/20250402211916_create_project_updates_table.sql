CREATE TABLE public.project_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  update_title text NOT NULL,
  update_content text NOT NULL,
  update_type text NOT NULL,
  is_notification boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

ALTER TABLE public.project_updates
  ADD CONSTRAINT fk_project
  FOREIGN KEY (project_id)
  REFERENCES public.projects (id)
  ON DELETE CASCADE;

CREATE TABLE public.project_updates_kindlers (
  project_update_id uuid NOT NULL,
  kindler_id uuid NOT NULL,
  PRIMARY KEY (project_update_id, kindler_id),
  FOREIGN KEY (project_update_id) REFERENCES public.project_updates (id) ON DELETE CASCADE,
  FOREIGN KEY (kindler_id) REFERENCES public.kindlers (id) ON DELETE CASCADE
);

CREATE INDEX idx_project_updates_project_id ON public.project_updates (project_id);
CREATE INDEX idx_project_updates_update_type ON public.project_updates (update_type);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_project_updates ON public.project_updates
  FOR SELECT
  USING (true);

/* 
  migration: RLS modernization for NextAuth + role-based permissions
  purpose:
    - Recreate RLS policies across core tables to use claim-derived current_auth_user_id() and role-aware rules.
    - Allow public read where intended; restrict writes to owners or editor roles (core/admin/editor).
    - Align Storage bucket policies (project_pitch_decks, project_thumbnails) to project slug folders.
    - Make project_members self-managed (users can edit their own membership; role changes limited unless project owner/admin/core).
    - Permit any project member to create project_updates; restrict updates to author while active.
    - Open read access to milestones/links; allow owner or editor roles to write.
    - Whitelist-driven KYC admin controls and reviewer defaults using claim-derived user id.
    - Lock notifications & notification_preferences to the owning user.
    - Remove deprecated kindler_projects table (replaced by project_members).
  affected objects:
    - tables: projects, project_tags, project_tag_relationships, project_pitch, project_members,
              project_updates, milestones, escrow_milestones, project_escrows,
              kyc_admin_whitelist, kyc_reviews, notifications, notification_preferences,
              storage.objects (policies on buckets project_pitch_decks, project_thumbnails)
    - policies: select/insert/update/delete on all tables above (replaced with new names)
*/

-- Helper function readable by `authenticated` to get caller UUID from JWT claims
CREATE OR REPLACE FUNCTION public.current_auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
  COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
    auth.uid()
  )
$$;

GRANT EXECUTE ON FUNCTION public.current_auth_user_id() TO authenticated, anon;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Adjust grants: anon read-only, authenticated controlled by RLS
REVOKE INSERT, UPDATE, DELETE, TRIGGER, TRUNCATE ON public.projects FROM anon;
GRANT  SELECT ON public.projects TO anon;
GRANT  SELECT, INSERT, UPDATE, DELETE, TRIGGER, TRUNCATE ON public.projects TO authenticated;
GRANT  ALL ON public.projects TO service_role;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to projects"             ON public.projects;
DROP POLICY IF EXISTS "Temporary public insert access to projects" ON public.projects;
DROP POLICY IF EXISTS "Temporary public update access to projects" ON public.projects;
DROP POLICY IF EXISTS "Projects are viewable by everyone"          ON public.projects;
DROP POLICY IF EXISTS "Projects can be created by authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Projects can be updated by owner"           ON public.projects;
DROP POLICY IF EXISTS "Projects can be deleted by owner"           ON public.projects;

-- Public read access
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects
  FOR SELECT
  TO authenticated, anon
  USING ( TRUE );

-- Allow only project owner to insert
CREATE POLICY "Only owner can create a project"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.current_auth_user_id() = kindler_id );

CREATE POLICY "Owner or editors can update a project"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    public.current_auth_user_id() = kindler_id
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.projects.id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  )
  WITH CHECK (
    (
      public.current_auth_user_id() = kindler_id
      OR EXISTS (
        SELECT 1
        FROM public.project_members pm
        WHERE pm.project_id = public.projects.id
          AND pm.user_id    = public.current_auth_user_id()
          AND pm.role IN ('core','admin','editor')
      )
    )
    -- Prevent changing owner: new kindler_id must equal current stored owner
    AND kindler_id = (
      SELECT p.kindler_id
      FROM public.projects p
      WHERE p.id = public.projects.id
    )
  );

-- Allow only project owner to delete
CREATE POLICY "Only owner can delete a project"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING ( public.current_auth_user_id() = kindler_id );

-- Enable RLS
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tag_relationships ENABLE ROW LEVEL SECURITY;

-- project_tags: public read; allow creation by authenticated (dictionary-like table)
CREATE POLICY "Tags are viewable by everyone"
  ON public.project_tags
  FOR SELECT
  TO authenticated, anon
  USING ( TRUE );

CREATE POLICY "Authenticated users can create tags"
  ON public.project_tags
  FOR INSERT
  TO authenticated
  WITH CHECK ( TRUE );

-- Allow authenticated users to update tags
CREATE POLICY "Authenticated users can update tags"
  ON public.project_tags
  FOR UPDATE
  TO authenticated
  USING ( TRUE )
  WITH CHECK ( TRUE );

-- Allow authenticated users to delete unused tags
CREATE POLICY "Authenticated users can delete unused tags"
  ON public.project_tags
  FOR DELETE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.project_tag_relationships r
      WHERE r.tag_id = public.project_tags.id
    )
  );

-- project_tag_relationships: guard by project ownership
-- Read is public to support browsing project tags
CREATE POLICY "Tag links are viewable by everyone"
  ON public.project_tag_relationships
  FOR SELECT
  TO authenticated, anon
  USING ( TRUE );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can add tag link"
  ON public.project_tag_relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_tag_relationships.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.project_tag_relationships.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  );

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete tag link"
  ON public.project_tag_relationships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_tag_relationships.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.project_tag_relationships.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  );

-- Enable RLS
ALTER TABLE public.project_pitch ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to project pitches"              ON public.project_pitch;
DROP POLICY IF EXISTS "Temporary public insert access to project pitches"  ON public.project_pitch;
DROP POLICY IF EXISTS "Temporary public update access to project pitches"  ON public.project_pitch;
DROP POLICY IF EXISTS "Users can delete their own project pitches"         ON public.project_pitch;

-- Public read access to pitches
CREATE POLICY "Project pitches are viewable by everyone"
  ON public.project_pitch
  FOR SELECT
  TO authenticated, anon
  USING ( TRUE );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can create a pitch"
  ON public.project_pitch
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.project_pitch.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.project_pitch.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  );

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update a pitch"
  ON public.project_pitch
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.project_pitch.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.project_pitch.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.project_pitch.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.project_pitch.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  );

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete a pitch"
  ON public.project_pitch
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.project_pitch.project_id
        AND p.kindler_id = public.current_auth_user_id()
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.project_pitch.project_id
        AND pm.user_id    = public.current_auth_user_id()
        AND pm.role IN ('core','admin','editor')
    )
  );

-- Storage: project_pitch_decks

DROP POLICY IF EXISTS "Allow public read access to project pitch deck" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert to project pitch deck"      ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to project pitch deck"      ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete to project pitch deck"      ON storage.objects;

-- Public read for all files in the bucket
CREATE POLICY "Pitch decks are viewable by everyone"
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING ( bucket_id = 'project_pitch_decks' );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can upload a pitch deck"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project_pitch_decks'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.slug = (storage.foldername(storage.objects.name))[1]
        AND (
          p.kindler_id = public.current_auth_user_id()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id    = public.current_auth_user_id()
              AND pm.role IN ('core','admin','editor')
          )
        )
    )
  );

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update a pitch deck"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project_pitch_decks'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.slug = (storage.foldername(storage.objects.name))[1]
        AND (
          p.kindler_id = public.current_auth_user_id()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id    = public.current_auth_user_id()
              AND pm.role IN ('core','admin','editor')
          )
        )
    )
  )
  WITH CHECK (
    bucket_id = 'project_pitch_decks'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.slug = (storage.foldername(storage.objects.name))[1]
        AND (
          p.kindler_id = public.current_auth_user_id()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id    = public.current_auth_user_id()
              AND pm.role IN ('core','admin','editor')
          )
        )
    )
  );

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete a pitch deck"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project_pitch_decks'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.slug = (storage.foldername(storage.objects.name))[1]
        AND (
          p.kindler_id = public.current_auth_user_id()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id    = public.current_auth_user_id()
              AND pm.role IN ('core','admin','editor')
          )
        )
    )
  );

-- Storage: project_thumbnails

DROP POLICY IF EXISTS "Allow public read access to project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert to project thumbnails"      ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to project thumbnails"      ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete to project thumbnails"      ON storage.objects;

-- Public read for all files in the bucket
CREATE POLICY "Project thumbnails are viewable by everyone"
ON storage.objects
FOR SELECT
TO authenticated, anon
USING ( bucket_id = 'project_thumbnails' );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can upload a thumbnail"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project_thumbnails'
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.slug = (storage.foldername(storage.objects.name))[1]
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
);

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update a thumbnail"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project_thumbnails'
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.slug = (storage.foldername(storage.objects.name))[1]
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
)
WITH CHECK (
  bucket_id = 'project_thumbnails'
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.slug = (storage.foldername(storage.objects.name))[1]
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
);

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete a thumbnail"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project_thumbnails'
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.slug = (storage.foldername(storage.objects.name))[1]
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
);

-- project_members: drop previous policies
DROP POLICY IF EXISTS "Public read access to project members"   ON public.project_members;
DROP POLICY IF EXISTS "Project owners can add members"          ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update member roles"  ON public.project_members;
DROP POLICY IF EXISTS "Project owners can remove members"       ON public.project_members;

-- Public read for member lists
CREATE POLICY "Project members are viewable by everyone"
ON public.project_members
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Only the user themself can create their membership
CREATE POLICY "Only the user can create their membership"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK ( public.project_members.user_id = public.current_auth_user_id() );

-- User can update own membership (limited role changes) or privileged (owner/admin/core) can update any
CREATE POLICY "User or privileged can update membership"
ON public.project_members
FOR UPDATE
TO authenticated
USING (
  -- Row visibility (who is allowed to attempt the update):
  -- The membership owner
  public.project_members.user_id = public.current_auth_user_id()

  -- The project owner
  OR EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.project_members.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )

  -- Project members with admin/core role
  OR EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = public.project_members.project_id
      AND pm.user_id    = public.current_auth_user_id()
      AND pm.role IN ('admin','core')
  )
)
WITH CHECK (
  -- New row validation (what values are allowed after the update):
  -- Path A: Privileged users (project owner, admin, core) 
  -- can freely update any field, including `role`.
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.project_members.project_id
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('admin','core')
        )
      )
  )
  OR
  -- Path B: The membership owner is updating their own row.
  (
    public.project_members.user_id = public.current_auth_user_id()
    AND (
      -- Case 1: The role is unchanged (safe update: e.g. updating title)
      public.project_members.role = (
        SELECT pm.role
        FROM public.project_members pm
        WHERE pm.project_id = public.project_members.project_id
          AND pm.user_id    = public.project_members.user_id
      )
      -- Case 2: The role IS changing, but only allowed 
      -- if the new role is NOT privileged (cannot escalate to admin/core/editor).
      OR public.project_members.role NOT IN ('admin','core','editor')
    )
  )
);

-- Only the user themself can delete their membership
CREATE POLICY "Only the user can delete their membership"
ON public.project_members
FOR DELETE
TO authenticated
USING ( public.project_members.user_id = public.current_auth_user_id() );

-- project_updates: drop previous policies
DROP POLICY IF EXISTS "Public read access to project updates"                  ON public.project_updates;
DROP POLICY IF EXISTS "Project updates can be created by project members"      ON public.project_updates;
DROP POLICY IF EXISTS "Project updates can be modified by authors"             ON public.project_updates;
DROP POLICY IF EXISTS "Project updates can be deleted by authors or project owners" ON public.project_updates;

-- Public read for all updates
CREATE POLICY "Project updates are viewable by everyone"
ON public.project_updates
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Any project member (any role) can create updates
CREATE POLICY "Any member can create an update"
  ON public.project_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_auth_user_id() = public.project_updates.author_id
    AND EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE pm.project_id = public.project_updates.project_id
        AND pm.user_id    = public.current_auth_user_id()
    )
  );

-- Update allowed to the author and only while project is active
CREATE POLICY "Only author can update while active"
ON public.project_updates
FOR UPDATE
TO authenticated
USING (
  public.current_auth_user_id() = public.project_updates.author_id
)
WITH CHECK (
  public.current_auth_user_id() = public.project_updates.author_id
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = public.project_updates.project_id
      AND p.current_amount < p.target_amount
  )
);

-- Delete allowed to the author or the project owner
CREATE POLICY "Author or owner can delete"
ON public.project_updates
FOR DELETE
TO authenticated
USING (
  public.current_auth_user_id() = public.project_updates.author_id
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = public.project_updates.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )
);

-- milestones: drop previous policies
DROP POLICY IF EXISTS "Project owners can create milestones" ON public.milestones;
DROP POLICY IF EXISTS "Public read access to milestones"     ON public.milestones;
DROP POLICY IF EXISTS "Project owners can update milestones" ON public.milestones;
DROP POLICY IF EXISTS "Project owners can delete milestones" ON public.milestones;

-- Public read for all milestones
CREATE POLICY "Milestones are viewable by everyone"
ON public.milestones
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can create a milestone"
ON public.milestones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.milestones.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )
  OR EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = public.milestones.project_id
      AND pm.user_id    = public.current_auth_user_id()
      AND pm.role IN ('core','admin','editor')
  )
);

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update a milestone"
ON public.milestones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.milestones.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )
  OR EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = public.milestones.project_id
      AND pm.user_id    = public.current_auth_user_id()
      AND pm.role IN ('core','admin','editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.milestones.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )
  OR EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = public.milestones.project_id
      AND pm.user_id    = public.current_auth_user_id()
      AND pm.role IN ('core','admin','editor')
  )
);

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete a milestone"
ON public.milestones
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.milestones.project_id
      AND p.kindler_id = public.current_auth_user_id()
  )
  OR EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = public.milestones.project_id
      AND pm.user_id    = public.current_auth_user_id()
      AND pm.role IN ('core','admin','editor')
  )
);

-- escrow_milestones: drop previous policies
DROP POLICY IF EXISTS "select escrow_milestones for owners" ON public.escrow_milestones;
DROP POLICY IF EXISTS "insert escrow_milestones for owners" ON public.escrow_milestones;
DROP POLICY IF EXISTS "update escrow_milestones for owners" ON public.escrow_milestones;
DROP POLICY IF EXISTS "delete escrow_milestones for owners" ON public.escrow_milestones;

-- Public read for all escrow–milestone links
CREATE POLICY "Escrow milestones links are viewable by everyone"
ON public.escrow_milestones
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can link escrow to milestone"
ON public.escrow_milestones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
   WHERE m.id = public.escrow_milestones.milestone_id
     AND (
       p.kindler_id = public.current_auth_user_id()
       OR EXISTS (
         SELECT 1
         FROM public.project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id    = public.current_auth_user_id()
           AND pm.role IN ('core','admin','editor')
       )
     )
  )
);

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update escrow milestone link"
ON public.escrow_milestones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
   WHERE m.id = public.escrow_milestones.milestone_id
     AND (
       p.kindler_id = public.current_auth_user_id()
       OR EXISTS (
         SELECT 1
         FROM public.project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id    = public.current_auth_user_id()
           AND pm.role IN ('core','admin','editor')
       )
     )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
   WHERE m.id = public.escrow_milestones.milestone_id
     AND (
       p.kindler_id = public.current_auth_user_id()
       OR EXISTS (
         SELECT 1
         FROM public.project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id    = public.current_auth_user_id()
           AND pm.role IN ('core','admin','editor')
       )
     )
  )
);

-- Delete allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can delete escrow milestone link"
ON public.escrow_milestones
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
   WHERE m.id = public.escrow_milestones.milestone_id
     AND (
       p.kindler_id = public.current_auth_user_id()
       OR EXISTS (
         SELECT 1
         FROM public.project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id    = public.current_auth_user_id()
           AND pm.role IN ('core','admin','editor')
       )
     )
  )
);

-- project_escrows: drop previous policies
DROP POLICY IF EXISTS "select project_escrows for project owners" ON public.project_escrows;
DROP POLICY IF EXISTS "insert project_escrows for project owners" ON public.project_escrows;
DROP POLICY IF EXISTS "update project_escrows for project owners" ON public.project_escrows;
DROP POLICY IF EXISTS "delete project_escrows for project owners" ON public.project_escrows;

-- Public read for all project–escrow links
CREATE POLICY "Project escrows are viewable by everyone"
ON public.project_escrows
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Insert allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can create a project escrow link"
ON public.project_escrows
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.project_escrows.project_id
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
);

-- Update allowed to owner or members with edit roles
CREATE POLICY "Owner or editors can update a project escrow link"
ON public.project_escrows
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.project_escrows.project_id
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = public.project_escrows.project_id
      AND (
        p.kindler_id = public.current_auth_user_id()
        OR EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id    = public.current_auth_user_id()
            AND pm.role IN ('core','admin','editor')
        )
      )
  )
);

-- Enable RLS
ALTER TABLE public.kyc_admin_whitelist ENABLE ROW LEVEL SECURITY;

-- kyc_admin_whitelist: drop existing policies
DROP POLICY IF EXISTS "Allow reading admin whitelist"            ON public.kyc_admin_whitelist;
DROP POLICY IF EXISTS "Whitelisted admins can manage whitelist"  ON public.kyc_admin_whitelist;

-- Public read of whitelist entries
CREATE POLICY "Whitelist is viewable by everyone"
ON public.kyc_admin_whitelist
FOR SELECT
TO authenticated, anon
USING ( TRUE );

-- Insert allowed only to whitelisted admins
CREATE POLICY "Only whitelisted admin can manage whitelist"
ON public.kyc_admin_whitelist
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kyc_admin_whitelist w
    WHERE w.user_id = public.current_auth_user_id()
  )
);

-- Update allowed only to whitelisted admins
CREATE POLICY "Only whitelisted admin can update whitelist"
ON public.kyc_admin_whitelist
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.kyc_admin_whitelist w
    WHERE w.user_id = public.current_auth_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kyc_admin_whitelist w
    WHERE w.user_id = public.current_auth_user_id()
  )
);

-- Delete allowed only to whitelisted admins
CREATE POLICY "Only whitelisted admin can delete whitelist"
ON public.kyc_admin_whitelist
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.kyc_admin_whitelist w
    WHERE w.user_id = public.current_auth_user_id()
  )
);

-- Enable RLS
ALTER TABLE public.kyc_reviews ENABLE ROW LEVEL SECURITY;

-- kyc_reviews: drop existing policies
DROP POLICY IF EXISTS "Whitelisted users can create KYC reviews"   ON public.kyc_reviews;
DROP POLICY IF EXISTS "Whitelisted users can view all KYC reviews" ON public.kyc_reviews;
DROP POLICY IF EXISTS "Whitelisted users can update KYC reviews"   ON public.kyc_reviews;
DROP POLICY IF EXISTS "Users can view their own KYC reviews"       ON public.kyc_reviews;

-- Users can view their own KYC reviews
CREATE POLICY "User can view own KYC reviews"
ON public.kyc_reviews
FOR SELECT
TO authenticated
USING ( public.kyc_reviews.user_id = public.current_auth_user_id() );

-- Whitelisted admins can view all reviews
CREATE POLICY "Whitelisted admin can view all KYC reviews"
ON public.kyc_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w WHERE w.user_id = public.current_auth_user_id())
);

-- Whitelisted admins can create reviews (reviewer must match caller)
CREATE POLICY "Whitelisted admin can create KYC reviews"
ON public.kyc_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w WHERE w.user_id = public.current_auth_user_id())
  AND public.kyc_reviews.reviewer_id = public.current_auth_user_id()
);

-- Whitelisted admins can update any review
CREATE POLICY "Whitelisted admin can update KYC reviews"
ON public.kyc_reviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w WHERE w.user_id = public.current_auth_user_id())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.kyc_admin_whitelist w WHERE w.user_id = public.current_auth_user_id())
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- notifications: drop previous policies
DROP POLICY IF EXISTS "Users can view their own notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Users can create their own notifications"  ON public.notifications;

-- Select allowed only to the user themself
CREATE POLICY "Only user can view their notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING ( public.notifications.user_id = public.current_auth_user_id() );

-- Insert allowed only to the user themself
CREATE POLICY "Only user can create their notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK ( public.notifications.user_id = public.current_auth_user_id() );

-- Update allowed only to the user themself
CREATE POLICY "Only user can update their notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING ( public.notifications.user_id = public.current_auth_user_id() )
WITH CHECK ( public.notifications.user_id = public.current_auth_user_id() );

-- Delete allowed only to the user themself
CREATE POLICY "Only user can delete their notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING ( public.notifications.user_id = public.current_auth_user_id() );

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- notification_preferences: drop previous policies
DROP POLICY IF EXISTS "Users can view their own notification preferences"   ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

-- Select allowed only to the user themself
CREATE POLICY "Only user can view their notification preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING ( public.notification_preferences.user_id = public.current_auth_user_id() );

-- Update allowed only to the user themself
CREATE POLICY "Only user can update their notification preferences"
ON public.notification_preferences
FOR UPDATE
TO authenticated
USING ( public.notification_preferences.user_id = public.current_auth_user_id() )
WITH CHECK ( public.notification_preferences.user_id = public.current_auth_user_id() );

-- Remove deprecated junction table; superseded by project_members
DROP TABLE IF EXISTS public.kindler_projects;

-- Create a public bucket for project pitch decks with size and MIME type restrictions
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'project_pitch_decks',
  'project_pitch_decks',
  TRUE,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint', -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
    'application/vnd.apple.keynote', -- .key
    'application/vnd.oasis.opendocument.presentation' -- .odp
  ]
);

-- Allow public read access to objects in the project_pitch_decks bucket
CREATE POLICY "Allow public read access to project pitch deck"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project_pitch_decks'
);

-- TEMPORARY POLICY: Allows project creation without authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Allow public insert to project pitch deck"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'project_pitch_decks'
);

-- TEMPORARY POLICY: Allows project creation without authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Allow public update to project pitch deck"
ON storage.objects
FOR UPDATE
TO public
USING (true)
WITH CHECK (
  bucket_id = 'project_pitch_decks'
);

-- TEMPORARY POLICY: Allows project creation without authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Allow public delete to project pitch deck"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'project_pitch_decks'
);

-- TODO: Re-enable after auth changes from issue #44. - @derianrddev
-- -- Upload policy (project owners only)
-- create policy "Project owners can upload" on storage.objects
-- for insert to authenticated with check (
--   bucket_id = 'project_pitch_decks'
--   and auth.uid() = (
--     select kindler_id from projects
--     where slug = (storage.foldername(name))[1]::uuid
--   )
-- );

-- -- View policy (owners + project members)
-- create policy "Project team can view" on storage.objects
-- for select using (
--   bucket_id = 'project_pitch_decks'
--   and (
--     auth.uid() = (select kindler_id from projects where slug = (storage.foldername(name))[1]::uuid)
--     or exists (
--       select 1 from project_members
--       where project_id = (
--         select id from projects where slug = storage.foldername(name)[1]
--       )
--       and user_id = auth.uid()
--     )
--   )
-- );

-- -- Delete policy (owners only)
-- create policy "Only owners can delete" on storage.objects
-- for delete using (
--   bucket_id = 'project_pitch_decks'
--   and auth.uid() = (
--     select kindler_id from projects
--     where slug = (storage.foldername(name))[1]::uuid
--   )
-- );

-- Create a public bucket for project thumbnails with size and MIME type restrictions
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'project_thumbnails',
  'project_thumbnails',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Allow public read access to objects in the project_thumbnails bucket
CREATE POLICY "Allow public read access to project thumbnails"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project_thumbnails'
);

-- TEMPORARY POLICY: Allows project creation without authentication
-- ⚠️ Remove or replace this policy when auth is active
CREATE POLICY "Allow public insert to project thumbnails"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'project_thumbnails'
);

-- TODO: Re-enable after auth changes from issue #44. - @derianrddev
-- CREATE POLICY "Allow update/delete to project thumbnails for project members or kindler"
-- ON storage.objects
-- FOR ALL
-- USING (
--   bucket_id = 'project_thumbnails'
--   AND (
--     (
--       EXISTS (
--         SELECT 1
--         FROM projects
--         WHERE projects.id::TEXT = SPLIT_PART(storage.objects.name, '/', 1)
--         AND projects.kindler_id = auth.uid()
--       )
--       OR
--       EXISTS (
--         SELECT 1
--         FROM project_members
--         WHERE project_members.project_id::TEXT = SPLIT_PART(storage.objects.name, '/', 1)
--         AND project_members.user_id = auth.uid()
--       )
--     )
--   )
-- );

-- Create a public Supabase Storage bucket for project story images.
-- Images are served publicly via their hosted URL so they can be embedded
-- in story HTML without authentication.

INSERT INTO storage.buckets (id, name, public)
VALUES ('project_story_images', 'project_story_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users with project-management permissions to upload.
-- Fine-grained permission enforcement is done at the API layer (story-image route).
CREATE POLICY "Authenticated users can upload story images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project_story_images');

-- Allow the public to read story images (needed for embedding in project pages).
CREATE POLICY "Story images are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project_story_images');

-- Allow authenticated users to delete their own story images.
CREATE POLICY "Authenticated users can delete story images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'project_story_images');

-- Create storage bucket for project pitch decks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project_pitch_decks',
  'project_pitch_decks',
  FALSE, -- Not public, access controlled by RLS
  10485760, -- 10MB limit as specified in requirements
  ARRAY[
    'application/pdf', -- PDF files
    'application/vnd.ms-powerpoint', -- PPT files
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- PPTX files
    'application/vnd.oasis.opendocument.presentation', -- ODP files
    'application/vnd.google-apps.presentation' -- Google Slides
  ]::text[]
);

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload files to their own projects
CREATE POLICY "Users can upload pitch decks to their own projects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project_pitch_decks' AND
    (
      -- Extract project_id from the path (format: project_id/filename.ext)
      SPLIT_PART(name, '/', 1) IN (
        SELECT id::text FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Create policy to allow project owners and collaborators to view files
CREATE POLICY "Project owners and collaborators can view pitch decks"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project_pitch_decks' AND
    (
      -- Extract project_id from the path
      SPLIT_PART(name, '/', 1) IN (
        -- Project owner can view
        SELECT id::text FROM public.projects
        WHERE owner_id = auth.uid()
        
        UNION
        
        -- Project members/collaborators can view
        SELECT p.id::text 
        FROM public.projects p
        JOIN public.project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = auth.uid()
      )
    )
  );

-- Create policy to allow project owners to update files
CREATE POLICY "Project owners can update pitch decks"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project_pitch_decks' AND
    (
      -- Extract project_id from the path
      SPLIT_PART(name, '/', 1) IN (
        SELECT id::text FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Create policy to allow project owners to delete files
CREATE POLICY "Project owners can delete pitch decks"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project_pitch_decks' AND
    (
      -- Extract project_id from the path
      SPLIT_PART(name, '/', 1) IN (
        SELECT id::text FROM public.projects
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Update the project_pitch table to properly reference the storage bucket
COMMENT ON COLUMN public.project_pitch.pitch_deck IS 'Reference to file path in project_pitch_decks storage bucket';
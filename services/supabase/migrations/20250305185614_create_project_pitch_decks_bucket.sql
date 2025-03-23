-- Create storage bucket for project pitch decks
BEGIN;

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_pitch_decks', 'project_pitch_decks', false);

-- Set allowed mime types for the bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
],
    file_size_limit = 10485760 -- 10MB in bytes
WHERE id = 'project_pitch_decks';

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for file uploads: Only project owners and collaborators can upload
CREATE POLICY "Users can upload pitch decks to their projects" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'project_pitch_decks'
    AND (
        -- Check if user is project owner or collaborator
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id = (SELECT id FROM public.projects WHERE id::text = SPLIT_PART(name, '/', 1))
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    )
);

-- Policy for file access: Only project owners and collaborators can view
CREATE POLICY "Project owners and collaborators can view pitch decks" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'project_pitch_decks'
    AND (
        -- Check if user is project owner or collaborator
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id = (SELECT id FROM public.projects WHERE id::text = SPLIT_PART(name, '/', 1))
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    )
);

-- Policy for file deletion: Only project owners can delete
CREATE POLICY "Project owners can delete pitch decks" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'project_pitch_decks'
    AND (
        -- Check if user is project owner
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id::text = SPLIT_PART(name, '/', 1)
            AND owner_id = auth.uid()
        )
    )
);

COMMIT;
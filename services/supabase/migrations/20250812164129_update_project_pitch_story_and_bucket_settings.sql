-- Ensure no NULL values remain in 'story' before making it NOT NULL
UPDATE public.project_pitch
SET story = ''
WHERE story IS NULL;

-- Enforce 'story' column to be NOT NULL
ALTER TABLE public.project_pitch
ALTER COLUMN story SET NOT NULL;

-- Create the 'project_pitch_decks' bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_pitch_decks', 'project_pitch_decks', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Update bucket settings: make it public, set 10MB limit, and allow only PDF/PPT/PPTX files
UPDATE storage.buckets
SET public = TRUE,
    file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/vnd.ms-powerpoint', -- .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' -- .pptx
    ]
WHERE id = 'project_pitch_decks';

-- Remove the non-functional file type restriction policy
DROP POLICY IF EXISTS "Restrict file types" ON storage.objects;

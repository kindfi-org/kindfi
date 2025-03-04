-- Create project_pitch table
CREATE TABLE IF NOT EXISTS public.project_pitch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    story TEXT,
    pitch_deck VARCHAR(255),
    video_url VARCHAR(255),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.project_pitch IS 'Stores project pitch information including story, pitch deck, and video URL';

-- Add RLS policies
ALTER TABLE public.project_pitch ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view project pitches they have access to
CREATE POLICY "Users can view project pitches they have access to" 
ON public.project_pitch
FOR SELECT 
USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE id = project_pitch.project_id
        AND (
            owner_id = auth.uid()
            -- owner_id = auth.uid() OR
            -- id IN (
            --     SELECT project_id FROM public.project_members
            --     WHERE user_id = auth.uid()
            -- )
        )
    )
);

-- Create policy for users to insert their own project pitches
CREATE POLICY "Users can insert their own project pitches" 
ON public.project_pitch
FOR INSERT 
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects
        WHERE id = project_pitch.project_id
        AND (
            owner_id = auth.uid()
            -- owner_id = auth.uid() OR
            -- id IN (
            --     SELECT project_id FROM public.project_members
            --     WHERE user_id = auth.uid()
            --     AND role IN ('admin', 'editor')
            -- )
        )
    )
);

-- Create policy for users to update their own project pitches
CREATE POLICY "Users can update their own project pitches" 
ON public.project_pitch
FOR UPDATE 
USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE id = project_pitch.project_id
        AND (
            owner_id = auth.uid()
            -- owner_id = auth.uid() OR
            -- id IN (
            --     SELECT project_id FROM public.project_members
            --     WHERE user_id = auth.uid()
            --     AND role IN ('admin', 'editor')
            -- )
        )
    )
);

-- Create policy for users to delete their own project pitches
CREATE POLICY "Users can delete their own project pitches" 
ON public.project_pitch
FOR DELETE 
USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE id = project_pitch.project_id
        AND (
            owner_id = auth.uid()
            -- owner_id = auth.uid() OR
            -- id IN (
            --     SELECT project_id FROM public.project_members
            --     WHERE user_id = auth.uid()
            --     AND role = 'admin'
            -- )
        )
    )
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.project_pitch
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
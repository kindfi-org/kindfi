-- Add narrative story and qualitative impact highlights to foundations
ALTER TABLE public.foundations
ADD COLUMN IF NOT EXISTS story TEXT,
ADD COLUMN IF NOT EXISTS impact_highlights TEXT[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.foundations.story IS 'Narrative origin story to connect with donors emotionally';
COMMENT ON COLUMN public.foundations.impact_highlights IS 'Qualitative accomplishments without exact metrics (e.g. built 3 schools, served 500 families)';

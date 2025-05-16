-- Update column types from varchar to text in the project_pitch table
ALTER TABLE public.project_pitch
  ALTER COLUMN title TYPE text,
  ALTER COLUMN pitch_deck TYPE text,
  ALTER COLUMN video_url TYPE text;

-- Update column types from varchar to text in the project_tags table
ALTER TABLE public.project_tags
  ALTER COLUMN name TYPE text,
  ALTER COLUMN color TYPE char(7);

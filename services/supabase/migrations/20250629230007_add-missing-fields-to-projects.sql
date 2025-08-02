-- Enable extension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add slug, social_links, project_location fields to projects
ALTER TABLE public.projects
  ADD COLUMN slug TEXT,
  ADD COLUMN social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN project_location CHAR(3) NOT NULL;

-- Rename investors_count to kinder_count
ALTER TABLE public.projects RENAME COLUMN investors_count TO kinder_count;

-- Drop and recreate update_project_on_investment function
DROP FUNCTION IF EXISTS public.update_project_on_investment CASCADE;

CREATE OR REPLACE FUNCTION public.update_project_on_investment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.projects
    SET
        current_amount = current_amount + NEW.amount,
        percentage_complete = CASE
          WHEN target_amount > 0 THEN LEAST((current_amount + NEW.amount) / target_amount * 100, 100)
          ELSE 0
        END,
        kinder_count = kinder_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$;

-- Create slug generation function and trigger
CREATE OR REPLACE FUNCTION public.generate_project_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    suffix INT := 1;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := regexp_replace(
                        regexp_replace(
                            lower(unaccent(NEW.title)),
                            '&', 'and', 'g'
                        ),
                        '[^a-z0-9]+', '-', 'g'
                     );
        NEW.slug := base_slug;

        WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = NEW.slug AND id <> NEW.id) LOOP
            NEW.slug := base_slug || '-' || suffix;
            suffix := suffix + 1;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_generate_slug ON public.projects;

CREATE TRIGGER projects_generate_slug
BEFORE INSERT OR UPDATE OF title ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.generate_project_slug();

-- * Backfill slugs for existing projects.
-- ? This is done by triggering the `generate_project_slug` function for all rows
-- ? where the slug is currently NULL. The trigger is fired by updating the `title`
-- ? column to its own value, which is a standard way to invoke an update trigger.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.projects WHERE slug IS NULL) THEN
    UPDATE public.projects SET title = title WHERE slug IS NULL;
  END IF;
END;
$$;

-- Add indexes
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON public.projects(slug);
CREATE INDEX IF NOT EXISTS projects_project_location_idx ON public.projects(project_location);

-- Add country code format constraint
ALTER TABLE public.projects
  ADD CONSTRAINT chk_project_location_alpha3
  CHECK (project_location ~ '^[A-Z]{3}$');

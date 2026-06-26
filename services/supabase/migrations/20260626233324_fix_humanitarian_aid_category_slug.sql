-- Preserve explicit category slugs on update (e.g. "aid" for Humanitarian Aid)
CREATE OR REPLACE FUNCTION public.generate_slug()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    NEW.slug := regexp_replace(
      regexp_replace(
        lower(unaccent(NEW.name)),
        '&', 'and', 'g'
      ),
      '[^a-z0-9]+', '-', 'g'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE public.categories
SET slug = 'aid'
WHERE name = 'Humanitarian Aid';

-- Enable extension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add slug column
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create function
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS trigger AS $$
BEGIN
  NEW.slug := regexp_replace(
    regexp_replace(
      lower(unaccent(NEW.name)),
      '&', 'and', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger
DROP TRIGGER IF EXISTS categories_generate_slug ON categories;

-- Create trigger
CREATE TRIGGER categories_generate_slug
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION generate_slug();

-- Force trigger to run for existing data
UPDATE categories SET name = name;

-- Index for faster search
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);

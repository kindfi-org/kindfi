-- Add foreign key from waitlist_interests.category_id to categories.id
-- Ensure categories exists and uses UUID id (applied in earlier migrations)

-- Drop existing FK if present (idempotent)
ALTER TABLE IF EXISTS public.waitlist_interests
  DROP CONSTRAINT IF EXISTS waitlist_interests_category_id_fkey;

-- Add FK
ALTER TABLE public.waitlist_interests
  ADD CONSTRAINT waitlist_interests_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS waitlist_interests_category_id_idx
  ON public.waitlist_interests(category_id);



-- Drop existing foreign key constraint if it exists
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_id_fkey;

-- Drop primary key constraint on categories.id
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey;

-- Drop the existing id column
ALTER TABLE categories DROP COLUMN id;

-- Add new UUID-based id column
ALTER TABLE categories ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();

-- Cast category_id to uuid explicitly
ALTER TABLE projects
  ALTER COLUMN category_id SET DATA TYPE uuid
  USING category_id::uuid;

-- Add foreign key constraint
ALTER TABLE projects
  ADD CONSTRAINT projects_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES categories(id)
  ON DELETE SET NULL;

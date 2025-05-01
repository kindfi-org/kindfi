
-- Create categories table
create table public.categories (
  id integer primary key generated always as identity,
  name text not null unique,
  color char(7) not null unique
);

alter table public.categories
  add constraint chk_color_format check (color ~ '^#[0-9A-Fa-f]{6}$');

-- Indexes for better performance
-- create index idx_categories_name on public.categories (name);
-- create index idx_categories_color on public.categories (color);

-- Row Level Security
alter table public.categories enable row level security;

GRANT SELECT ON public.categories TO public;

-- Public read access
create policy "Public can read categories"
  on public.categories
  for select
  using (true);

-- Only admins can insert, update, delete
create policy "Admins can write categories"
  on public.categories
  for all
  using (
    current_setting('jwt.claims.role', true) = 'admin'
  )
  with check (
    current_setting('jwt.claims.role', true) = 'admin'
  );

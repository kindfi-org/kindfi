
-- Create categories table
create table public.categories (
  id integer primary key generated always as identity,
  name text not null unique,
  color text not null unique
);

-- Indexes for better performance
create index idx_categories_name on public.categories (name);
create index idx_categories_color on public.categories (color);

-- Row Level Security
alter table public.categories enable row level security;

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
    auth.role() = 'admin'
  )
  with check (
    auth.role() = 'admin'
  );

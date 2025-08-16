-- Create waitlist_interests table
create table if not exists public.waitlist_interests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text null,
  role text not null check (role in ('project_creator','supporter','partner')),
  project_name text null,
  project_description text null,
  category_id uuid null references public.categories(id) on delete set null,
  location text null,
  source text null,
  consent boolean not null default false
);

-- Indexes
create index if not exists waitlist_interests_created_at_idx on public.waitlist_interests(created_at desc);
create index if not exists waitlist_interests_role_idx on public.waitlist_interests(role);
create index if not exists waitlist_interests_email_idx on public.waitlist_interests(lower(email));

-- RLS
alter table public.waitlist_interests enable row level security;

-- Policies
do $$ begin
  create policy "Allow public inserts" on public.waitlist_interests for insert to public with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "No public select" on public.waitlist_interests for select to authenticated using (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "No public update" on public.waitlist_interests for update to authenticated using (false) with check (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "No public delete" on public.waitlist_interests for delete to authenticated using (false);
exception when duplicate_object then null; end $$;



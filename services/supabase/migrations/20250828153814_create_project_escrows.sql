/* 
  migration: create project_escrows junction table with rls
  purpose:
    - model the project ↔ escrow relationship via a junction table.
    - enforce referential integrity with on delete cascade to keep junction rows in sync when parents are deleted.
    - enable row level security (rls) and define granular, permissive policies for authenticated users.
    - add timestamps and an updated_at trigger.
    - create per-foreign-key indexes to improve lookups and rls evaluation performance.

  affected objects:
    - new table: public.project_escrows
    - foreign keys: public.projects(id), public.escrow_contracts(id)

  assumptions:
    - a user "owns" a project when public.projects.kindler_id = (select next_auth.uid()).

  safety:
    - creation is idempotent where possible (if not exists on table/index/trigger/function).
    - policies use clear names and are permissive (not restrictive). "anon" is not granted any policy, so access is denied by default.
*/

-- create the junction table (idempotent)
create table if not exists public.project_escrows (
  project_id uuid not null references public.projects(id) on delete cascade,
  escrow_id  uuid not null references public.escrow_contracts(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, escrow_id)
);

-- enable row level security (mandatory in supabase)
alter table public.project_escrows enable row level security;

-- generic updated_at function (create or replace)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at := now();
  return new;
end;
$func$;

-- updated_at trigger (drop + create to guarantee exact config)
drop trigger if exists trg_set_updated_at_project_escrows on public.project_escrows;

create trigger trg_set_updated_at_project_escrows
before update on public.project_escrows
for each row
execute function public.set_updated_at();

-- performance indexes for one-sided lookups and efficient rls checks
create index if not exists idx_project_escrows_project_id
  on public.project_escrows(project_id);

create index if not exists idx_project_escrows_escrow_id
  on public.project_escrows(escrow_id);

-- RLS policies

-- Allow project owners to view project escrows
create policy "select project_escrows for project owners"
on public.project_escrows
for select
to authenticated
using (
  project_id in (
    select p.id
    from public.projects p
    where p.kindler_id = (select next_auth.uid())
  )
);

-- Allow project owners to create project escrows
create policy "insert project_escrows for project owners"
on public.project_escrows
for insert
to authenticated
with check (
  project_id in (
    select p.id
    from public.projects p
    where p.kindler_id = (select next_auth.uid())
  )
);

-- Allow project owners to update project escrows
create policy "update project_escrows for project owners"
on public.project_escrows
for update
to authenticated
using (
  project_id in (
    select p.id
    from public.projects p
    where p.kindler_id = (select next_auth.uid())
  )
)
with check (
  project_id in (
    select p.id
    from public.projects p
    where p.kindler_id = (select next_auth.uid())
  )
);

-- Allow project owners to delete project escrows
create policy "delete project_escrows for project owners"
on public.project_escrows
for delete
to authenticated
using (
  project_id in (
    select p.id
    from public.projects p
    where p.kindler_id = (select next_auth.uid())
  )
);

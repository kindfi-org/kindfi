/* 
  migration: create project_escrows junction table with RLS
  purpose:
    - model the project ↔ escrow relationship with a junction table.
    - enforce strict 1↔1 cardinality (one escrow per project and one project per escrow) via UNIQUE(project_id) and UNIQUE(escrow_id).
    - maintain referential integrity with ON DELETE CASCADE on both FKs.
    - enable row level security (RLS) with owner-only policies for authenticated users.
    - add timestamps and an updated_at trigger.
  affected objects:
    - table: public.project_escrows (pk: (project_id, escrow_id); unique: project_id; unique: escrow_id)
    - foreign keys: public.projects(id), public.escrow_contracts(id)
    - trigger: trg_set_updated_at_project_escrows → public.set_updated_at()
    - policies: select / insert / update / delete on public.project_escrows
  assumptions:
    - ownership: a user “owns” a project when public.projects.kindler_id = (select next_auth.uid()).
  safety:
    - idempotent where possible (if not exists; drop+create for triggers).
*/


-- create the junction table (idempotent)
create table if not exists public.project_escrows (
  project_id uuid not null references public.projects(id) on delete cascade,
  escrow_id  uuid not null references public.escrow_contracts(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, escrow_id),
  constraint unique_project_id unique (project_id),
  constraint unique_escrow_id unique (escrow_id)
);

-- enable row level security
alter table public.project_escrows enable row level security;

-- updated_at trigger (drop + create to guarantee exact config)
drop trigger if exists trg_set_updated_at_project_escrows on public.project_escrows;

create trigger trg_set_updated_at_project_escrows
before update on public.project_escrows
for each row
execute function public.set_updated_at();

-- RLS policies

-- Allow project owners to view project escrows
create policy "select project_escrows for project owners"
on public.project_escrows
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_escrows.project_id
      and p.kindler_id = next_auth.uid()
  )
);

-- Allow project owners to create project escrows
create policy "insert project_escrows for project owners"
on public.project_escrows
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_escrows.project_id
      and p.kindler_id = next_auth.uid()
  )
);

-- Allow project owners to update project escrows
create policy "update project_escrows for project owners"
on public.project_escrows
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_escrows.project_id
      and p.kindler_id = next_auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_escrows.project_id
      and p.kindler_id = next_auth.uid()
  )
);

-- Allow project owners to delete project escrows
create policy "delete project_escrows for project owners"
on public.project_escrows
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_escrows.project_id
      and p.kindler_id = next_auth.uid()
  )
);

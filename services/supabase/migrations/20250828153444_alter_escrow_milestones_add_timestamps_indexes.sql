/* 
  migration: escrow_milestones — timestamps, indexes, CASCADE FKs & hardened RLS
  purpose:
    - add created_at / updated_at + trigger.
    - add indexes by FK.
    - enforce ON DELETE CASCADE on FKs.
    - replace RLS policies to validate project ownership via milestone → project.kindler_id = next_auth.uid().
  affected:
    - table: public.escrow_milestones
    - function: public.set_updated_at()
    - policies: select/insert/update/delete on public.escrow_milestones
  notes:
    - best-effort idempotent (IF EXISTS / IF NOT EXISTS, drop+create by name).
*/

-- ensure traceability columns
alter table public.escrow_milestones
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- generic set_updated_at (create or replace)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at := now();
  return new;
end;
$func$;

-- updated_at trigger (drop + create to ensure correct configuration)
drop trigger if exists trg_set_updated_at_escrow_milestones on public.escrow_milestones;

create trigger trg_set_updated_at_escrow_milestones
before update on public.escrow_milestones
for each row
execute function public.set_updated_at();

-- per-FK indexes
create index if not exists idx_escrow_milestones_escrow_id
  on public.escrow_milestones(escrow_id);

create index if not exists idx_escrow_milestones_milestone_id
  on public.escrow_milestones(milestone_id);

-- enforce ON DELETE CASCADE on FKs (drop and recreate by name)
alter table public.escrow_milestones
  drop constraint if exists escrow_milestones_escrow_id_fkey,
  drop constraint if exists escrow_milestones_milestone_id_fkey;

alter table public.escrow_milestones
  add constraint escrow_milestones_escrow_id_fkey
    foreign key (escrow_id) references public.escrow_contracts(id) on delete cascade,
  add constraint escrow_milestones_milestone_id_fkey
    foreign key (milestone_id) references public.milestones(id) on delete cascade;

-- RLS (ensure enabled)
alter table public.escrow_milestones enable row level security;

-- replace policies (owner-only por milestone → project)
drop policy if exists "Project owners can create escrow milestones" on public.escrow_milestones;
drop policy if exists "Project owners can view escrow milestones"   on public.escrow_milestones;
drop policy if exists "Project owners can update escrow milestones" on public.escrow_milestones;
drop policy if exists "Project owners can delete escrow milestones" on public.escrow_milestones;

-- helper predicate inline: the milestone must belong to a project whose kindler_id = next_auth.uid()
create policy "select escrow_milestones for owners"
on public.escrow_milestones
for select
to authenticated
using (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = next_auth.uid())
  )
);

create policy "insert escrow_milestones for owners"
on public.escrow_milestones
for insert
to authenticated
with check (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = next_auth.uid())
  )
);

create policy "update escrow_milestones for owners"
on public.escrow_milestones
for update
to authenticated
using (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = next_auth.uid())
  )
)
with check (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = next_auth.uid())
  )
);

create policy "delete escrow_milestones for owners"
on public.escrow_milestones
for delete
to authenticated
using (
  milestone_id IN (
    SELECT id FROM milestones
    WHERE project_id IN (SELECT id FROM projects WHERE kindler_id = next_auth.uid())
  )
);

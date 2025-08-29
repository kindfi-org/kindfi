/* 
  migration: add project_status enum, projects.status & projects.metadata + metadata versioning
  purpose:
    - create enum project_status (draft, review, active, paused, funded, rejected).
    - add columns status (enum) and metadata (jsonb) to public.projects.
    - create an index for status-based queries.
    - ensure pgcrypto is available for sha-256 hashing.
    - initialize metadata for existing rows (versions: [] and current_row_hash).
    - add triggers to:
        * before insert: set initial current_row_hash and ensure versions array.
        * before update: append a version entry with previous snapshot, changed fields, actor and timestamp; and update current_row_hash.

  affected:
    - type: public.project_status
    - table: public.projects (columns: status, metadata)
    - functions:
        * public.projects_set_initial_metadata()  -- trigger for inserts
        * public.projects_append_version()        -- trigger for updates
    - triggers:
        * trg_projects_set_initial_metadata (before insert)
        * trg_projects_append_version       (before update)

  assumptions:
    - metadata should keep an immutable change log under metadata.versions[].
    - current_row_hash stores a sha-256 of a canonical snapshot of the row (excluding volatile fields like metadata/created_at/updated_at).
    - actor is derived from the authenticated user id.

  safety:
    - creation is idempotent where possible (if not exists).
    - functions are created with create or replace.
    - triggers are dropped and recreated by name to avoid duplicates.
*/

-- ensure pgcrypto is available (required for sha-256 digest)
create extension if not exists "pgcrypto" with schema extensions;

-- create enum if it does not exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type public.project_status as enum ('draft','review','active','paused','funded','rejected');
  end if;
end$$;

-- add columns if they do not exist
alter table public.projects
  add column if not exists status   public.project_status not null default 'draft',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- index for status-based queries
create index if not exists projects_status_idx
  on public.projects(status);

-- preventive backfill (for rows that might have missed the default)
update public.projects
set status = 'draft'
where status is null;

-- ============================================================================
-- helper: compute canonical snapshot (jsonb) excluding volatile fields
-- we do not create a separate sql function to keep dependencies minimal.
-- the canonical snapshot is: to_jsonb(row) - ['metadata','created_at','updated_at']

-- backfill metadata for existing rows:
-- set metadata.versions to [] (if missing) and compute metadata.current_row_hash
-- using a canonical snapshot of the current row.
update public.projects p
set metadata = jsonb_set(
                 jsonb_set(
                   coalesce(p.metadata, '{}'::jsonb),
                   '{versions}',
                   coalesce(p.metadata->'versions', '[]'::jsonb),
                   true
                 ),
                 '{current_row_hash}',
                 to_jsonb(
                   'sha256:' ||
                   encode(
                     extensions.digest(
                       (jsonb_strip_nulls(to_jsonb(p) - array['metadata','created_at','updated_at']))::text,
                       'sha256'
                     ),
                     'hex'
                   )
                 ),
                 true
               )
where (p.metadata is null)
   or (p.metadata->>'current_row_hash') is null;

-- ============================================================================
-- trigger function: before insert -> set initial current_row_hash and ensure versions array
create or replace function public.projects_set_initial_metadata()
returns trigger
language plpgsql
as $fn$
declare
  new_snapshot jsonb;
  curr_hash text;
begin
  -- canonical snapshot of the incoming row (excluding volatile fields)
  new_snapshot := jsonb_strip_nulls(to_jsonb(new) - array['metadata','created_at','updated_at']);

  -- compute hash for the snapshot
  curr_hash := 'sha256:' ||
               encode(
                 extensions.digest(new_snapshot::text, 'sha256'),
                 'hex'
               );

  -- ensure metadata exists
  new.metadata := coalesce(new.metadata, '{}'::jsonb);

  -- ensure versions array exists
  new.metadata := jsonb_set(
                    new.metadata,
                    '{versions}',
                    coalesce(new.metadata->'versions', '[]'::jsonb),
                    true
                  );

  -- set current_row_hash
  new.metadata := jsonb_set(
                    new.metadata,
                    '{current_row_hash}',
                    to_jsonb(curr_hash),
                    true
                  );

  return new;
end;
$fn$;

-- recreate insert trigger
drop trigger if exists trg_projects_set_initial_metadata on public.projects;

create trigger trg_projects_set_initial_metadata
before insert on public.projects
for each row
execute function public.projects_set_initial_metadata();

-- ============================================================================
-- trigger function: before update -> append previous snapshot and update hash
create or replace function public.projects_append_version()
returns trigger
language plpgsql
as $fn$
declare
  old_snapshot jsonb;
  new_snapshot jsonb;

  prev_hash text;
  curr_hash text;

  actor uuid;
  changed_fields jsonb;
  entry jsonb;
begin
  -- build canonical snapshots (excluding volatile fields)
  old_snapshot := jsonb_strip_nulls(to_jsonb(old) - array['metadata','created_at','updated_at']);
  new_snapshot := jsonb_strip_nulls(to_jsonb(new) - array['metadata','created_at','updated_at']);

  -- if nothing relevant changed, skip
  if old_snapshot is not distinct from new_snapshot then
    return new;
  end if;

  -- compute hashes
  prev_hash := 'sha256:' || encode(extensions.digest(old_snapshot::text, 'sha256'), 'hex');
  curr_hash := 'sha256:' || encode(extensions.digest(new_snapshot::text, 'sha256'), 'hex');

  -- resolve actor from the authenticated user id (UUID)
  actor := coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
    nullif(
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'),
      ''
    )::uuid
  );

  -- detect changed fields by comparing key/value pairs
  changed_fields := coalesce((
    with
      e_old as (select key, value from jsonb_each(old_snapshot)),
      e_new as (select key, value from jsonb_each(new_snapshot))
    select jsonb_agg(k)
    from (
      select o.key as k
      from e_old o
      left join e_new n on n.key = o.key
      where o.value is distinct from n.value

      union

      select n.key as k
      from e_new n
      left join e_old o on o.key = n.key
      where n.value is distinct from o.value
    ) diff
  ), '[]'::jsonb);

  -- build version entry
  entry := jsonb_build_object(
    'prev_row_hash', prev_hash,
    'snapshot', old_snapshot,
    'changed_fields', changed_fields,
    'changed_by', actor,
    'changed_at', now()
  );

  -- ensure metadata exists
  new.metadata := coalesce(new.metadata, '{}'::jsonb);

  -- append entry to versions[]
  new.metadata := jsonb_set(
                    new.metadata,
                    '{versions}',
                    coalesce(new.metadata->'versions', '[]'::jsonb) || jsonb_build_array(entry),
                    true
                  );

  -- update current_row_hash
  new.metadata := jsonb_set(
                    new.metadata,
                    '{current_row_hash}',
                    to_jsonb(curr_hash),
                    true
                  );

  return new;
end;
$fn$;

-- recreate update trigger
drop trigger if exists trg_projects_append_version on public.projects;

create trigger trg_projects_append_version
before update on public.projects
for each row
execute function public.projects_append_version();

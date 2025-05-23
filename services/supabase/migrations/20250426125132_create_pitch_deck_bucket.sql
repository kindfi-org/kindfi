-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('project_pitch_decks', 'project_pitch_decks', false);

-- 2. Restrict file types
create policy "Restrict file types" on storage.objects
for insert to authenticated with check (
  bucket_id = 'project_pitch_decks'
  and (storage.extension(name) in ('pdf', 'ppt', 'pptx', 'key', 'odp'))
);

-- 3. Upload policy (project owners only)
create policy "Project owners can upload" on storage.objects
for insert to authenticated with check (
  bucket_id = 'project_pitch_decks'
  and auth.uid() = (
    select owner_id from projects 
    where id = (storage.foldername(name))[1]::uuid
  )
);

-- 4. View policy (owners + project members)
create policy "Project team can view" on storage.objects
for select using (
  bucket_id = 'project_pitch_decks'
  and (
    auth.uid() = (select owner_id from projects where id = (storage.foldername(name))[1]::uuid)
    or exists (
      select 1 from project_members
      where project_id = (storage.foldername(name))[1]::uuid
      and user_id = auth.uid()
    )
  )
);

-- 5. Delete policy (owners only)
create policy "Only owners can delete" on storage.objects
for delete using (
  bucket_id = 'project_pitch_decks'
  and auth.uid() = (
    select owner_id from projects 
    where id = (storage.foldername(name))[1]::uuid
  )
);
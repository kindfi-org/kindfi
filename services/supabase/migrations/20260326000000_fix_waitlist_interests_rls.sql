-- Fix waitlist signups blocked by RLS (especially insert().select() for authenticated users)

drop policy if exists "Allow public inserts" on public.waitlist_interests;

create policy "Allow public inserts"
  on public.waitlist_interests
  for insert
  to anon, authenticated
  with check (consent = true);

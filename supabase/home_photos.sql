create table if not exists public.home_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.home_photos enable row level security;

drop policy if exists "Public can view published home photos" on public.home_photos;
create policy "Public can view published home photos"
on public.home_photos
for select
to anon
using (published = true);

drop policy if exists "Authenticated can view home photos" on public.home_photos;
create policy "Authenticated can view home photos"
on public.home_photos
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert home photos" on public.home_photos;
create policy "Authenticated can insert home photos"
on public.home_photos
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update home photos" on public.home_photos;
create policy "Authenticated can update home photos"
on public.home_photos
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete home photos" on public.home_photos;
create policy "Authenticated can delete home photos"
on public.home_photos
for delete
to authenticated
using (true);

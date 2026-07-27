alter table public.galleries
add column if not exists cover_photo_id bigint null;

alter table public.galleries
drop constraint if exists galleries_cover_photo_id_fkey;

alter table public.galleries
add constraint galleries_cover_photo_id_fkey
foreign key (cover_photo_id)
references public.photos(id)
on delete set null;

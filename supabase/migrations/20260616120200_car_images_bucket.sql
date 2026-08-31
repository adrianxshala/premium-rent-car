-- ─────────────────────────────────────────────────────────────
-- Migration: public storage bucket for car photos.
-- next.config.ts already whitelists `*.supabase.co/storage/v1/object/public/**`.
-- Uploads run through the service-role client (admin route) which bypasses RLS;
-- these policies make reads public and keep direct writes admin-only.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('Car', 'Car', true)
on conflict (id) do nothing;

-- Anyone may read (the bucket is public anyway; this is explicit + future-proof).
create policy "car_images_public_read"
  on storage.objects for select
  using (bucket_id = 'Car');

create policy "car_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'Car' and public.is_admin());

create policy "car_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'Car' and public.is_admin());

create policy "car_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'Car' and public.is_admin());

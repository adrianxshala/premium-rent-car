-- ─────────────────────────────────────────────────────────────
-- Seed data for local development.
-- Applied automatically by `supabase db reset`. Safe to re-run:
-- fixed UUIDs + ON CONFLICT make it idempotent.
-- ─────────────────────────────────────────────────────────────

insert into public.cars (id, make, model, year, category, status, price_per_day, transmission, fuel_type, description, image_urls)
values
  ('a0000000-0000-0000-0000-000000000001', 'Toyota', 'RAV4', 2023, 'suv', 'available', 55, 'automatic', 'hybrid',
   'SUV kompakt me 4x4, ideal për familje dhe udhëtime jashtë qytetit. Bagazh i gjerë, konsum i ulët.', '{}'),
  ('a0000000-0000-0000-0000-000000000002', 'Volkswagen', 'Tiguan', 2022, 'suv', 'available', 50, 'automatic', 'diesel',
   'SUV komod me hapësirë të bollshme dhe sistem navigimi.', '{}'),
  ('a0000000-0000-0000-0000-000000000003', 'BMW', '320i', 2023, 'sedan', 'available', 65, 'automatic', 'petrol',
   'Sedan sportiv me performancë dhe komoditet premium.', '{}'),
  ('a0000000-0000-0000-0000-000000000004', 'Mercedes-Benz', 'C200', 2022, 'sedan', 'maintenance', 70, 'automatic', 'diesel',
   'Elegancë dhe teknologji e fundit. Aktualisht në mirëmbajtje.', '{}'),
  ('a0000000-0000-0000-0000-000000000005', 'Volkswagen', 'Golf', 2023, 'economy', 'available', 35, 'manual', 'petrol',
   'Hatchback ekonomik, i shkathët në qytet dhe me konsum të ulët.', '{}'),
  ('a0000000-0000-0000-0000-000000000006', 'Skoda', 'Fabia', 2021, 'economy', 'available', 28, 'manual', 'petrol',
   'Zgjedhja më e lirë, perfekte për lëvizje brenda qytetit.', '{}')
on conflict (id) do update set
  make          = excluded.make,
  model         = excluded.model,
  year          = excluded.year,
  category      = excluded.category,
  status        = excluded.status,
  price_per_day = excluded.price_per_day,
  transmission  = excluded.transmission,
  fuel_type     = excluded.fuel_type,
  description   = excluded.description;

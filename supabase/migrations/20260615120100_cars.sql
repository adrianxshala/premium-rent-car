-- ─────────────────────────────────────────────────────────────
-- Migration: cars (the fleet)
-- RLS: public read, admin write. Soft-delete via 'retired' (ADR-5).
-- ─────────────────────────────────────────────────────────────

create type public.car_status as enum ('available', 'maintenance', 'retired');
create type public.car_category as enum ('suv', 'sedan', 'economy');

create table public.cars (
  id              uuid primary key default gen_random_uuid(),
  make            text not null,
  model           text not null,
  year            smallint not null check (year between 1990 and 2100),
  category        public.car_category not null,
  status          public.car_status not null default 'available',
  price_per_day   numeric(10, 2) not null check (price_per_day >= 0),
  deposit         numeric(10, 2) not null check (deposit >= 0),
  description     text,
  image_urls      text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.cars is 'Rental fleet. Retired cars are kept for booking history.';

create index cars_status_idx on public.cars (status);
create index cars_category_idx on public.cars (category);

create trigger cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.cars enable row level security;

-- Anyone (even anonymous) may browse the fleet.
create policy "cars_select_public"
  on public.cars for select
  using (true);

create policy "cars_insert_admin"
  on public.cars for insert
  with check (public.is_admin());

create policy "cars_update_admin"
  on public.cars for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "cars_delete_admin"
  on public.cars for delete
  using (public.is_admin());

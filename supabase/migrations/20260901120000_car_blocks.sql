-- ─────────────────────────────────────────────────────────────
-- Migration: car_blocks (fleet calendar — dated maintenance / blocks)
--
-- Bookings model dated *rentals*. Two operational states carry dates
-- too but are NOT rentals: a car in the shop (maintenance) and a car
-- pulled from service for another reason (accident, cleaning, docs…).
-- `cars.status` is a single global flag with no dates, so it cannot
-- express "unavailable Sep 10 → Sep 12". This table adds that.
--
-- Dates are half-open [start_date, end_date) to match `bookings` — the
-- end day frees the car (a maintenance ending Sep 12 means the car is
-- back on Sep 12). This keeps every availability calculation in the app
-- on one consistent range model.
--
-- Scope: admin-only, consumed by /admin/calendar. The public booking
-- flow and its availability RPCs are intentionally left untouched.
-- ─────────────────────────────────────────────────────────────

create type public.car_block_kind as enum ('maintenance', 'unavailable');

create table public.car_blocks (
  id          uuid primary key default gen_random_uuid(),
  car_id      uuid not null references public.cars (id) on delete cascade,
  kind        public.car_block_kind not null,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint car_blocks_dates_valid check (end_date > start_date)
);

comment on table public.car_blocks is
  'Dated non-rental holds on a car (maintenance / unavailable). Half-open [start,end).';

create index car_blocks_car_idx on public.car_blocks (car_id);
create index car_blocks_range_idx on public.car_blocks (start_date, end_date);

-- Reuse the shared updated_at trigger (created with the profiles migration).
create trigger car_blocks_set_updated_at
  before update on public.car_blocks
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
-- Only admins read or write blocks; there is no user-facing surface.
alter table public.car_blocks enable row level security;

create policy "car_blocks_select_admin"
  on public.car_blocks for select
  using (public.is_admin());

create policy "car_blocks_insert_admin"
  on public.car_blocks for insert
  with check (public.is_admin());

create policy "car_blocks_update_admin"
  on public.car_blocks for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "car_blocks_delete_admin"
  on public.car_blocks for delete
  using (public.is_admin());

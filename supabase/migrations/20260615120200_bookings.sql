-- ─────────────────────────────────────────────────────────────
-- Migration: bookings
-- State machine + expires_at for pending reservations.
-- NOTE: the daterange EXCLUDE constraint (overlap prevention, ADR-3)
--       lands in Sprint 2 — this migration only creates the table.
-- ─────────────────────────────────────────────────────────────

create type public.booking_status as enum (
  'pending',
  'deposit_paid',
  'confirmed',
  'cancelled',
  'completed'
);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  car_id          uuid not null references public.cars (id) on delete restrict,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  start_date      date not null,
  end_date        date not null,
  status          public.booking_status not null default 'pending',
  total_price     numeric(10, 2) not null check (total_price >= 0),
  deposit_amount  numeric(10, 2) not null check (deposit_amount >= 0),
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint bookings_dates_valid check (end_date > start_date)
);

comment on table public.bookings is 'Reservations. pending rows expire at expires_at.';

create index bookings_user_idx on public.bookings (user_id);
create index bookings_car_idx on public.bookings (car_id);
create index bookings_status_idx on public.bookings (status);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.bookings enable row level security;

create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_select_admin"
  on public.bookings for select
  using (public.is_admin());

-- Users create bookings only for themselves. Pricing is re-computed and the
-- status is enforced server-side (Sprint 2) — RLS just scopes ownership here.
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_admin"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

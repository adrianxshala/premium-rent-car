-- ─────────────────────────────────────────────────────────────
-- Migration: payments (Paysera deposits)
-- paysera_order_id is unique → idempotent callbacks (ADR-2, Sprint 3).
-- ─────────────────────────────────────────────────────────────

create type public.payment_status as enum ('initiated', 'paid', 'failed');

create table public.payments (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings (id) on delete cascade,
  amount            numeric(10, 2) not null check (amount >= 0),
  currency          text not null default 'EUR',
  status            public.payment_status not null default 'initiated',
  paysera_order_id  text not null unique,
  raw_callback      jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.payments is 'Paysera payment attempts; one row per order id.';

create index payments_booking_idx on public.payments (booking_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.payments enable row level security;

-- A user can read payments that belong to their own bookings.
create policy "payments_select_own"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = payments.booking_id and b.user_id = auth.uid()
    )
  );

create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

-- Writes happen server-side via the service-role client (init + callback),
-- which bypasses RLS. No INSERT/UPDATE policy is granted to end users.

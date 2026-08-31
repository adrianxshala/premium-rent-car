-- ─────────────────────────────────────────────────────────────
-- Migration: remove the payment flow entirely
--
-- Product decision: bookings no longer take an online deposit. A
-- booking is created already `confirmed` (auto-confirm) and the whole
-- Paysera deposit machinery is dropped. This migration removes:
--   • the payments table + payment_status enum + confirm_deposit_payment()
--   • bookings.deposit_amount (the per-booking deposit is gone)
--   • the `deposit_paid` booking_status value (a payment artifact)
-- The no-overlap constraint and availability functions are rebuilt
-- without `deposit_paid`. `confirmed` is now the sole "paid/active"
-- hold status; a short-lived `pending` hold still counts while live.
-- ─────────────────────────────────────────────────────────────

-- ── 1. Drop the payment machinery ─────────────────────────────
drop function if exists public.confirm_deposit_payment(text, integer, text, jsonb);
drop table if exists public.payments cascade;       -- drops its index, trigger, policies
drop type if exists public.payment_status;

-- ── 2. Drop the per-booking deposit ───────────────────────────
alter table public.bookings drop column if exists deposit_amount;

-- ── 3. Rebuild booking_status without `deposit_paid` ──────────
-- The EXCLUDE constraint's predicate references status, so it must be
-- dropped before the column type can change, then recreated.
alter table public.bookings drop constraint if exists bookings_no_overlap;

alter table public.bookings alter column status drop default;

-- Any historical deposit_paid rows collapse to confirmed (the deposit
-- WAS the confirmation under the old flow).
update public.bookings set status = 'confirmed' where status = 'deposit_paid';

alter type public.booking_status rename to booking_status_old;
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);
alter table public.bookings
  alter column status type public.booking_status
  using status::text::public.booking_status;
alter table public.bookings alter column status set default 'pending';
drop type public.booking_status_old;

-- Recreate the overlap guard. "Active" (holds the car) is now a live
-- pending hold or a confirmed booking; cancelled/completed free the dates.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    car_id with =,
    daterange(start_date, end_date, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

comment on constraint bookings_no_overlap on public.bookings is
  'Rejects overlapping active bookings for the same car (ADR-3). Raises SQLSTATE 23P01.';

-- ── 4. Rebuild availability functions without `deposit_paid` ──
-- occupied ⇔ status = 'confirmed' OR (status = 'pending' AND live hold)
create or replace function public.car_booked_ranges(p_car_id uuid)
returns table (start_date date, end_date date)
language sql
security definer
set search_path = public
stable
as $$
  select b.start_date, b.end_date
  from public.bookings b
  where b.car_id = p_car_id
    and (
      b.status = 'confirmed'
      or (b.status = 'pending' and b.expires_at > now())
    );
$$;

create or replace function public.cars_booked_between(p_start date, p_end date)
returns table (car_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select distinct b.car_id
  from public.bookings b
  where (
      b.status = 'confirmed'
      or (b.status = 'pending' and b.expires_at > now())
    )
    and daterange(b.start_date, b.end_date, '[)')
        && daterange(p_start, p_end, '[)');
$$;

create or replace function public.is_car_available(
  p_car_id uuid,
  p_start date,
  p_end date
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1
    from public.bookings b
    where b.car_id = p_car_id
      and (
        b.status = 'confirmed'
        or (b.status = 'pending' and b.expires_at > now())
      )
      and daterange(b.start_date, b.end_date, '[)')
          && daterange(p_start, p_end, '[)')
  );
$$;

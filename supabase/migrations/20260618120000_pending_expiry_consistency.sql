-- ─────────────────────────────────────────────────────────────
-- Migration: pending-hold expiry + availability consistency
--
-- A `pending` booking holds its dates only until `expires_at`. The
-- three availability checks disagreed about this:
--   • cars_booked_between / car_booked_ranges ignored pending entirely
--     → a car looked free in search and in the calendar
--   • is_car_available + the bookings_no_overlap constraint counted
--     ALL pending, even long-expired ones
--     → the booking INSERT failed with "dates taken"
-- With no cron to release stale pending rows (Sprint 4 not built),
-- abandoned holds piled up and a car shown as free could not be booked.
--
-- This unifies the definition of an occupied date across every check:
--   occupied  ⇔  status in ('deposit_paid','confirmed')
--              OR (status = 'pending' AND expires_at > now())
-- so the calendar/search show exactly what the booking check enforces,
-- and adds expire_stale_bookings() to release dead holds (also the body
-- of the Sprint-4 expire-bookings job).
-- ─────────────────────────────────────────────────────────────

-- Release expired pending holds, freeing their dates. SECURITY DEFINER
-- so it bypasses RLS; only ever touches pending rows whose hold has
-- already lapsed, so it is safe + idempotent to call anytime.
create or replace function public.expire_stale_bookings()
returns integer
language sql
security definer
set search_path = public
as $$
  with expired as (
    update public.bookings
       set status = 'cancelled'
     where status = 'pending'
       and expires_at is not null
       and expires_at < now()
    returning 1
  )
  select count(*)::int from expired;
$$;

comment on function public.expire_stale_bookings() is
  'Cancels pending bookings past expires_at, freeing the dates. Returns count cancelled. Idempotent; also the Sprint-4 expire-bookings cron body.';

-- Calendar UI: dates shown as taken. Now includes LIVE pending holds so
-- what the calendar blocks matches what the booking check enforces;
-- expired pendings are treated as free.
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
      b.status in ('deposit_paid', 'confirmed')
      or (b.status = 'pending' and b.expires_at > now())
    );
$$;

-- Search filter: car ids with an active booking overlapping [p_start, p_end).
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
      b.status in ('deposit_paid', 'confirmed')
      or (b.status = 'pending' and b.expires_at > now())
    )
    and daterange(b.start_date, b.end_date, '[)')
        && daterange(p_start, p_end, '[)');
$$;

-- Server-side pre-check: mirrors the exact same definition.
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
        b.status in ('deposit_paid', 'confirmed')
        or (b.status = 'pending' and b.expires_at > now())
      )
      and daterange(b.start_date, b.end_date, '[)')
          && daterange(p_start, p_end, '[)')
  );
$$;

grant execute on function public.expire_stale_bookings() to anon, authenticated, service_role;

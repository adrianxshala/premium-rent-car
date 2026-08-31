-- ─────────────────────────────────────────────────────────────
-- Migration: cars booked between dates (search availability)
-- The hero search hands off a [from, to) range to the listing,
-- which must hide cars that are already taken for that period.
-- RLS on `bookings` only exposes a user's OWN rows, so this
-- SECURITY DEFINER function bypasses RLS and returns nothing but
-- the car ids that have an overlapping active booking.
--
-- Mirrors `car_booked_ranges` (deposit_paid + confirmed only) so
-- search results match what the calendar shows as taken. Short-lived
-- `pending` holds are excluded here too; the INSERT-time
-- `is_car_available` check + DB constraint remain the final arbiter.
-- ─────────────────────────────────────────────────────────────

create or replace function public.cars_booked_between(p_start date, p_end date)
returns table (car_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select distinct b.car_id
  from public.bookings b
  where b.status in ('deposit_paid', 'confirmed')
    and daterange(b.start_date, b.end_date, '[)')
        && daterange(p_start, p_end, '[)');
$$;

comment on function public.cars_booked_between(date, date) is
  'Car ids with an active booking overlapping [p_start, p_end). For search filtering; exposes ids only, bypasses RLS.';

grant execute on function public.cars_booked_between(date, date) to anon, authenticated;

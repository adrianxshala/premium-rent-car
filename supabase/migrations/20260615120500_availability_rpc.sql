-- ─────────────────────────────────────────────────────────────
-- Migration: availability RPC
-- RLS on `bookings` only exposes a user's OWN rows, but the calendar
-- and the server-side pre-check need to know which dates ANY active
-- booking holds. These SECURITY DEFINER functions bypass RLS while
-- leaking nothing but dates (no user_id, no prices).
-- ─────────────────────────────────────────────────────────────

-- Active booked ranges shown as "taken" in the calendar UI.
-- pending is intentionally excluded — it is short-lived and the
-- server-side INSERT check (is_car_available) + DB constraint still
-- guard against picking a pending-held date.
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
    and b.status in ('deposit_paid', 'confirmed');
$$;

comment on function public.car_booked_ranges(uuid) is
  'Booked date ranges for a car (calendar UI). Exposes dates only, bypasses RLS.';

-- Server-side overlap pre-check. Mirrors the bookings_no_overlap
-- constraint (same active statuses, same half-open range) so callers
-- get a clean answer before the INSERT; the constraint stays the
-- final arbiter under concurrency.
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
      and b.status in ('pending', 'deposit_paid', 'confirmed')
      and daterange(b.start_date, b.end_date, '[)')
          && daterange(p_start, p_end, '[)')
  );
$$;

comment on function public.is_car_available(uuid, date, date) is
  'True if no active booking overlaps [p_start, p_end) for the car. Bypasses RLS.';

grant execute on function public.car_booked_ranges(uuid) to anon, authenticated;
grant execute on function public.is_car_available(uuid, date, date) to authenticated;

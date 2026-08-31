-- ─────────────────────────────────────────────────────────────
-- Migration: guest bookings
-- Lets a visitor book without an account. The booking flow now
-- collects contact details up front (name/email/phone) and pays the
-- deposit before any account is required. Auth is untouched: a
-- logged-in user still gets the booking linked to their profile.
--
-- Changes:
--   • user_id becomes nullable (guests have no profile row)
--   • customer_name / customer_email / customer_phone on every booking
--   • access_token — an unguessable per-booking secret so a guest can
--     start the payment and view the confirmation without logging in
--     (RLS exposes nothing to anon; these reads go through the
--     service-role API/page, gated by this token)
-- ─────────────────────────────────────────────────────────────

alter table public.bookings
  alter column user_id drop not null;

alter table public.bookings
  add column customer_name  text,
  add column customer_email text,
  add column customer_phone text,
  add column access_token   uuid not null default gen_random_uuid();

-- Every booking must be reachable by someone: a logged-in owner OR a
-- guest identified by email. New guest rows always carry the contact
-- fields (enforced app-side); legacy rows keep their user_id.
alter table public.bookings
  add constraint bookings_has_contact
  check (user_id is not null or customer_email is not null);

comment on column public.bookings.access_token is
  'Unguessable per-booking secret. Lets a guest start payment and view '
  'confirmation without auth; never returned through public RLS reads.';

-- The confirmation page / payment init look a booking up by token.
create index bookings_access_token_idx on public.bookings (access_token);

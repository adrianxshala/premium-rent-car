-- ─────────────────────────────────────────────────────────────
-- Migration: allow phone as a contact path (offline / admin bookings)
-- An admin recording a walk-in rental at the shop has the customer's
-- phone in hand, not necessarily an email. Broaden bookings_has_contact
-- so a booking is reachable by ANY of: linked account, email, or phone.
-- The public online flow still collects email; this only relaxes the
-- floor for manually-created offline bookings (created already confirmed).
-- ─────────────────────────────────────────────────────────────

alter table public.bookings
  drop constraint bookings_has_contact;

alter table public.bookings
  add constraint bookings_has_contact
  check (
    user_id is not null
    or customer_email is not null
    or customer_phone is not null
  );

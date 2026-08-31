-- ─────────────────────────────────────────────────────────────
-- Migration: bookings overlap prevention (ADR-3)
-- Concurrency is enforced at the DB, not the app: serverless runs
-- parallel instances, so two requests can pass an app-level check at
-- the same time. An EXCLUDE constraint makes the database the single
-- arbiter — overlapping ranges for the same car simply cannot commit.
-- ─────────────────────────────────────────────────────────────

-- gist operator class for the uuid `=` part of the EXCLUDE constraint.
create extension if not exists btree_gist;

-- A car cannot be held by two active bookings on overlapping dates.
-- Range is half-open [start, end): a return on day N frees day N for a
-- new pickup. "Active" = a booking that holds the car right now:
--   pending (awaiting deposit, until expires_at), deposit_paid, confirmed.
-- cancelled/completed rows are excluded, so they free the dates.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    car_id with =,
    daterange(start_date, end_date, '[)') with &&
  )
  where (status in ('pending', 'deposit_paid', 'confirmed'));

comment on constraint bookings_no_overlap on public.bookings is
  'Rejects overlapping active bookings for the same car (ADR-3). Raises SQLSTATE 23P01.';

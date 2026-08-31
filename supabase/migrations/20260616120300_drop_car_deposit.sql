-- ─────────────────────────────────────────────────────────────
-- Migration: drop unused `cars.deposit`.
-- The deposit a customer pays is derived per-booking (20% of total,
-- lib/bookings/pricing.ts) and stored on `bookings.deposit_amount`.
-- The static per-car `deposit` was never used and is removed.
-- ─────────────────────────────────────────────────────────────

alter table public.cars drop column if exists deposit;

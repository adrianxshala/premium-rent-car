-- ─────────────────────────────────────────────────────────────
-- Migration: add transmission + fuel_type to cars
-- Defaults keep existing rows valid; admins set these per car.
-- ─────────────────────────────────────────────────────────────

create type public.transmission as enum ('automatic', 'manual');
create type public.fuel_type as enum ('petrol', 'diesel', 'hybrid', 'electric');

alter table public.cars
  add column transmission public.transmission not null default 'manual',
  add column fuel_type    public.fuel_type    not null default 'petrol';

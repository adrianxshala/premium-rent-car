-- ─────────────────────────────────────────────────────────────
-- Migration: confirm_deposit_payment (Sprint 3, Paysera callback)
-- The callback must flip payment→paid AND booking→confirmed as ONE
-- atomic unit (ADR-2: confirmation happens only server-to-server).
-- The Supabase JS client cannot wrap multiple statements in a single
-- transaction, so the whole effect lives in this SECURITY DEFINER
-- function: it locks the rows, re-checks amount, is idempotent on a
-- repeated callback, and walks the booking pending → deposit_paid →
-- confirmed in one shot.
-- ─────────────────────────────────────────────────────────────

-- Result codes (consumed by the callback route to decide the HTTP reply):
--   'confirmed'        — payment marked paid, booking now confirmed
--   'already_paid'     — duplicate callback, nothing changed (idempotent OK)
--   'not_found'        — no payment row for this order id
--   'amount_mismatch'  — payload amount/currency ≠ what we recorded at init
create or replace function public.confirm_deposit_payment(
  p_order_id     text,
  p_amount_cents integer,
  p_currency     text,
  p_raw          jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments;
begin
  -- Lock the payment row so two concurrent callbacks serialize here.
  select * into v_payment
  from public.payments
  where paysera_order_id = p_order_id
  for update;

  if not found then
    return 'not_found';
  end if;

  -- Idempotency: a repeated callback after success is a no-op success.
  if v_payment.status = 'paid' then
    return 'already_paid';
  end if;

  -- Amount/currency must match exactly what we asked Paysera to collect.
  -- payments.amount is EUR with 2 decimals; the callback reports cents.
  if round(v_payment.amount * 100)::integer is distinct from p_amount_cents
     or upper(v_payment.currency) is distinct from upper(p_currency) then
    return 'amount_mismatch';
  end if;

  update public.payments
  set status = 'paid', raw_callback = p_raw
  where id = v_payment.id;

  -- pending → deposit_paid → confirmed. The deposit IS the confirmation,
  -- so we land on confirmed. Guard the source status to stay idempotent
  -- if the booking was already advanced (e.g. by an admin).
  update public.bookings
  set status = 'confirmed'
  where id = v_payment.booking_id
    and status in ('pending', 'deposit_paid');

  return 'confirmed';
end;
$$;

comment on function public.confirm_deposit_payment(text, integer, text, jsonb) is
  'Atomically marks a Paysera deposit paid and confirms its booking. '
  'Idempotent on repeated callbacks; validates amount/currency. Service-role only.';

-- Only the service-role client (callback handler) may call this; end users
-- never confirm their own payments.
revoke all on function public.confirm_deposit_payment(text, integer, text, jsonb) from public, anon, authenticated;

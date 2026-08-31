import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export type DateRange = {
  /** 'YYYY-MM-DD', inclusive start. */
  start: string
  /** 'YYYY-MM-DD', exclusive end (half-open [start, end)). */
  end: string
}

/**
 * Server-side overlap check, via the `is_car_available` RPC (SECURITY DEFINER
 * so it sees all active bookings, not just the caller's under RLS). This gives
 * a clean answer before the INSERT; the `bookings_no_overlap` DB constraint
 * remains the final arbiter under concurrency (ADR-3).
 */
export async function isCarAvailable(
  supabase: Client,
  carId: string,
  startDate: string,
  endDate: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_car_available', {
    p_car_id: carId,
    p_start: startDate,
    p_end: endDate,
  })

  if (error) throw error
  return data === true
}

/**
 * Booked date ranges for a car, for the calendar UI. Uses the
 * `car_booked_ranges` RPC so anonymous visitors see taken dates without RLS
 * exposing other users' bookings.
 */
export async function getBookedRanges(
  supabase: Client,
  carId: string,
): Promise<DateRange[]> {
  const { data, error } = await supabase.rpc('car_booked_ranges', {
    p_car_id: carId,
  })

  if (error) throw error
  return (data ?? []).map((r) => ({ start: r.start_date, end: r.end_date }))
}

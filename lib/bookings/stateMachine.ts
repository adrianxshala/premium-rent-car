import type { Enums } from '@/types/database'

export type BookingStatus = Enums<'booking_status'>

/**
 * Allowed booking status transitions. Bookings are created already
 * `confirmed` (auto-confirm; there is no online payment). `pending` is kept
 * for any future hold flow but is not produced today. Any transition not
 * listed here is rejected.
 */
export const BOOKING_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
}

/** Whether `from → to` is a permitted transition. */
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to)
}

/** Throws if the transition is not allowed. */
export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid booking transition: ${from} → ${to}`)
  }
}

/** A booking in one of these statuses still holds the car's dates. */
export const ACTIVE_BOOKING_STATUSES = [
  'pending',
  'confirmed',
] as const satisfies readonly BookingStatus[]

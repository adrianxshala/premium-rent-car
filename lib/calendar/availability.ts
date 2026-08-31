/**
 * The fleet calendar's availability engine — the single, reusable source of
 * truth for "is this car free, and if not, why?". Availability is NEVER read
 * off `car.status` alone (per the feature spec): it is derived from
 *
 *     car.status  +  confirmed/pending bookings  +  maintenance/unavailable blocks
 *
 * All functions are pure and range-model-consistent (half-open [start, end)),
 * so the same logic runs in a Server Component to prefetch and in the client to
 * render, and can be unit-tested in isolation.
 */

import { isWithin, rangesOverlap } from '@/lib/calendar/dates'
import type { ISODate } from '@/lib/calendar/dates'
import type {
  CalendarBlock,
  CalendarBooking,
  CalendarEvent,
  CalendarStatus,
  Conflict,
  EventPhase,
  TodayOps,
} from '@/lib/calendar/types'

/** A booking in one of these statuses no longer holds the car's dates. */
const FREED_STATUSES = new Set(['cancelled'])

/**
 * Resolve a confirmed/pending/completed booking to a timeline phase, relative
 * to `today`. `cancelled` is filtered out upstream and never reaches here.
 */
export function bookingPhase(
  booking: Pick<CalendarBooking, 'status' | 'start_date' | 'end_date'>,
  today: ISODate,
): EventPhase {
  if (booking.status === 'pending') return 'pending'
  if (booking.status === 'completed') return 'completed'
  // confirmed → position it against today.
  if (today < booking.start_date) return 'reserved'
  if (isWithin(today, booking.start_date, booking.end_date)) return 'rented'
  return 'completed' // confirmed but already returned
}

/**
 * Fold bookings + blocks into one ordered list of positioned events.
 * Cancelled bookings are dropped (they hold nothing).
 */
export function toEvents(
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  today: ISODate,
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  for (const b of bookings) {
    if (FREED_STATUSES.has(b.status)) continue
    events.push({
      id: `booking:${b.id}`,
      kind: 'booking',
      phase: bookingPhase(b, today),
      carId: b.car_id,
      start: b.start_date,
      end: b.end_date,
      booking: b,
    })
  }

  for (const bl of blocks) {
    events.push({
      id: `block:${bl.id}`,
      kind: 'block',
      phase: bl.kind, // 'maintenance' | 'unavailable'
      carId: bl.car_id,
      start: bl.start_date,
      end: bl.end_date,
      block: bl,
    })
  }

  return events
}

/** An event that actually occupies the car (blocks availability). */
function isOccupying(e: CalendarEvent): boolean {
  if (e.kind === 'block') return true
  return e.phase === 'pending' || e.phase === 'reserved' || e.phase === 'rented'
}

/**
 * Derive the availability state of a single vehicle on a single day from all
 * its events plus its base status. Precedence, strongest first:
 *   retired car → unavailable · block → maintenance/unavailable ·
 *   active booking → rented/reserved · otherwise → available.
 */
export function dayStatus(
  carStatus: 'available' | 'maintenance' | 'retired',
  events: CalendarEvent[],
  day: ISODate,
): CalendarStatus {
  if (carStatus === 'retired') return 'unavailable'

  const covering = events.filter((e) => isWithin(day, e.start, e.end))

  const unavailable = covering.find((e) => e.phase === 'unavailable')
  if (unavailable) return 'unavailable'

  const maintenance = covering.find((e) => e.phase === 'maintenance')
  if (maintenance) return 'maintenance'

  const rented = covering.find((e) => e.phase === 'rented')
  if (rented) return 'rented'

  const held = covering.find(
    (e) => e.phase === 'reserved' || e.phase === 'pending',
  )
  if (held) return 'reserved'

  // A car flagged `maintenance` globally but with no dated block is treated as
  // in-maintenance for the whole view (the flag is its only signal).
  if (carStatus === 'maintenance') return 'maintenance'

  return 'available'
}

/**
 * Detect overlapping occupying events on the same car. Booking↔booking and
 * booking↔block overlaps are surfaced (a car can't be rented while it's also
 * booked or in the shop); block↔block is ignored (two overlapping holds are
 * harmless). The DB EXCLUDE constraint already prevents booking↔booking
 * overlaps at insert time, so this mostly catches booking↔block clashes and
 * any legacy data — but it must never hide a clash.
 */
export function detectConflicts(events: CalendarEvent[]): Conflict[] {
  const occupying = events.filter(isOccupying)
  const byCar = new Map<string, CalendarEvent[]>()
  for (const e of occupying) {
    const list = byCar.get(e.carId) ?? []
    list.push(e)
    byCar.set(e.carId, list)
  }

  const conflicts: Conflict[] = []
  for (const [carId, list] of byCar) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        if (a.kind === 'block' && b.kind === 'block') continue
        if (rangesOverlap(a.start, a.end, b.start, b.end)) {
          conflicts.push({ carId, a, b })
        }
      }
    }
  }
  return conflicts
}

/**
 * Operational counters for a single day (`today`). Feed it the bookings and
 * blocks that touch that day. Pickups/returns are exact-day events; a return
 * frees the car, so `end_date === today` is a return. `attention` (conflicts)
 * is computed separately from the visible range and merged by the caller.
 */
export function todayOpsFromDay(
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  today: ISODate,
): Omit<TodayOps, 'attention'> {
  const pickups = bookings.filter(
    (b) =>
      b.start_date === today &&
      (b.status === 'confirmed' || b.status === 'pending'),
  ).length

  const returns = bookings.filter(
    (b) =>
      b.end_date === today &&
      (b.status === 'confirmed' || b.status === 'completed'),
  ).length

  const maintenance = blocks.filter(
    (bl) => bl.kind === 'maintenance' && isWithin(today, bl.start_date, bl.end_date),
  ).length

  return { pickups, returns, maintenance }
}

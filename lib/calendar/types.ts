import type { Enums } from '@/types/database'
import type { ISODate } from '@/lib/calendar/dates'

/** Week (7 days) or the full calendar month. */
export type CalendarView = 'week' | 'month'

/** The minimal car shape the calendar needs — one row per vehicle. */
export type VehicleLite = {
  id: string
  make: string
  model: string
  year: number
  category: Enums<'car_category'>
  status: Enums<'car_status'>
  image_url: string | null
}

/** A booking, trimmed to what the timeline + drawer render. */
export type CalendarBooking = {
  id: string
  car_id: string
  status: Enums<'booking_status'>
  start_date: ISODate
  end_date: ISODate
  total_price: number
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
}

/** A dated maintenance / unavailable hold. */
export type CalendarBlock = {
  id: string
  car_id: string
  kind: Enums<'car_block_kind'>
  start_date: ISODate
  end_date: ISODate
  reason: string | null
  note: string | null
}

/**
 * How an event reads on the timeline. Bookings resolve to one of the first
 * four (relative to today); blocks carry their own kind.
 */
export type EventPhase =
  | 'pending'
  | 'reserved'
  | 'rented'
  | 'completed'
  | 'maintenance'
  | 'unavailable'

/** A positioned bar on a vehicle row — either a booking or a block. */
export type CalendarEvent = {
  id: string
  kind: 'booking' | 'block'
  phase: EventPhase
  carId: string
  /** Actual, unclamped range of the event. */
  start: ISODate
  end: ISODate
  booking?: CalendarBooking
  block?: CalendarBlock
}

/** Two occupying events on the same car whose dates overlap. */
export type Conflict = {
  carId: string
  a: CalendarEvent
  b: CalendarEvent
}

/** Operational counters for "today". */
export type TodayOps = {
  pickups: number
  returns: number
  maintenance: number
  attention: number
}

/** The derived, ready-to-render availability state for a single day. */
export type CalendarStatus =
  | 'available'
  | 'reserved'
  | 'rented'
  | 'maintenance'
  | 'unavailable'

import { createClient } from '@/lib/supabase/server'
import {
  addDaysISO,
  endOfMonthExclusiveISO,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
} from '@/lib/calendar/dates'
import { todayOpsFromDay } from '@/lib/calendar/availability'
import type {
  CalendarBlock,
  CalendarBooking,
  CalendarView,
  VehicleLite,
} from '@/lib/calendar/types'
import { FleetCalendar } from '@/components/admin/calendar/fleet-calendar'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function resolveRange(view: CalendarView, anchor: string) {
  if (view === 'month') {
    return {
      start: startOfMonthISO(anchor),
      end: endOfMonthExclusiveISO(anchor),
    }
  }
  const start = startOfWeekISO(anchor)
  return { start, end: addDaysISO(start, 7) }
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const { view: viewParam, date: dateParam } = await searchParams
  const view: CalendarView = viewParam === 'month' ? 'month' : 'week'
  const today = todayISO()
  const anchor =
    dateParam && ISO_DATE.test(dateParam) ? dateParam : today

  const { start: rangeStart, end: rangeEnd } = resolveRange(view, anchor)

  const supabase = await createClient()

  // Fetch only what intersects the visible window (+ today for the ops bar).
  // A booking/block [s, e) intersects [rangeStart, rangeEnd) iff
  // s < rangeEnd AND e > rangeStart.
  const [carsRes, bookingsRes, blocksRes, todayBookingsRes, todayBlocksRes] =
    await Promise.all([
      supabase
        .from('cars')
        .select('id, make, model, year, category, status, image_urls')
        .neq('status', 'retired')
        .order('make', { ascending: true })
        .order('model', { ascending: true }),
      supabase
        .from('bookings')
        .select(
          'id, car_id, status, start_date, end_date, total_price, customer_name, customer_phone, customer_email',
        )
        .neq('status', 'cancelled')
        .lt('start_date', rangeEnd)
        .gt('end_date', rangeStart),
      supabase
        .from('car_blocks')
        .select('id, car_id, kind, start_date, end_date, reason, note')
        .lt('start_date', rangeEnd)
        .gt('end_date', rangeStart),
      supabase
        .from('bookings')
        .select('id, status, start_date, end_date')
        .neq('status', 'cancelled')
        .or(`start_date.eq.${today},end_date.eq.${today}`),
      supabase
        .from('car_blocks')
        .select('id, kind, start_date, end_date')
        .lte('start_date', today)
        .gt('end_date', today),
    ])

  const vehicles: VehicleLite[] = (carsRes.data ?? []).map((c) => ({
    id: c.id,
    make: c.make,
    model: c.model,
    year: c.year,
    category: c.category,
    status: c.status,
    image_url: c.image_urls[0] ?? null,
  }))

  const bookings = (bookingsRes.data ?? []) as CalendarBooking[]
  const blocks = (blocksRes.data ?? []) as CalendarBlock[]

  const todayOps = todayOpsFromDay(
    (todayBookingsRes.data ?? []).map((b) => ({
      id: b.id,
      car_id: '',
      status: b.status,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: 0,
      customer_name: null,
      customer_phone: null,
      customer_email: null,
    })),
    (todayBlocksRes.data ?? []).map((bl) => ({
      id: bl.id,
      car_id: '',
      kind: bl.kind,
      start_date: bl.start_date,
      end_date: bl.end_date,
      reason: null,
      note: null,
    })),
    today,
  )

  return (
    <FleetCalendar
      vehicles={vehicles}
      bookings={bookings}
      blocks={blocks}
      view={view}
      anchor={anchor}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      today={today}
      todayOps={todayOps}
    />
  )
}

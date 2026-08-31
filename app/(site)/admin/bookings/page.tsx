import Link from 'next/link'
import { CalendarClock, CarFront, Plus, SearchX, User } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { BOOKING_STATUS_LABELS, formatDate, formatEur } from '@/lib/format'
import { Constants, type Enums } from '@/types/database'
import { Reveal } from '@/components/motion/primitives'
import { BookingStatusControl } from '@/components/admin/booking-status-control'
import { BookingsFilter } from '@/components/admin/bookings-filter'

function isBookingStatus(v?: string): v is Enums<'booking_status'> {
  return (
    v !== undefined &&
    (Constants.public.Enums.booking_status as readonly string[]).includes(v)
  )
}

type AdminBooking = {
  id: string
  status: Enums<'booking_status'>
  start_date: string
  end_date: string
  total_price: number
  car: { make: string; model: string; year: number } | null
  customer: string | null
}

const STATUS_TONES: Record<Enums<'booking_status'>, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-secondary text-muted-foreground',
  cancelled: 'bg-red-50 text-red-700',
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status: statusParam, q } = await searchParams
  const status = isBookingStatus(statusParam) ? statusParam : undefined
  const term = q?.trim().toLowerCase() ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('bookings')
    .select(
      'id, status, start_date, end_date, total_price, customer_name, cars(make, model, year), profiles(full_name)',
    )
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data } = await query

  const all: AdminBooking[] = (data ?? []).map((b) => {
    const car = Array.isArray(b.cars) ? (b.cars[0] ?? null) : (b.cars ?? null)
    const prof = Array.isArray(b.profiles)
      ? (b.profiles[0] ?? null)
      : (b.profiles ?? null)
    return {
      id: b.id,
      status: b.status,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: b.total_price,
      car: car ? { make: car.make, model: car.model, year: car.year } : null,
      // Guest bookings carry the name on the row; logged-in ones fall back to
      // the linked profile.
      customer: b.customer_name ?? prof?.full_name ?? null,
    }
  })

  // Free-text search over customer + car (small dataset → in-memory is fine).
  const bookings = term
    ? all.filter((b) => {
        const haystack =
          `${b.customer ?? ''} ${b.car ? `${b.car.make} ${b.car.model} ${b.car.year}` : ''}`.toLowerCase()
        return haystack.includes(term)
      })
    : all

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            Operacionet
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Rezervimet
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Të gjitha rezervimet e klientëve. Ndrysho statusin manualisht sipas
            rrjedhës së lejuar.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/bookings/new">
            <Plus className="size-4" aria-hidden />
            Rezervim manual
          </Link>
        </Button>
      </div>

      <BookingsFilter status={status} q={q} />

      {bookings.length > 0 ? (
        <Reveal y={6} duration={0.4} className="flex flex-col gap-3" inView={false}>
          {bookings.map((b) => (
            <div
              key={b.id}
              className="shadow-soft rounded-[24px] bg-white p-4 ring-1 ring-black/[0.04] sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="bg-secondary text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
                    <CarFront className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold tracking-tight">
                      {b.car
                        ? `${b.car.make} ${b.car.model} ${b.car.year}`
                        : 'Makinë e panjohur'}
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="size-3.5" aria-hidden />
                        {b.customer ?? 'Klient'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" aria-hidden />
                        {formatDate(b.start_date)} → {formatDate(b.end_date)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{formatEur(b.total_price)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONES[b.status]}`}
                >
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
                <BookingStatusControl id={b.id} status={b.status} />
              </div>
            </div>
          ))}
        </Reveal>
      ) : (
        <Reveal inView={false}>
          <div className="panel flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
              {status || term ? (
                <SearchX className="size-6" aria-hidden />
              ) : (
                <CalendarClock className="size-6" aria-hidden />
              )}
            </span>
            <p className="text-lg font-semibold tracking-tight">
              {status || term
                ? 'Asnjë rezervim s’përputhet me filtrin'
                : 'Ende pa rezervime'}
            </p>
          </div>
        </Reveal>
      )}
    </>
  )
}

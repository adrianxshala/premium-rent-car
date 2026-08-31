import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarClock, CarFront, CheckCircle2, XCircle } from 'lucide-react'

import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatEur } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { PageReveal } from '@/components/motion/primitives'

/**
 * Public, token-gated confirmation page — the landing spot after a booking is
 * created. No login required: the booking is read with the service-role client
 * and gated by the access_token on the URL, so a guest sees only their own
 * booking and nothing leaks via RLS.
 *
 * Bookings are auto-confirmed at creation (no online payment), so this normally
 * shows the confirmed state; a booking an admin later cancelled shows that.
 */
export default async function BookingConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { id } = await params
  const { token } = await searchParams

  if (!token) notFound()

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select(
      'id, car_id, access_token, status, start_date, end_date, total_price, customer_name, cars(make, model, year)',
    )
    .eq('id', id)
    .maybeSingle()

  // Unknown booking or wrong token → 404 (indistinguishable, no info leak).
  if (!booking || booking.access_token !== token) notFound()

  const car = Array.isArray(booking.cars)
    ? (booking.cars[0] ?? null)
    : (booking.cars ?? null)
  const carTitle = car
    ? `${car.make} ${car.model} ${car.year}`
    : 'Makina e rezervuar'

  const view: 'confirmed' | 'cancelled' =
    booking.status === 'cancelled' ? 'cancelled' : 'confirmed'

  const COPY = {
    confirmed: {
      icon: <CheckCircle2 className="size-7" aria-hidden />,
      tone: 'bg-emerald-50 text-emerald-700',
      title: 'Rezervimi u konfirmua',
      body: 'Të dërguam një email me detajet e rezervimit. Pagesa kryhet në marrjen e makinës.',
    },
    cancelled: {
      icon: <XCircle className="size-7" aria-hidden />,
      tone: 'bg-secondary text-muted-foreground',
      title: 'Rezervimi u anulua',
      body: 'Ky rezervim është anuluar. Mund të bësh një rezervim të ri nga faqja e makinës.',
    },
  }[view]

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[18%] -left-[12%] size-[28rem] bg-indigo-200/30" />
        <div className="blob top-[62%] -right-[10%] size-[24rem] bg-emerald-200/25" />
      </div>

      <PageReveal className="mx-auto w-full max-w-lg flex-1 px-6 py-12 sm:py-16">
        <section className="panel p-6 text-center sm:p-8">
          <span
            className={`mx-auto flex size-14 items-center justify-center rounded-full ${COPY.tone}`}
          >
            {COPY.icon}
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {COPY.title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty">
            {COPY.body}
          </p>

          <dl className="mt-7 rounded-2xl bg-black/[0.025] p-4 text-left text-sm">
            <Row
              icon={<CarFront className="size-4" aria-hidden />}
              label="Makina"
              value={carTitle}
            />
            <Row
              icon={<CalendarClock className="size-4" aria-hidden />}
              label="Datat"
              value={`${formatDate(booking.start_date)} → ${formatDate(booking.end_date)}`}
            />
            <div className="mt-2 flex items-center justify-between border-t border-black/[0.06] pt-3 font-semibold">
              <dt>Totali</dt>
              <dd>{formatEur(booking.total_price)}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            {view === 'cancelled' && (
              <Button asChild className="rounded-full">
                <Link href={`/cars/${booking.car_id}`}>Provo sërish</Link>
              </Button>
            )}
            <Button
              asChild
              variant={view === 'cancelled' ? 'outline' : 'default'}
              className="rounded-full"
            >
              <Link href="/cars">Shfleto makinat</Link>
            </Button>
          </div>
        </section>
      </PageReveal>
    </>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted-foreground inline-flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

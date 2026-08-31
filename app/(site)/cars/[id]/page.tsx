import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, Cog, Fuel, Tag } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getProfile, getUser } from '@/lib/auth/dal'
import { getBookedRanges } from '@/lib/bookings/availability'
import {
  CATEGORY_LABELS,
  FUEL_LABELS,
  STATUS_LABELS,
  TRANSMISSION_LABELS,
} from '@/lib/format'
import { PageReveal, Reveal } from '@/components/motion/primitives'
import { CarGallery } from '@/components/cars/car-gallery'
import { BookingPanel } from '@/components/cars/booking-panel'

/** A 'YYYY-MM-DD' string, or undefined if it isn't a real calendar date. */
function parseISODate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : value
}

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { id } = await params
  const { from, to } = await searchParams
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!car || car.status === 'retired') notFound()

  const [bookedRanges, user, profile] = await Promise.all([
    getBookedRanges(supabase, car.id),
    getUser(),
    getProfile(),
  ])

  const title = `${car.make} ${car.model}`
  const available = car.status === 'available'

  // Dates carried over from the search — prefill the booking form with them.
  const initialFrom = parseISODate(from)
  const initialTo = parseISODate(to)

  return (
    <>
      {/* Ambient blurred blobs for depth, matching the home page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[16%] -left-[12%] size-[30rem] bg-indigo-200/30" />
        <div className="blob top-[64%] -right-[10%] size-[24rem] bg-emerald-200/25" />
      </div>

      <PageReveal className="mx-auto w-full max-w-6xl flex-1 px-6 pt-6 pb-12">
        <Link
          href="/cars"
          className="glass shadow-soft text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-black/[0.04] transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Të gjitha makinat
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="flex flex-col gap-8">
            <CarGallery images={car.image_urls} alt={title} />

            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {title}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    available
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                  />
                  {STATUS_LABELS[car.status]}
                </span>
              </div>

              {/* Spec chips */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <SpecChip
                  icon={<CalendarDays className="size-4" aria-hidden />}
                  label="Viti"
                  value={String(car.year)}
                />
                <SpecChip
                  icon={<Tag className="size-4" aria-hidden />}
                  label="Kategoria"
                  value={CATEGORY_LABELS[car.category]}
                />
                {car.transmission && (
                  <SpecChip
                    icon={<Cog className="size-4" aria-hidden />}
                    label="Transmisioni"
                    value={TRANSMISSION_LABELS[car.transmission]}
                  />
                )}
                {car.fuel_type && (
                  <SpecChip
                    icon={<Fuel className="size-4" aria-hidden />}
                    label="Karburanti"
                    value={FUEL_LABELS[car.fuel_type]}
                  />
                )}
              </div>

              {car.description && (
                <p className="text-muted-foreground mt-6 leading-relaxed text-pretty">
                  {car.description}
                </p>
              )}
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingPanel
              carId={car.id}
              carTitle={title}
              pricePerDay={car.price_per_day}
              available={available}
              bookedRanges={bookedRanges}
              initialFrom={initialFrom}
              initialTo={initialTo}
              defaultName={profile?.full_name ?? ''}
              defaultEmail={user?.email ?? ''}
            />
          </aside>
        </div>
      </PageReveal>
    </>
  )
}

/* ── Spec chip ─────────────────────────────────────────────────────────── */

function SpecChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <span className="shadow-soft inline-flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-black/[0.04]">
      <span className="bg-secondary text-muted-foreground flex size-8 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
          {label}
        </span>
        <span className="text-sm font-semibold">{value}</span>
      </span>
    </span>
  )
}

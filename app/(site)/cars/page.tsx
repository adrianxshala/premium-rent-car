import Link from 'next/link'
import { CalendarDays, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Constants, type Enums } from '@/types/database'
import { CarCard } from '@/components/cars/car-card'
import {
  PageReveal,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'

export const metadata = {
  title: 'Makinat | Premium Rent Car',
  description: 'Zgjidh makinën dhe datat e qirasë.',
}

type CarCategory = Enums<'car_category'>

function isCategory(value: string | undefined): value is CarCategory {
  return (
    value !== undefined &&
    (Constants.public.Enums.car_category as readonly string[]).includes(value)
  )
}

/** A 'YYYY-MM-DD' string, or null if it isn't a real calendar date. */
function parseISODate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : value
}

/** 'YYYY-MM-DD' for today + `offset` days (used to find today's bookings). */
function isoDay(offset: number): string {
  return new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string }>
}) {
  const { category, from, to } = await searchParams
  const activeCategory = isCategory(category) ? category : undefined

  // Treat the date filter as active only when both ends are valid and ordered.
  const fromDate = parseISODate(from)
  const toDate = parseISODate(to)
  const dateRange =
    fromDate && toDate && toDate > fromDate
      ? { from: fromDate, to: toDate }
      : null

  const supabase = await createClient()
  let query = supabase
    .from('cars')
    .select(
      'id, make, model, year, category, status, price_per_day, image_urls',
    )
    .neq('status', 'retired')
    .order('created_at', { ascending: false })

  if (activeCategory) query = query.eq('category', activeCategory)

  const { data: allCars, error } = await query

  // When a date range is searched, show only cars that are bookable for it:
  // status 'available' and with no active booking overlapping the period.
  // Otherwise, show every car but flag the ones occupied *right now* so the
  // card reads "E zënë" — they stay clickable and bookable for free future
  // dates (occupancy is a moment in time, not a hard block like maintenance).
  let cars = allCars
  let occupiedIds = new Set<string>()
  if (dateRange && allCars) {
    const { data: booked, error: bookedError } = await supabase.rpc(
      'cars_booked_between',
      { p_start: dateRange.from, p_end: dateRange.to },
    )
    // If this fails (e.g. the migration isn't deployed), we'd otherwise
    // silently treat every car as free for the period — surface it instead.
    if (bookedError) {
      console.error('cars_booked_between failed:', bookedError)
    }
    const bookedIds = new Set((booked ?? []).map((r) => r.car_id))
    cars = allCars.filter(
      (car) => car.status === 'available' && !bookedIds.has(car.id),
    )
  } else if (allCars) {
    // No date filter: which cars are rented out today? [today, tomorrow)
    const today = isoDay(0)
    const { data: bookedNow, error: bookedNowError } = await supabase.rpc(
      'cars_booked_between',
      { p_start: today, p_end: isoDay(1) },
    )
    if (bookedNowError) {
      console.error('cars_booked_between (today) failed:', bookedNowError)
    }
    occupiedIds = new Set((bookedNow ?? []).map((r) => r.car_id))
  }

  // Preserve the searched dates across category switches and into the card
  // links, so the chosen period flows through the whole booking journey.
  const dateQuery = dateRange
    ? `&from=${dateRange.from}&to=${dateRange.to}`
    : ''
  const carQuery = dateRange
    ? { from: dateRange.from, to: dateRange.to }
    : undefined

  return (
    <PageReveal className="mx-auto w-full max-w-6xl px-6 pt-7 pb-14">
      <Reveal y={10} duration={0.5} className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Makinat tona</h1>
        <p className="text-muted-foreground mt-1">
          Zgjidh një makinë dhe rezervo datat që të interesojnë.
        </p>
      </Reveal>

      {dateRange && (
        <Reveal
          y={8}
          delay={0.05}
          className="bg-secondary mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-4 py-3 text-sm"
        >
          <span className="text-foreground inline-flex items-center gap-2 font-medium">
            <CalendarDays className="size-4" aria-hidden />
            Të disponueshme për {formatDate(dateRange.from)} →{' '}
            {formatDate(dateRange.to)}
          </span>
          <Link
            href={activeCategory ? `/cars?category=${activeCategory}` : '/cars'}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
          >
            <X className="size-3.5" aria-hidden />
            Pastro datat
          </Link>
        </Reveal>
      )}

      <Reveal y={8} delay={0.1}>
        <nav
          className="mb-8 flex flex-wrap gap-2"
          aria-label="Filtro sipas kategorisë"
        >
          <FilterPill
            href={dateRange ? `/cars?${dateQuery.slice(1)}` : '/cars'}
            active={!activeCategory}
          >
            Të gjitha
          </FilterPill>
          {Constants.public.Enums.car_category.map((cat) => (
            <FilterPill
              key={cat}
              href={`/cars?category=${cat}${dateQuery}`}
              active={activeCategory === cat}
            >
              {CATEGORY_LABELS[cat]}
            </FilterPill>
          ))}
        </nav>
      </Reveal>

      {error ? (
        <p className="text-destructive">
          Diçka shkoi keq gjatë ngarkimit të makinave. Provo sërish.
        </p>
      ) : !cars || cars.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          {dateRange
            ? 'Asnjë makinë e disponueshme për këto data. Provo një periudhë tjetër.'
            : 'Asnjë makinë në këtë kategori për momentin.'}
        </p>
      ) : (
        <StaggerGroup
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
          inView={false}
        >
          {cars.map((car) => (
            <StaggerItem key={car.id} lift={-4}>
              <CarCard
                car={car}
                dates={carQuery}
                occupied={occupiedIds.has(car.id)}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </PageReveal>
  )
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition-colors',
        active
          ? 'bg-foreground text-background border-transparent'
          : 'hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {children}
    </Link>
  )
}

import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarClock,
  CarFront,
  CreditCard,
  Gauge,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  formatEur,
  STATUS_LABELS,
} from '@/lib/format'
import { rentalDays } from '@/lib/bookings/pricing'
import type { Enums } from '@/types/database'
import {
  CountUp,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

type RecentBooking = {
  id: string
  status: Enums<'booking_status'>
  start_date: string
  end_date: string
  total_price: number
  car: { make: string; model: string; year: number } | null
  customer: string | null
  phone: string | null
  email: string | null
}

const VALUE_STATUSES = ['confirmed', 'completed'] as const
const ON_RENT_STATUSES = ['confirmed'] as const

export default async function AdminPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [carsRes, bookingsRes, customersRes, recentRes] = await Promise.all([
    supabase.from('cars').select('status'),
    supabase
      .from('bookings')
      .select('status, start_date, end_date, total_price'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select(
        'id, status, start_date, end_date, total_price, customer_name, customer_phone, customer_email, cars(make, model, year), profiles(full_name)',
      )
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const cars = carsRes.data ?? []
  const allBookings = bookingsRes.data ?? []

  const bookingValue = allBookings
    .filter((b) => (VALUE_STATUSES as readonly string[]).includes(b.status))
    .reduce((s, b) => s + b.total_price, 0)

  const nonRetired = cars.filter((c) => c.status !== 'retired').length
  const onRentCount = allBookings.filter(
    (b) =>
      (ON_RENT_STATUSES as readonly string[]).includes(b.status) &&
      b.start_date <= today &&
      b.end_date >= today,
  ).length
  const occupancy =
    nonRetired > 0 ? Math.round((onRentCount / nonRetired) * 100) : 0

  const pendingCount = allBookings.filter(
    (b) => b.status === 'pending',
  ).length

  const fleetCounts = cars.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1
      return acc
    },
    {} as Record<Enums<'car_status'>, number>,
  )

  const bookings: RecentBooking[] = (recentRes.data ?? []).map((b) => {
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
      // Guest bookings carry the contact on the row; logged-in ones fall back
      // to the linked profile.
      customer: b.customer_name ?? prof?.full_name ?? null,
      phone: b.customer_phone ?? null,
      email: b.customer_email ?? null,
    }
  })

  return (
    <>
      <header className="panel p-6 sm:p-8">
        <p className="text-muted-foreground text-sm font-medium">
          Paneli i adminit
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Përmbledhje
        </h1>
        <p className="text-muted-foreground mt-2 max-w-prose text-sm">
          Të dhënat e flotës dhe rezervimet e të gjithë klientëve — gjithçka në
          një vend.
        </p>
      </header>

      {/* Primary stats — hidden on mobile */}
      <div className="mt-5 hidden grid-cols-2 gap-3 sm:grid sm:gap-4 lg:grid-cols-3">
        <StatCard
          icon={<CreditCard className="size-4" aria-hidden />}
          value={bookingValue}
          label="Vlera e rezervimeve"
          money
        />
        <StatCard
          icon={<Gauge className="size-4" aria-hidden />}
          value={occupancy}
          label="Okupim sot"
          suffix="%"
        />
        <StatCard
          icon={<Users className="size-4" aria-hidden />}
          value={customersRes.count ?? 0}
          label="Llogari"
        />
      </div>

      {/* Manage quick-links — hidden on mobile */}
      <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2">
        <ManageCard
          href="/admin/cars"
          icon={<CarFront className="size-5" aria-hidden />}
          title="Makinat"
          sub={`${nonRetired} aktive · ${cars.length} gjithsej`}
        />
        <ManageCard
          href="/admin/bookings"
          icon={<CalendarClock className="size-5" aria-hidden />}
          title="Rezervimet"
          sub={
            pendingCount > 0 ? `${pendingCount} presin veprim` : 'Të gjitha në rregull'
          }
          alert={pendingCount > 0}
        />
      </div>

      {/* Recent bookings */}
      <section className="mt-12">
        <SectionHead
          eyebrow="Aktiviteti"
          title="Rezervimet e fundit"
          action={{ href: '/admin/bookings', label: 'Të gjitha' }}
        />

        {bookings.length > 0 ? (
          <StaggerGroup className="mt-6 flex flex-col gap-3" stagger={0.07}>
            {bookings.map((b) => (
              <StaggerItem key={b.id} lift={-2}>
                <BookingRow booking={b} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <Reveal className="mt-6">
            <div className="panel flex flex-col items-center gap-4 px-6 py-14 text-center">
              <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
                <CalendarClock className="size-6" aria-hidden />
              </span>
              <p className="text-lg font-semibold tracking-tight">
                Ende pa rezervime
              </p>
            </div>
          </Reveal>
        )}
      </section>

      {/* Fleet status */}
      <section className="mt-12">
        <SectionHead eyebrow="Flota" title="Gjendja e makinave" />
        <Reveal className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FleetCard status="available" count={fleetCounts.available ?? 0} />
            <FleetCard
              status="maintenance"
              count={fleetCounts.maintenance ?? 0}
            />
            <FleetCard status="retired" count={fleetCounts.retired ?? 0} />
          </div>
        </Reveal>
      </section>
    </>
  )
}

/* ── Stat card ─────────────────────────────────────────────────────────── */

function StatCard({
  icon,
  value,
  label,
  suffix,
  money = false,
}: {
  icon: React.ReactNode
  value: number
  label: string
  suffix?: string
  money?: boolean
}) {
  return (
    <div className="shadow-soft rounded-[24px] bg-white p-4 ring-1 ring-black/[0.04] sm:p-5">
      <span className="bg-secondary text-muted-foreground flex size-9 items-center justify-center rounded-full">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {money ? formatEur(value) : <CountUp value={value} suffix={suffix} />}
      </p>
      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
        {label}
      </p>
    </div>
  )
}

/* ── Manage quick-link card ────────────────────────────────────────────── */

function ManageCard({
  href,
  icon,
  title,
  sub,
  alert = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  sub: string
  alert?: boolean
}) {
  return (
    <Link
      href={href}
      className="group shadow-soft hover:shadow-float flex items-center gap-4 rounded-[24px] bg-white p-5 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300"
    >
      <span className="bg-secondary text-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-semibold tracking-tight">{title}</p>
        <p
          className={`truncate text-sm ${alert ? 'text-amber-700' : 'text-muted-foreground'}`}
        >
          {sub}
        </p>
      </div>
      <ArrowUpRight className="text-muted-foreground group-hover:text-foreground ml-auto size-5 shrink-0 transition-colors" />
    </Link>
  )
}

/* ── Recent booking row ────────────────────────────────────────────────── */

const STATUS_TONES: Record<Enums<'booking_status'>, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-secondary text-muted-foreground',
  cancelled: 'bg-red-50 text-red-700',
}

function BookingRow({ booking }: { booking: RecentBooking }) {
  const title = booking.car
    ? `${booking.car.make} ${booking.car.model}`
    : 'Makinë e panjohur'
  const days = rentalDays(booking.start_date, booking.end_date)

  return (
    <div className="shadow-soft hover:shadow-float rounded-[24px] bg-white p-4 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300 sm:p-5">
      <div className="flex items-start gap-4">
        <span className="bg-secondary text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <CarFront className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold tracking-tight">{title}</p>
            {booking.car && (
              <span className="text-muted-foreground text-sm">
                {booking.car.year}
              </span>
            )}
          </div>
          <p className="text-foreground/80 mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
            <User className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{booking.customer ?? 'Klient'}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-semibold">{formatEur(booking.total_price)}</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONES[booking.status]}`}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2.5 border-t border-black/[0.06] pt-3">
        {/* Booking facts — dates */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
            <span className="text-muted-foreground/70">· {days} ditë</span>
          </span>
        </div>

        {/* Contact — tappable chips so admin can call/email straight from mobile */}
        {(booking.phone || booking.email) && (
          <div className="flex flex-wrap gap-2">
            {booking.phone && (
              <a
                href={`tel:${booking.phone}`}
                className="bg-secondary text-foreground/80 hover:text-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Phone className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                {booking.phone}
              </a>
            )}
            {booking.email && (
              <a
                href={`mailto:${booking.email}`}
                className="bg-secondary text-foreground/80 hover:text-foreground hover:bg-secondary/70 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Mail className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{booking.email}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Fleet status card ─────────────────────────────────────────────────── */

const FLEET_TONES: Record<Enums<'car_status'>, { dot: string; text: string }> =
  {
    available: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
    maintenance: { dot: 'bg-amber-500', text: 'text-amber-700' },
    retired: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  }

function FleetCard({
  status,
  count,
}: {
  status: Enums<'car_status'>
  count: number
}) {
  const tone = FLEET_TONES[status]
  return (
    <div className="shadow-soft rounded-[24px] bg-white p-5 ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium">
          <span className={`size-2 rounded-full ${tone.dot}`} />
          {STATUS_LABELS[status]}
        </span>
        <Link
          href="/admin/cars"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menaxho flotën"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${tone.text}`}>
        <CountUp value={count} />
      </p>
    </div>
  )
}

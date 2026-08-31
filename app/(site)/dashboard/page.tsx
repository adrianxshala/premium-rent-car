import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

import { logout } from '@/app/(auth)/actions'
import { getProfile } from '@/lib/auth/dal'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CountUp,
  PageReveal,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'
import {
  BookingCard,
  type DashboardBooking,
} from '@/components/dashboard/booking-card'

const ACTIVE_STATUSES = ['pending', 'confirmed'] as const

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select(
      'id, car_id, status, start_date, end_date, total_price, cars(make, model, year, image_urls, category)',
    )
    .order('created_at', { ascending: false })

  // Normalize the embedded car (Supabase returns the to-one relation as an
  // object, but guard against an array shape just in case).
  const bookings: DashboardBooking[] = (data ?? []).map((b) => ({
    id: b.id,
    car_id: b.car_id,
    status: b.status,
    start_date: b.start_date,
    end_date: b.end_date,
    total_price: b.total_price,
    car: Array.isArray(b.cars) ? (b.cars[0] ?? null) : (b.cars ?? null),
  }))

  const today = new Date().toISOString().slice(0, 10)
  const activeCount = bookings.filter(
    (b) =>
      (ACTIVE_STATUSES as readonly string[]).includes(b.status) &&
      b.end_date >= today,
  ).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  const firstName = profile.full_name?.split(' ')[0] ?? null

  return (
    <>
      {/* Ambient blurred blobs for depth, matching the home page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[18%] -left-[12%] size-[28rem] bg-indigo-200/30" />
        <div className="blob top-[62%] -right-[10%] size-[24rem] bg-emerald-200/25" />
      </div>

      <PageReveal className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:py-12">
          {/* Welcome panel */}
          <section className="panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Paneli yt
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Mirë se erdhe{firstName ? `, ${firstName}` : ''}.
                </h1>
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className="gap-1.5 rounded-full px-3 py-1"
                  >
                    <ShieldCheck className="size-3.5" aria-hidden />
                    {profile.role === 'admin' ? 'Administrator' : 'Klient'}
                  </Badge>
                </div>
              </div>

              <form action={logout}>
                <Button
                  variant="outline"
                  type="submit"
                  className="rounded-full"
                >
                  Dil
                </Button>
              </form>
            </div>

            {profile.role === 'admin' && (
              <Link
                href="/admin"
                className="group mt-6 flex items-center gap-3 rounded-2xl bg-black/[0.025] px-4 py-3 text-sm font-medium transition-colors hover:bg-black/[0.04]"
              >
                <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                Ke akses admin — shko te paneli i menaxhimit
                <span className="text-muted-foreground group-hover:text-foreground ml-auto transition-colors">
                  →
                </span>
              </Link>
            )}
          </section>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              icon={<CarFront className="size-4" aria-hidden />}
              value={bookings.length}
              label="Rezervime"
            />
            <StatCard
              icon={<CalendarCheck2 className="size-4" aria-hidden />}
              value={activeCount}
              label="Aktive"
            />
            <StatCard
              icon={<CheckCircle2 className="size-4" aria-hidden />}
              value={completedCount}
              label="Përfunduar"
            />
          </div>

          {/* Bookings */}
          <section className="mt-12">
            <SectionHead
              eyebrow="Historiku"
              title="Rezervimet e tua"
              action={{ href: '/cars', label: 'Rezervo makinë' }}
            />

            {bookings.length > 0 ? (
              <StaggerGroup className="mt-6 flex flex-col gap-4" stagger={0.08}>
                {bookings.map((booking) => (
                  <StaggerItem key={booking.id} lift={-2}>
                    <BookingCard booking={booking} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            ) : (
              <Reveal className="mt-6">
                <div className="panel flex flex-col items-center gap-4 px-6 py-14 text-center">
                  <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
                    <CarFront className="size-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      Nuk ke ende rezervime
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Zgjidh një makinë dhe rezervo në pak sekonda.
                    </p>
                  </div>
                  <Button asChild className="rounded-full">
                    <Link href="/cars">Shfleto makinat</Link>
                  </Button>
                </div>
              </Reveal>
            )}
          </section>
        </PageReveal>
    </>
  )
}

/* ── Stat card ─────────────────────────────────────────────────────────── */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="shadow-soft rounded-[24px] bg-white p-4 ring-1 ring-black/[0.04] sm:p-5">
      <span className="bg-secondary text-muted-foreground flex size-9 items-center justify-center rounded-full">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        <CountUp value={value} />
      </p>
      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
        {label}
      </p>
    </div>
  )
}

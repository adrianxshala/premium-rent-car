import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CalendarRange, Car as CarIcon } from 'lucide-react'

import type { Enums } from '@/types/database'
import {
  BOOKING_STATUS_LABELS,
  CATEGORY_LABELS,
  formatDate,
  formatEur,
} from '@/lib/format'

export type DashboardBooking = {
  id: string
  car_id: string
  status: Enums<'booking_status'>
  start_date: string
  end_date: string
  total_price: number
  car: {
    make: string
    model: string
    year: number
    image_urls: string[]
    category: Enums<'car_category'>
  } | null
}

/** Soft status colors — calm, never aggressive, matching the home palette. */
function statusStyle(status: Enums<'booking_status'>): {
  dot: string
  pill: string
} {
  switch (status) {
    case 'confirmed':
      return { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' }
    case 'pending':
      return { dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700' }
    case 'completed':
      return { dot: 'bg-foreground', pill: 'bg-secondary text-foreground' }
    case 'cancelled':
      return {
        dot: 'bg-muted-foreground',
        pill: 'bg-secondary text-muted-foreground',
      }
  }
}

export function BookingCard({ booking }: { booking: DashboardBooking }) {
  const { car } = booking
  const cover = car?.image_urls?.[0]
  const style = statusStyle(booking.status)

  return (
    <Link
      href={`/cars/${booking.car_id}`}
      className="group shadow-soft hover:shadow-float focus-visible:ring-ring relative flex items-stretch gap-4 overflow-hidden rounded-[28px] bg-white p-3 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300 focus-visible:ring-2 focus-visible:outline-none sm:gap-5 sm:p-4"
    >
      {/* Car thumbnail */}
      <div className="bg-secondary relative aspect-square w-24 shrink-0 overflow-hidden rounded-[20px] sm:w-32">
        {cover ? (
          <Image
            src={cover}
            alt={car ? `${car.make} ${car.model}` : 'Makina'}
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <CarIcon className="size-8" aria-hidden />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {car ? `${car.make} ${car.model}` : 'Makina'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {car ? `${CATEGORY_LABELS[car.category]} · ${car.year}` : '—'}
            </p>
          </div>
          <span className="bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full transition-colors">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>

        <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarRange className="size-4" aria-hidden />
            {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
          </span>
          <span className="text-foreground font-semibold">
            {formatEur(booking.total_price)}
          </span>
          <span
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.pill}`}
          >
            <span className={`size-1.5 rounded-full ${style.dot}`} />
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>
    </Link>
  )
}

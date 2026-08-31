'use client'

import Link from 'next/link'
import { Dialog } from 'radix-ui'
import {
  CalendarClock,
  CarFront,
  CornerDownLeft,
  KeyRound,
  Mail,
  Phone,
  Pencil,
  User,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { BOOKING_STATUS_LABELS, formatDate, formatEur } from '@/lib/format'
import { rentalDays } from '@/lib/bookings/pricing'
import { bookingPhase } from '@/lib/calendar/availability'
import type { CalendarBooking, VehicleLite } from '@/lib/calendar/types'
import { PHASE_DOT } from '@/components/admin/calendar/tokens'
import { BookingStatusControl } from '@/components/admin/booking-status-control'

export function BookingDrawer({
  open,
  booking,
  vehicle,
  today,
  onClose,
}: {
  open: boolean
  booking: CalendarBooking | null
  vehicle: VehicleLite | null
  today: string
  onClose: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-float ring-1 ring-black/[0.06] duration-300"
        >
          {booking && (
            <>
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <Dialog.Title className="text-sm font-semibold tracking-tight">
                  Detajet e rezervimit
                </Dialog.Title>
                <Dialog.Close
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary flex size-8 items-center justify-center rounded-full transition-colors"
                  aria-label="Mbyll"
                >
                  <X className="size-4" aria-hidden />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* Vehicle */}
                <div className="flex items-center gap-3">
                  <span className="bg-secondary relative size-16 shrink-0 overflow-hidden rounded-2xl">
                    {vehicle?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.image_url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground flex size-full items-center justify-center">
                        <CarFront className="size-6" aria-hidden />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight">
                      {vehicle
                        ? `${vehicle.make} ${vehicle.model}`
                        : 'Makinë e panjohur'}
                    </p>
                    {vehicle && (
                      <p className="text-muted-foreground text-sm">
                        {vehicle.year}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <StatusPip booking={booking} today={today} />
                </div>

                {/* Customer */}
                <Section title="Klienti">
                  <p className="inline-flex items-center gap-2 text-sm font-medium">
                    <User className="text-muted-foreground size-4" aria-hidden />
                    {booking.customer_name ?? 'Klient'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {booking.customer_phone && (
                      <a
                        href={`tel:${booking.customer_phone}`}
                        className="bg-secondary hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                      >
                        <Phone className="text-muted-foreground size-3.5" aria-hidden />
                        {booking.customer_phone}
                      </a>
                    )}
                    {booking.customer_email && (
                      <a
                        href={`mailto:${booking.customer_email}`}
                        className="bg-secondary hover:bg-secondary/70 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                      >
                        <Mail className="text-muted-foreground size-3.5" aria-hidden />
                        <span className="truncate">{booking.customer_email}</span>
                      </a>
                    )}
                  </div>
                </Section>

                {/* Dates */}
                <Section title="Periudha">
                  <div className="grid grid-cols-2 gap-3">
                    <Fact
                      icon={<KeyRound className="size-4" aria-hidden />}
                      label="Marrja"
                      value={formatDate(booking.start_date)}
                    />
                    <Fact
                      icon={<CornerDownLeft className="size-4" aria-hidden />}
                      label="Kthimi"
                      value={formatDate(booking.end_date)}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Fact
                      icon={<CalendarClock className="size-4" aria-hidden />}
                      label="Kohëzgjatja"
                      value={`${rentalDays(booking.start_date, booking.end_date)} ditë`}
                    />
                    <Fact
                      icon={<span className="text-sm font-semibold">€</span>}
                      label="Totali"
                      value={formatEur(booking.total_price)}
                    />
                  </div>
                </Section>
              </div>

              {/* Actions */}
              <div className="space-y-3 border-t border-black/[0.06] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    Ndrysho statusin
                  </span>
                  <BookingStatusControl id={booking.id} status={booking.status} />
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/bookings?q=${encodeURIComponent(booking.customer_name ?? '')}`}
                    className="bg-secondary hover:bg-secondary/70 inline-flex h-9 flex-1 items-center justify-center rounded-full text-sm font-medium transition-colors"
                  >
                    Shiko te rezervimet
                  </Link>
                  {vehicle && (
                    <Link
                      href={`/admin/cars/${vehicle.id}/edit`}
                      className="bg-secondary hover:bg-secondary/70 inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Makina
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function StatusPip({
  booking,
  today,
}: {
  booking: CalendarBooking
  today: string
}) {
  const phase = bookingPhase(booking, today)
  return (
    <span className="bg-secondary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
      <span className={cn('size-2 rounded-full', PHASE_DOT[phase])} />
      {BOOKING_STATUS_LABELS[booking.status]}
    </span>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-6">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-secondary/60 rounded-2xl p-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {label}
      </span>
      <p className="mt-1 text-sm font-semibold tracking-tight">{value}</p>
    </div>
  )
}

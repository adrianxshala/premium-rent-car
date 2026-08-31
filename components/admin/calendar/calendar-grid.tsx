'use client'

import * as React from 'react'
import Link from 'next/link'
import { Dialog } from 'radix-ui'
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Ban,
  CarFront,
  Loader2,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { cn } from '@/lib/utils'
import { daysBetween, weekdayIndex } from '@/lib/calendar/dates'
import type { ISODate } from '@/lib/calendar/dates'
import type {
  CalendarEvent,
  CalendarView,
  VehicleLite,
} from '@/lib/calendar/types'
import {
  BLOCK_KIND_LABELS,
  BOOKING_STATUS_LABELS,
  CATEGORY_LABELS,
  formatDate,
  formatDayMonth,
  formatEur,
  formatWeekdayShort,
} from '@/lib/format'
import { rentalDays } from '@/lib/bookings/pricing'
import { PHASE_BAR, PHASE_DOT } from '@/components/admin/calendar/tokens'
import { deleteCarBlock } from '@/app/(site)/admin/calendar/actions'

/* ── Geometry per view ─────────────────────────────────────────────────── */
const GEOM = {
  week: { col: 118, vcol: 248, header: 66 },
  month: { col: 46, vcol: 216, header: 66 },
} as const
/** Tighter geometry for phones: the vehicle column must not eat the screen. */
const GEOM_MOBILE = {
  week: { col: 96, vcol: 148, header: 60 },
  month: { col: 40, vcol: 132, header: 60 },
} as const
const LANE_H = 40
const LANE_GAP = 6
const ROW_PAD = 10
/** Minimum bar width (px) at which the second line (dates) is shown. */
const TWO_LINE_MIN = 92

/** Weekend from a 0=Mon..6=Sun index (Sat=5, Sun=6). */
function isWeekend(iso: ISODate): boolean {
  return weekdayIndex(iso) >= 5
}

/** Day-of-month straight from the ISO string (no Date → SSR-safe). */
function dayNum(iso: ISODate): number {
  return Number(iso.split('-')[2])
}

/**
 * True on phone-width screens. Starts `false` so the first client render matches
 * SSR (no hydration mismatch); flips after mount, which only reflows the grid.
 */
function useIsMobile(): boolean {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return mobile
}

type HoverState = { event: CalendarEvent; x: number; y: number } | null

/** Greedy interval partitioning: pack a car's events into non-overlapping lanes. */
function layoutLanes(events: CalendarEvent[]) {
  const sorted = [...events].sort(
    (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end),
  )
  const laneEnds: ISODate[] = []
  const items = sorted.map((event) => {
    let lane = laneEnds.findIndex((end) => end <= event.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(event.end)
    } else {
      laneEnds[lane] = event.end
    }
    return { event, lane }
  })
  return { items, lanes: Math.max(1, laneEnds.length) }
}

export function CalendarGrid({
  vehicles,
  eventsByCar,
  days,
  rangeStart,
  rangeEnd,
  today,
  view,
  highlightIds,
  conflictIds,
  onSelectBooking,
}: {
  vehicles: VehicleLite[]
  eventsByCar: Map<string, CalendarEvent[]>
  days: ISODate[]
  rangeStart: ISODate
  rangeEnd: ISODate
  today: ISODate
  view: CalendarView
  highlightIds: Set<string> | null
  conflictIds: Set<string>
  onSelectBooking: (id: string) => void
}) {
  const isMobile = useIsMobile()
  const geom = (isMobile ? GEOM_MOBILE : GEOM)[view]
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState<HoverState>(null)
  const [blockToDelete, setBlockToDelete] = React.useState<CalendarEvent | null>(
    null,
  )

  const todayIdx = daysBetween(rangeStart, today)
  const todayVisible = todayIdx >= 0 && todayIdx < days.length
  const trackWidth = days.length * geom.col

  const vehicleById = React.useMemo(() => {
    const m = new Map<string, VehicleLite>()
    for (const v of vehicles) m.set(v.id, v)
    return m
  }, [vehicles])

  // Scroll today into view on mount / view change.
  React.useEffect(() => {
    if (!todayVisible || !scrollRef.current) return
    const target = geom.vcol + todayIdx * geom.col - geom.vcol - 24
    scrollRef.current.scrollLeft = Math.max(0, target)
  }, [todayVisible, todayIdx, geom, view, rangeStart])

  const onBarEnter = (event: CalendarEvent) => (e: React.MouseEvent) =>
    setHover({ event, x: e.clientX, y: e.clientY })
  const onBarMove = (event: CalendarEvent) => (e: React.MouseEvent) =>
    setHover({ event, x: e.clientX, y: e.clientY })

  return (
    <div className="overflow-hidden border-y border-black/[0.05] bg-white sm:rounded-[24px] sm:border-y-0 sm:shadow-soft sm:ring-1 sm:ring-black/[0.05]">
      <div ref={scrollRef} className="max-h-[72vh] overflow-auto sm:max-h-[68vh]">
        <div style={{ width: geom.vcol + trackWidth }} className="relative">
          {/* ── Header row (sticky top) ── */}
          <div
            className="sticky top-0 z-30 flex border-b border-black/[0.05] bg-white/85 supports-[backdrop-filter]:backdrop-blur-md"
            style={{ height: geom.header }}
          >
            <div
              className="text-muted-foreground sticky left-0 z-10 flex items-center border-r border-black/[0.05] bg-white/85 px-3 text-[11px] font-semibold tracking-wide uppercase supports-[backdrop-filter]:backdrop-blur-md sm:px-4"
              style={{ width: geom.vcol }}
            >
              Flota
            </div>
            <div className="relative flex" style={{ width: trackWidth }}>
              {days.map((day) => {
                const isToday = day === today
                return (
                  <div
                    key={day}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 border-l border-black/[0.03] text-center',
                      isWeekend(day) && 'bg-black/[0.01]',
                    )}
                    style={{ width: geom.col }}
                  >
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {formatWeekdayShort(day).slice(0, view === 'month' ? 1 : 3)}
                    </span>
                    {isToday ? (
                      <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums">
                        {dayNum(day)}
                      </span>
                    ) : (
                      <span className="text-[15px] font-semibold tabular-nums">
                        {dayNum(day)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Vehicle rows ── */}
          {vehicles.map((vehicle) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              events={eventsByCar.get(vehicle.id) ?? []}
              days={days}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              geom={geom}
              todayIdx={todayVisible ? todayIdx : null}
              today={today}
              highlightIds={highlightIds}
              conflictIds={conflictIds}
              onSelectBooking={onSelectBooking}
              onSelectBlock={setBlockToDelete}
              onBarEnter={onBarEnter}
              onBarMove={onBarMove}
              onBarLeave={() => setHover(null)}
            />
          ))}
        </div>
      </div>

      {hover && (
        <BarTooltip
          event={hover.event}
          vehicle={vehicleById.get(hover.event.carId) ?? null}
          today={today}
          x={hover.x}
          y={hover.y}
        />
      )}

      <BlockDeleteDialog
        event={blockToDelete}
        onClose={() => setBlockToDelete(null)}
      />
    </div>
  )
}

/* ── One vehicle row ───────────────────────────────────────────────────── */

function VehicleRow({
  vehicle,
  events,
  days,
  rangeStart,
  rangeEnd,
  geom,
  todayIdx,
  today,
  highlightIds,
  conflictIds,
  onSelectBooking,
  onSelectBlock,
  onBarEnter,
  onBarMove,
  onBarLeave,
}: {
  vehicle: VehicleLite
  events: CalendarEvent[]
  days: ISODate[]
  rangeStart: ISODate
  rangeEnd: ISODate
  geom: { col: number; vcol: number; header: number }
  todayIdx: number | null
  today: ISODate
  highlightIds: Set<string> | null
  conflictIds: Set<string>
  onSelectBooking: (id: string) => void
  onSelectBlock: (e: CalendarEvent) => void
  onBarEnter: (e: CalendarEvent) => (ev: React.MouseEvent) => void
  onBarMove: (e: CalendarEvent) => (ev: React.MouseEvent) => void
  onBarLeave: () => void
}) {
  const { items, lanes } = React.useMemo(() => layoutLanes(events), [events])
  const rowHeight = lanes * LANE_H + (lanes - 1) * LANE_GAP + ROW_PAD * 2
  const trackWidth = days.length * geom.col

  return (
    <div className="flex border-b border-black/[0.05] last:border-b-0">
      {/* Sticky vehicle cell → links to the existing edit page */}
      <Link
        href={`/admin/cars/${vehicle.id}/edit`}
        className="sticky left-0 z-10 flex items-center gap-2.5 border-r border-black/[0.05] bg-white/90 px-3 transition-colors hover:bg-black/[0.02] supports-[backdrop-filter]:backdrop-blur-md sm:gap-3 sm:px-4"
        style={{ width: geom.vcol, minHeight: rowHeight }}
      >
        <span className="bg-secondary relative size-9 shrink-0 overflow-hidden rounded-xl sm:size-11 sm:rounded-2xl">
          {vehicle.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.image_url}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground flex size-full items-center justify-center">
              <CarFront className="size-5" aria-hidden />
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold tracking-tight">
            {vehicle.make} {vehicle.model}
          </span>
          <span className="text-muted-foreground mt-0.5 block truncate text-xs">
            {CATEGORY_LABELS[vehicle.category]} · {vehicle.year}
          </span>
        </span>
      </Link>

      {/* Timeline track */}
      <div
        className="relative"
        style={{ width: trackWidth, height: rowHeight }}
      >
        {/* Background day cells */}
        <div className="absolute inset-0 flex">
          {days.map((day) => (
            <div
              key={day}
              className={cn(
                'border-l border-black/[0.03]',
                isWeekend(day) && 'bg-black/[0.01]',
                day === today && 'bg-foreground/[0.03]',
              )}
              style={{ width: geom.col }}
            />
          ))}
        </div>

        {/* Today line — thin, quiet accent */}
        {todayIdx !== null && (
          <div
            className="bg-foreground/20 pointer-events-none absolute top-0 bottom-0 z-[1] w-px"
            style={{ left: todayIdx * geom.col }}
          />
        )}

        {/* Event bars */}
        {items.map(({ event, lane }) => {
          const cStart = event.start < rangeStart ? rangeStart : event.start
          const cEnd = event.end > rangeEnd ? rangeEnd : event.end
          const startIdx = daysBetween(rangeStart, cStart)
          const span = Math.max(1, daysBetween(cStart, cEnd))
          const left = startIdx * geom.col + 2
          const width = span * geom.col - 4
          const top = ROW_PAD + lane * (LANE_H + LANE_GAP)

          const dimmed = highlightIds !== null && !highlightIds.has(event.id)
          const isConflict = conflictIds.has(event.id)
          const isBlock = event.kind === 'block'
          const kind = event.phase as 'maintenance' | 'unavailable'
          const showPickup = event.start >= rangeStart && event.kind === 'booking'
          const showReturn = event.end <= rangeEnd && event.kind === 'booking'
          const twoLine = width >= TWO_LINE_MIN
          const BlockIcon = event.phase === 'unavailable' ? Ban : Wrench

          const title = isBlock
            ? (event.block?.reason ?? BLOCK_KIND_LABELS[kind])
            : (event.booking?.customer_name ?? 'Klient')
          const subtitle = `${formatDayMonth(event.start)} → ${formatDayMonth(event.end)}`

          return (
            <button
              key={event.id}
              type="button"
              onMouseEnter={onBarEnter(event)}
              onMouseMove={onBarMove(event)}
              onMouseLeave={onBarLeave}
              onClick={() =>
                isBlock
                  ? onSelectBlock(event)
                  : event.booking && onSelectBooking(event.booking.id)
              }
              className={cn(
                'group/bar absolute flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-[12px] px-2.5 text-left ring-1 ring-inset transition-all duration-150',
                PHASE_BAR[event.phase],
                dimmed && 'opacity-25',
                isConflict &&
                  'ring-2 ring-red-500/70 ring-offset-1 ring-offset-white',
                'hover:z-[3] hover:-translate-y-px hover:shadow-float focus-visible:z-[3] focus-visible:outline-none',
              )}
              style={{ left, width, top, height: LANE_H }}
            >
              {isBlock ? (
                <BlockIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              ) : (
                showPickup && (
                  <ArrowRightToLine
                    className="size-3.5 shrink-0 opacity-55"
                    aria-hidden
                  />
                )
              )}
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[12px] font-semibold">
                  {title}
                </span>
                {twoLine && (
                  <span className="mt-0.5 block truncate text-[11px] font-normal opacity-70">
                    {subtitle}
                  </span>
                )}
              </span>
              {showReturn && (
                <ArrowLeftToLine
                  className="size-3.5 shrink-0 opacity-55"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Hover tooltip (fixed → escapes the scroll clip) ───────────────────── */

function BarTooltip({
  event,
  vehicle,
  today,
  x,
  y,
}: {
  event: CalendarEvent
  vehicle: VehicleLite | null
  today: ISODate
  x: number
  y: number
}) {
  const title = vehicle
    ? `${vehicle.make} ${vehicle.model}`
    : 'Makinë e panjohur'

  // Keep the card on-screen: flip left when near the right edge.
  const width = 224
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const left = x + width + 16 > vw ? x - width - 12 : x + 12

  return (
    <div
      className="shadow-float pointer-events-none fixed z-50 w-56 rounded-2xl bg-white p-3.5 ring-1 ring-black/[0.06]"
      style={{ left, top: Math.max(12, y - 12) }}
      role="tooltip"
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <span className={cn('size-2 rounded-full', PHASE_DOT[event.phase])} />
        {title}
      </p>

      {event.kind === 'booking' && event.booking ? (
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row2 label="Klienti" value={event.booking.customer_name ?? 'Klient'} />
          <Row2
            label="Marrja"
            value={formatDate(event.booking.start_date)}
          />
          <Row2 label="Kthimi" value={formatDate(event.booking.end_date)} />
          <Row2
            label="Kohëzgjatja"
            value={`${rentalDays(event.booking.start_date, event.booking.end_date)} ditë`}
          />
          <Row2 label="Totali" value={formatEur(event.booking.total_price)} />
          <Row2
            label="Statusi"
            value={BOOKING_STATUS_LABELS[event.booking.status]}
          />
        </dl>
      ) : (
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row2
            label="Lloji"
            value={BLOCK_KIND_LABELS[event.phase as 'maintenance' | 'unavailable']}
          />
          {event.block?.reason && (
            <Row2 label="Arsyeja" value={event.block.reason} />
          )}
          <Row2 label="Nga" value={formatDate(event.start)} />
          <Row2 label="Deri" value={formatDate(event.end)} />
        </dl>
      )}
      <p className="text-muted-foreground mt-2 border-t border-black/[0.06] pt-2 text-[11px]">
        {event.kind === 'booking'
          ? 'Kliko për detaje'
          : 'Kliko për ta hequr'}
        {today >= event.start && today < event.end ? ' · aktiv sot' : ''}
      </p>
    </div>
  )
}

function Row2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}

/* ── Block delete confirm ──────────────────────────────────────────────── */

function BlockDeleteDialog({
  event,
  onClose,
}: {
  event: CalendarEvent | null
  onClose: () => void
}) {
  const block = event?.block ?? null
  return (
    <Dialog.Root open={event !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white p-6 shadow-float ring-1 ring-black/[0.06]">
          <Dialog.Title className="text-lg font-semibold tracking-tight">
            Hiq bllokimin
          </Dialog.Title>
          <Dialog.Description className="text-muted-foreground mt-1 text-sm">
            {block
              ? `${BLOCK_KIND_LABELS[block.kind]} · ${formatDate(block.start_date)} → ${formatDate(block.end_date)}`
              : ''}
          </Dialog.Description>
          {block?.reason && (
            <p className="bg-secondary mt-3 rounded-xl px-3 py-2 text-sm">
              {block.reason}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-full px-4 text-sm font-medium">
              Anulo
            </Dialog.Close>
            <form
              action={async (fd) => {
                await deleteCarBlock(fd)
                onClose()
              }}
            >
              <input type="hidden" name="blockId" value={block?.id ?? ''} />
              <DeleteButton />
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-destructive inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-4" aria-hidden />
      )}
      Hiq
    </button>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { CarFront, Plus, SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { eachDayISO, isWithin } from '@/lib/calendar/dates'
import {
  detectConflicts,
  dayStatus,
  toEvents,
} from '@/lib/calendar/availability'
import type {
  CalendarBlock,
  CalendarBooking,
  CalendarEvent,
  CalendarStatus,
  CalendarView,
  TodayOps,
  VehicleLite,
} from '@/lib/calendar/types'
import type { Enums } from '@/types/database'
import { CalendarHeader } from '@/components/admin/calendar/calendar-header'
import { TodayOperations } from '@/components/admin/calendar/today-operations'
import { ConflictBanner } from '@/components/admin/calendar/conflict-banner'
import { CalendarLegend } from '@/components/admin/calendar/calendar-legend'
import { CalendarGrid } from '@/components/admin/calendar/calendar-grid'
import { CalendarFilters } from '@/components/admin/calendar/calendar-filters'
import { BookingDrawer } from '@/components/admin/calendar/booking-drawer'
import { AddBlockDialog } from '@/components/admin/calendar/add-block-dialog'

export type HighlightMode = 'pickups' | 'returns' | 'maintenance' | 'attention'

export function FleetCalendar({
  vehicles,
  bookings,
  blocks,
  view,
  anchor,
  rangeStart,
  rangeEnd,
  today,
  todayOps,
}: {
  vehicles: VehicleLite[]
  bookings: CalendarBooking[]
  blocks: CalendarBlock[]
  view: CalendarView
  anchor: string
  rangeStart: string
  rangeEnd: string
  today: string
  todayOps: Omit<TodayOps, 'attention'>
}) {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<Set<CalendarStatus>>(
    new Set(),
  )
  const [categoryFilter, setCategoryFilter] = React.useState<
    Set<Enums<'car_category'>>
  >(new Set())
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [addBlockOpen, setAddBlockOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [highlight, setHighlight] = React.useState<HighlightMode | null>(null)

  const days = React.useMemo(
    () => eachDayISO(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const events = React.useMemo(
    () => toEvents(bookings, blocks, today),
    [bookings, blocks, today],
  )

  const conflicts = React.useMemo(() => detectConflicts(events), [events])

  const eventsByCar = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const list = map.get(e.carId) ?? []
      list.push(e)
      map.set(e.carId, list)
    }
    return map
  }, [events])

  const conflictEventIds = React.useMemo(() => {
    const set = new Set<string>()
    for (const c of conflicts) {
      set.add(c.a.id)
      set.add(c.b.id)
    }
    return set
  }, [conflicts])

  const ops: TodayOps = { ...todayOps, attention: conflicts.length }

  // Which events light up when an ops metric is toggled.
  const highlightEventIds = React.useMemo(() => {
    if (!highlight) return null
    const set = new Set<string>()
    for (const e of events) {
      const b = e.booking
      const match =
        (highlight === 'pickups' &&
          e.kind === 'booking' &&
          b?.start_date === today) ||
        (highlight === 'returns' &&
          e.kind === 'booking' &&
          b?.end_date === today) ||
        (highlight === 'maintenance' &&
          e.phase === 'maintenance' &&
          isWithin(today, e.start, e.end)) ||
        (highlight === 'attention' && conflictEventIds.has(e.id))
      if (match) set.add(e.id)
    }
    return set
  }, [highlight, events, today, conflictEventIds])

  // Precompute each vehicle's set of availability states across the range —
  // only when a status filter is active (keeps the common path cheap).
  const statusByCar = React.useMemo(() => {
    if (statusFilter.size === 0) return null
    const map = new Map<string, Set<CalendarStatus>>()
    for (const v of vehicles) {
      const carEvents = eventsByCar.get(v.id) ?? []
      const set = new Set<CalendarStatus>()
      for (const day of days) set.add(dayStatus(v.status, carEvents, day))
      map.set(v.id, set)
    }
    return map
  }, [statusFilter, vehicles, eventsByCar, days])

  const filteredVehicles = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return vehicles.filter((v) => {
      if (categoryFilter.size > 0 && !categoryFilter.has(v.category)) {
        return false
      }
      if (statusFilter.size > 0) {
        const set = statusByCar?.get(v.id)
        if (!set || ![...statusFilter].some((s) => set.has(s))) return false
      }
      if (term) {
        const hay = `${v.make} ${v.model} ${v.year}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [vehicles, search, categoryFilter, statusFilter, statusByCar])

  const selected = React.useMemo(() => {
    if (!selectedId) return null
    const booking = bookings.find((b) => b.id === selectedId)
    if (!booking) return null
    const vehicle = vehicles.find((v) => v.id === booking.car_id) ?? null
    return { booking, vehicle }
  }, [selectedId, bookings, vehicles])

  const filtersActive = statusFilter.size + categoryFilter.size

  const toggleHighlight = (mode: HighlightMode) =>
    setHighlight((cur) => (cur === mode ? null : mode))

  const carOptions = vehicles.map((v) => ({
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
  }))

  return (
    <>
      <CalendarHeader view={view} anchor={anchor} today={today} />

      <div className="mt-8">
        <TodayOperations
          ops={ops}
          active={highlight}
          onToggle={toggleHighlight}
        />
      </div>

      {conflicts.length > 0 && (
        <ConflictBanner
          conflicts={conflicts}
          vehicles={vehicles}
          active={highlight === 'attention'}
          onFocus={() => toggleHighlight('attention')}
          onOpenBooking={setSelectedId}
        />
      )}

      {/* Toolbar: instant search + filters + add block */}
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kërko makinë…"
            className="focus-visible:ring-ring/40 h-10 w-full rounded-full bg-white pr-9 pl-4 text-sm ring-1 ring-black/[0.06] transition-shadow outline-none focus-visible:ring-2"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Pastro kërkimin"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-full border-black/[0.08] bg-white px-4 shadow-none"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtra
          {filtersActive > 0 && (
            <span className="bg-primary text-primary-foreground ml-1 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold">
              {filtersActive}
            </span>
          )}
        </Button>

        <Button
          type="button"
          className="h-10 rounded-full px-5"
          onClick={() => setAddBlockOpen(true)}
          disabled={vehicles.length === 0}
        >
          <Plus className="size-4" aria-hidden />
          Shto bllokim
        </Button>
      </div>

      <div className="mt-6">
        <CalendarLegend />
      </div>

      {/* Grid / empty states */}
      <div className="mt-5">
        {vehicles.length === 0 ? (
          <EmptyFleet />
        ) : filteredVehicles.length === 0 ? (
          <EmptyState
            title="Asnjë makinë s’përputhet me filtrat"
            hint="Ndrysho kërkimin ose pastro filtrat."
          />
        ) : (
          // Edge-to-edge on phones for more timeline room; card on desktop.
          <div className="-mx-6 sm:mx-0">
            <CalendarGrid
              vehicles={filteredVehicles}
              eventsByCar={eventsByCar}
              days={days}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              today={today}
              view={view}
              highlightIds={highlightEventIds}
              conflictIds={conflictEventIds}
              onSelectBooking={setSelectedId}
            />
          </div>
        )}
      </div>

      <BookingDrawer
        open={selected !== null}
        booking={selected?.booking ?? null}
        vehicle={selected?.vehicle ?? null}
        today={today}
        onClose={() => setSelectedId(null)}
      />

      <CalendarFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        vehicles={vehicles}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      <AddBlockDialog
        open={addBlockOpen}
        onClose={() => setAddBlockOpen(false)}
        cars={carOptions}
      />
    </>
  )
}

function EmptyFleet() {
  return (
    <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
        <CarFront className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-lg font-semibold tracking-tight">Flota juaj është bosh</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Shto makinën e parë për ta parë në kalendar.
        </p>
      </div>
      <Button asChild className="rounded-full">
        <Link href="/admin/cars/new">
          <Plus className="size-4" aria-hidden />
          Shto makinë
        </Link>
      </Button>
    </div>
  )
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className={cn('text-lg font-semibold tracking-tight')}>{title}</p>
      {hint && <p className="text-muted-foreground text-sm">{hint}</p>}
    </div>
  )
}

'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { BLOCK_KIND_LABELS, formatDate } from '@/lib/format'
import type { CalendarEvent, Conflict, VehicleLite } from '@/lib/calendar/types'

function eventLabel(e: CalendarEvent): string {
  const range = `${formatDate(e.start)} → ${formatDate(e.end)}`
  if (e.kind === 'booking') {
    return `${e.booking?.customer_name ?? 'Klient'} · ${range}`
  }
  return `${BLOCK_KIND_LABELS[e.phase as 'maintenance' | 'unavailable']} · ${range}`
}

export function ConflictBanner({
  conflicts,
  vehicles,
  active,
  onFocus,
  onOpenBooking,
}: {
  conflicts: Conflict[]
  vehicles: VehicleLite[]
  active: boolean
  onFocus: () => void
  onOpenBooking: (id: string) => void
}) {
  const vById = React.useMemo(() => {
    const m = new Map<string, VehicleLite>()
    for (const v of vehicles) m.set(v.id, v)
    return m
  }, [vehicles])

  const shown = conflicts.slice(0, 4)

  const openable = (e: CalendarEvent) =>
    e.kind === 'booking' && e.booking
      ? () => onOpenBooking(e.booking!.id)
      : undefined

  return (
    <div className="mt-6 rounded-[24px] bg-red-50/70 p-4 ring-1 ring-red-500/20 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold tracking-tight text-red-900">
              {conflicts.length === 1
                ? '1 konflikt rezervimi'
                : `${conflicts.length} konflikte rezervimi`}
            </p>
            <p className="text-sm text-red-800/80">
              Makina të mbivendosura në të njëjtën periudhë — verifiko dhe
              zgjidh.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFocus}
          aria-pressed={active}
          className={cn(
            'inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium transition-colors',
            active
              ? 'bg-red-600 text-white'
              : 'bg-white text-red-700 ring-1 ring-red-500/20 hover:bg-red-50',
          )}
        >
          {active ? 'Duke fokusuar' : 'Fokuso në kalendar'}
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {shown.map((c, i) => {
          const v = vById.get(c.carId)
          const openA = openable(c.a)
          const openB = openable(c.b)
          return (
            <li
              key={i}
              className="rounded-2xl bg-white/70 px-4 py-3 text-sm ring-1 ring-red-500/10"
            >
              <p className="font-semibold tracking-tight">
                {v ? `${v.make} ${v.model}` : 'Makinë'}
              </p>
              <div className="text-muted-foreground mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <ConflictSide label={eventLabel(c.a)} onClick={openA} />
                <span className="hidden text-red-400 sm:inline">×</span>
                <ConflictSide label={eventLabel(c.b)} onClick={openB} />
              </div>
            </li>
          )
        })}
        {conflicts.length > shown.length && (
          <li className="text-sm text-red-800/80">
            + {conflicts.length - shown.length} të tjera
          </li>
        )}
      </ul>
    </div>
  )
}

function ConflictSide({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  if (!onClick) return <span>{label}</span>
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:text-foreground text-left underline decoration-red-300 underline-offset-2 transition-colors"
    >
      {label}
    </button>
  )
}

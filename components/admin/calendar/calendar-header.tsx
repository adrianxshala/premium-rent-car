'use client'

import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  addDaysISO,
  endOfMonthExclusiveISO,
  startOfMonthISO,
  startOfWeekISO,
} from '@/lib/calendar/dates'
import { formatDayMonth, formatMonthYear } from '@/lib/format'
import type { CalendarView } from '@/lib/calendar/types'

function href(view: CalendarView, date: string) {
  return `/admin/calendar?view=${view}&date=${date}`
}

/** Human label for the visible window. */
function rangeLabel(view: CalendarView, anchor: string): string {
  if (view === 'month') {
    return formatMonthYear(startOfMonthISO(anchor))
  }
  const start = startOfWeekISO(anchor)
  const end = addDaysISO(start, 6)
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
}

export function CalendarHeader({
  view,
  anchor,
  today,
}: {
  view: CalendarView
  anchor: string
  today: string
}) {
  const prev =
    view === 'month'
      ? addDaysISO(startOfMonthISO(anchor), -1)
      : addDaysISO(startOfWeekISO(anchor), -7)
  const next =
    view === 'month'
      ? endOfMonthExclusiveISO(anchor)
      : addDaysISO(startOfWeekISO(anchor), 7)

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Kalendari i flotës
          </h1>
          <p className="text-muted-foreground mt-2 max-w-prose text-[15px] leading-relaxed">
            Menaxho disponueshmërinë dhe rezervimet e gjithë flotës nga një vend.
          </p>
        </div>

        {/* iOS-style segmented control */}
        <div className="inline-flex rounded-full bg-black/[0.05] p-1">
          <ViewTab href={href('week', anchor)} active={view === 'week'}>
            Javë
          </ViewTab>
          <ViewTab href={href('month', anchor)} active={view === 'month'}>
            Muaj
          </ViewTab>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={href(view, today)}
          className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium ring-1 ring-black/[0.06] transition-colors hover:bg-black/[0.02]"
        >
          Sot
        </Link>
        <div className="inline-flex items-center gap-0.5 rounded-full bg-white p-0.5 ring-1 ring-black/[0.06]">
          <Link
            href={href(view, prev)}
            aria-label="Periudha e mëparshme"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.03]"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
          <span className="text-muted-foreground/70 flex size-8 items-center justify-center">
            <CalendarDays className="size-4" aria-hidden />
          </span>
          <Link
            href={href(view, next)}
            aria-label="Periudha tjetër"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.03]"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        <p className="ml-1 text-[15px] font-semibold tracking-tight">
          {rangeLabel(view, anchor)}
        </p>
      </div>
    </header>
  )
}

function ViewTab({
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
      className={cn(
        'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-white text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  )
}

'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { EASE_OUT, springTap } from '@/components/motion/primitives'
import { Button } from '@/components/ui/button'

/* ── Types ───────────────────────────────────────────────────────────────── */

export type DateRange = { from?: Date; to?: Date }

/* ── Albanian locale strings (the site speaks Albanian) ──────────────────── */

const MONTHS = [
  'Janar',
  'Shkurt',
  'Mars',
  'Prill',
  'Maj',
  'Qershor',
  'Korrik',
  'Gusht',
  'Shtator',
  'Tetor',
  'Nëntor',
  'Dhjetor',
] as const

const MONTHS_SHORT = [
  'Jan',
  'Shk',
  'Mar',
  'Pri',
  'Maj',
  'Qer',
  'Kor',
  'Gus',
  'Sht',
  'Tet',
  'Nën',
  'Dhj',
] as const

// Monday-first, matching the Albanian / European week.
const WEEKDAYS = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'] as const

/* ── Date helpers (local-midnight, no timezone drift) ────────────────────── */

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** 42 cells (6 weeks), Monday-first, for the month containing `month`. */
function buildMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month)
  const weekday = (first.getDay() + 6) % 7 // 0 = Monday
  const start = addDays(first, -weekday)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** "16 Qer" — short, premium, native-app style. */
export function formatShort(d: Date): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

/* ── BookingDatePicker ───────────────────────────────────────────────────── *
 * Two app-style fields (Marrja / Kthimi) that open one premium range
 * calendar. Owns nothing but the open state; the selected range is lifted.
 * ────────────────────────────────────────────────────────────────────────── */

export function BookingDatePicker({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <FieldButton
        label="Marrja"
        placeholder="Zgjidh datën"
        value={value.from ? formatShort(value.from) : null}
        active={open}
        onClick={() => setOpen(true)}
      />

      <Divider />

      <FieldButton
        label="Kthimi"
        placeholder="Zgjidh datën"
        value={value.to ? formatShort(value.to) : null}
        active={open}
        onClick={() => setOpen(true)}
      />

      <CalendarSheet
        open={open}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

/* ── FieldButton — matches the widget's existing Field look, but tappable ── */

function FieldButton({
  label,
  value,
  placeholder,
  active,
  onClick,
}: {
  label: string
  value: string | null
  placeholder: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={active}
      className={cn(
        'group flex flex-1 cursor-pointer items-center gap-3 rounded-[20px] px-4 py-3.5 text-left transition-colors',
        active ? 'bg-black/[0.04]' : 'hover:bg-black/[0.025]',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
          value
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground',
        )}
      >
        <CalendarDays className="size-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
          {label}
        </span>
        <span
          className={cn(
            'truncate text-sm font-medium',
            value ? 'text-foreground' : 'text-muted-foreground/70',
          )}
        >
          {value ?? placeholder}
        </span>
      </span>
    </button>
  )
}

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden w-px self-stretch bg-black/[0.06] sm:block"
    />
  )
}

/* ── CalendarSheet — the premium floating modal / bottom sheet ───────────── */

function CalendarSheet({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean
  value: DateRange
  onChange: (range: DateRange) => void
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  // SSR-safe client guard for createPortal — false on the server, true once
  // hydrated, without a setState-in-effect.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  // Lock body scroll + close on Escape while the sheet is open.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  // One entrance everywhere: a centered card that fades + lifts + scales in,
  // like a native iOS alert/sheet. Reduced-motion → plain fade.
  const panelVariants: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.35, ease: EASE_OUT },
        },
        exit: {
          opacity: 0,
          scale: 0.96,
          y: 12,
          transition: { duration: 0.22, ease: EASE_OUT },
        },
      }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel — centered liquid-glass card (same on mobile & desktop) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Zgjidh datat e rezervimit"
            className={cn(
              'relative flex max-h-[90dvh] w-full max-w-[26rem] flex-col overflow-y-auto p-4 sm:p-5',
              // White glass surface, soft shadow, large radius.
              'border border-white/60 bg-white/80 shadow-[0_24px_70px_rgba(20,20,30,0.22)] backdrop-blur-[26px] backdrop-saturate-150',
              'rounded-[28px]',
            )}
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <CalendarBody value={value} onChange={onChange} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ── CalendarBody — header, month grid, footer ───────────────────────────── */

function CalendarBody({
  value,
  onChange,
  onClose,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
  onClose: () => void
}) {
  const summary =
    value.from && value.to
      ? `${formatShort(value.from)} – ${formatShort(value.to)}`
      : value.from
        ? `${formatShort(value.from)} · zgjidh kthimin`
        : 'Zgjidh datat'

  return (
    <div>
      {/* Header */}
      <div className="mb-1 flex items-center justify-between px-1">
        <div>
          <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
            Datat e udhëtimit
          </p>
          <p className="text-foreground text-lg font-semibold">{summary}</p>
        </div>
        <NavButton onClick={onClose} ariaLabel="Mbyll">
          <X className="size-4" aria-hidden />
        </NavButton>
      </div>

      <RangeCalendar value={value} onChange={onChange} className="mt-3" />

      {/* Footer */}
      <div className="mt-3 flex items-center gap-3 px-1">
        {(value.from || value.to) && (
          <button
            type="button"
            onClick={() => onChange({ from: undefined, to: undefined })}
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Pastro
          </button>
        )}
        <Button
          type="button"
          size="lg"
          onClick={onClose}
          disabled={!value.from}
          className="ml-auto rounded-[18px] px-7"
        >
          {value.from && value.to ? 'Konfirmo datat' : 'Konfirmo'}
        </Button>
      </div>
    </div>
  )
}

/* ── RangeCalendar — month switcher + weekday header + day grid ───────────── *
 * The reusable core: a Monday-first range picker with sliding month
 * transitions. Past days are always blocked; pass `isDateDisabled` to block
 * extra days (e.g. a car's already-booked ranges). Used both inside the hero
 * sheet and inline on the car-details booking panel, so both look identical.
 * ────────────────────────────────────────────────────────────────────────── */

export function RangeCalendar({
  value,
  onChange,
  isDateDisabled,
  isDateBooked,
  className,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
  /** Block extra days beyond the past (which is always blocked). */
  isDateDisabled?: (day: Date) => boolean
  /**
   * Mark a day as already reserved, for a distinct "taken" look (separate from
   * the plain past-day fade). Reserved days should also be blocked via
   * `isDateDisabled`; this only drives the styling + label.
   */
  isDateBooked?: (day: Date) => boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const today = React.useMemo(() => startOfDay(new Date()), [])

  const [view, setView] = React.useState<Date>(() =>
    startOfMonth(value.from ?? today),
  )
  // Direction of the last month change, for the slide transition.
  const [dir, setDir] = React.useState(0)

  const days = React.useMemo(() => buildMonthGrid(view), [view])
  const prevDisabled =
    startOfMonth(view).getTime() <= startOfMonth(today).getTime()

  const isDisabled = React.useCallback(
    (day: Date): boolean => {
      if (startOfDay(day).getTime() < today.getTime()) return true
      return isDateDisabled?.(day) ?? false
    },
    [today, isDateDisabled],
  )

  function goMonth(delta: number) {
    if (delta < 0 && prevDisabled) return
    setDir(delta)
    setView((v) => addMonths(v, delta))
  }

  // A blocked day strictly between start and end → the range can't span it.
  function rangeBlocked(start: Date, end: Date): boolean {
    for (
      let d = addDays(start, 1);
      d.getTime() < end.getTime();
      d = addDays(d, 1)
    ) {
      if (isDisabled(d)) return true
    }
    return false
  }

  function handlePick(day: Date) {
    const d = startOfDay(day)
    if (isDisabled(d)) return
    const { from, to } = value
    // Start fresh if nothing chosen, a full range exists, the tap lands
    // on/before the current start, or a blocked day sits in between.
    if (
      !from ||
      (from && to) ||
      d.getTime() <= from.getTime() ||
      rangeBlocked(from, d)
    ) {
      onChange({ from: d, to: undefined })
    } else {
      onChange({ from, to: d })
    }
  }

  const gridVariants: Variants = {
    enter: (d: number) => ({
      x: reduce ? 0 : d > 0 ? 44 : -44,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: reduce ? 0 : d > 0 ? -44 : 44,
      opacity: 0,
    }),
  }

  return (
    <div className={className}>
      {/* Month switcher */}
      <div className="mb-2 flex items-center justify-between px-1">
        <NavButton
          onClick={() => goMonth(-1)}
          disabled={prevDisabled}
          ariaLabel="Muaji i mëparshëm"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </NavButton>

        <div className="relative h-6 flex-1 overflow-hidden text-center">
          <AnimatePresence custom={dir} mode="popLayout" initial={false}>
            <motion.p
              key={`${view.getFullYear()}-${view.getMonth()}`}
              custom={dir}
              variants={gridVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="text-foreground absolute inset-0 text-base font-semibold"
            >
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </motion.p>
          </AnimatePresence>
        </div>

        <NavButton onClick={() => goMonth(1)} ariaLabel="Muaji tjetër">
          <ChevronRight className="size-4" aria-hidden />
        </NavButton>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 px-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-muted-foreground/70 py-1 text-center text-[0.7rem] font-medium"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid — fluid: scales with width (square-ish cells), so it feels
          native on any phone. Sliding month transition. */}
      <div className="relative aspect-[7/6] w-full overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.div
            key={`${view.getFullYear()}-${view.getMonth()}`}
            custom={dir}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="absolute inset-0 grid grid-cols-7 grid-rows-6 px-1"
          >
            {days.map((day) => (
              <DayCell
                key={day.getTime()}
                day={day}
                view={view}
                today={today}
                disabled={isDisabled(day)}
                booked={isDateBooked?.(day) ?? false}
                range={value}
                onPick={handlePick}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── NavButton — circular glass control ──────────────────────────────────── */

function NavButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  ariaLabel: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={reduce || disabled ? undefined : { scale: 1.05 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
      transition={springTap}
      className={cn(
        'text-foreground flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/70 shadow-sm backdrop-blur-md transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-35'
          : 'focus-visible:ring-foreground/20 hover:bg-white focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      {children}
    </motion.button>
  )
}

/* ── DayCell — touch-friendly cell with range fill + selection pop ───────── */

function DayCell({
  day,
  view,
  today,
  disabled,
  booked,
  range,
  onPick,
}: {
  day: Date
  view: Date
  today: Date
  disabled: boolean
  /** Already reserved — gets a distinct "taken" look, not the past-day fade. */
  booked: boolean
  range: DateRange
  onPick: (d: Date) => void
}) {
  const reduce = useReducedMotion()

  const outside = day.getMonth() !== view.getMonth()
  const isToday = isSameDay(day, today)

  const { from, to } = range
  const isFrom = from ? isSameDay(day, from) : false
  const isTo = to ? isSameDay(day, to) : false
  const isEndpoint = isFrom || isTo
  const hasRange = Boolean(from && to && from.getTime() !== to.getTime())
  const inRange =
    hasRange && from && to
      ? day.getTime() > from.getTime() && day.getTime() < to.getTime()
      : false

  // Connective range fill (no horizontal gaps → cells join seamlessly).
  const showRightFill = hasRange && isFrom
  const showLeftFill = hasRange && isTo

  return (
    <div className="relative flex h-full items-center justify-center">
      {/* Range fill behind everything */}
      {inRange && (
        <span className="bg-foreground/[0.06] absolute inset-x-0 inset-y-1.5" />
      )}
      {showRightFill && (
        <span className="bg-foreground/[0.06] absolute inset-y-1.5 right-0 left-1/2" />
      )}
      {showLeftFill && (
        <span className="bg-foreground/[0.06] absolute inset-y-1.5 right-1/2 left-0" />
      )}

      {/* Endpoint highlight — pops in with a soft spring */}
      <AnimatePresence>
        {isEndpoint && !outside && (
          <motion.span
            className="bg-primary absolute aspect-square h-[84%] rounded-full shadow-[0_8px_20px_rgba(20,20,30,0.28)]"
            initial={reduce ? { opacity: 1 } : { scale: 0.55, opacity: 0 }}
            animate={
              reduce ? { opacity: 1 } : { scale: [0.55, 1.08, 1], opacity: 1 }
            }
            exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>

      {/* Full-cell tap target (≥44px), with the visible circle sized to match
          the endpoint highlight so hover / today-ring / selection align. */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onPick(day)}
        aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}${booked ? ' — e rezervuar' : ''}`}
        aria-pressed={isEndpoint}
        whileTap={reduce || disabled ? undefined : { scale: 0.9 }}
        transition={springTap}
        className={cn(
          'group relative z-10 flex h-full w-full items-center justify-center focus-visible:outline-none',
          outside && 'pointer-events-none opacity-0',
          disabled && 'cursor-default',
        )}
      >
        <span
          className={cn(
            'flex aspect-square h-[84%] items-center justify-center rounded-full text-sm transition-colors',
            disabled && !outside && !booked && 'text-foreground/25',
            booked &&
              !outside &&
              'bg-rose-50 font-medium text-rose-400 line-through decoration-rose-300',
            isEndpoint && 'font-semibold text-white',
            !isEndpoint && inRange && 'text-foreground font-medium',
            !isEndpoint &&
              !inRange &&
              !disabled &&
              'text-foreground group-hover:bg-foreground/[0.05] group-focus-visible:ring-foreground/25 group-focus-visible:ring-2',
            !isEndpoint &&
              isToday &&
              'ring-foreground/25 font-semibold ring-1 ring-inset',
          )}
        >
          {day.getDate()}
        </span>
      </motion.button>
    </div>
  )
}

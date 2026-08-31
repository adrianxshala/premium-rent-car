/**
 * Pure date helpers for the fleet calendar. Everything works on
 * 'YYYY-MM-DD' strings (the shape Postgres `date` columns come back as) and is
 * DST-safe: arithmetic goes through UTC epochs so a clock change never shifts a
 * day count. No framework imports — runs on the server and in the browser.
 *
 * The whole app models ranges as half-open [start, end): the end day is free
 * (a rental returning on the 12th makes the car available on the 12th). Keep
 * that invariant everywhere here.
 */

export type ISODate = string

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** 'YYYY-MM-DD' → Date at local midnight (for formatting only, never math). */
export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Date → 'YYYY-MM-DD' using its local calendar day. */
export function toISO(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function utcEpoch(iso: ISODate): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole days from `a` to `b` (b - a). Negative if b precedes a. */
export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((utcEpoch(b) - utcEpoch(a)) / MS_PER_DAY)
}

/** Shift an ISO date by `n` days (n may be negative). */
export function addDaysISO(iso: ISODate, n: number): ISODate {
  const [y, m, d] = iso.split('-').map(Number)
  return toISO(new Date(y, m - 1, d + n))
}

/** Today as 'YYYY-MM-DD' in the server/browser local zone. */
export function todayISO(): ISODate {
  return toISO(new Date())
}

/** Monday of the week containing `iso` (ISO-8601 week, Monday start). */
export function startOfWeekISO(iso: ISODate): ISODate {
  const date = parseISO(iso)
  const dow = date.getDay() // 0=Sun … 6=Sat
  const backToMonday = (dow + 6) % 7
  return addDaysISO(iso, -backToMonday)
}

/** First day of the month containing `iso`. */
export function startOfMonthISO(iso: ISODate): ISODate {
  const [y, m] = iso.split('-').map(Number)
  return toISO(new Date(y, m - 1, 1))
}

/** First day of the *next* month (exclusive end of this month). */
export function endOfMonthExclusiveISO(iso: ISODate): ISODate {
  const [y, m] = iso.split('-').map(Number)
  return toISO(new Date(y, m, 1))
}

/** Every day in [startISO, endISOExclusive) as an ordered array. */
export function eachDayISO(
  startISO: ISODate,
  endISOExclusive: ISODate,
): ISODate[] {
  const out: ISODate[] = []
  const total = daysBetween(startISO, endISOExclusive)
  for (let i = 0; i < total; i++) out.push(addDaysISO(startISO, i))
  return out
}

/** Half-open overlap test: do [aS, aE) and [bS, bE) intersect? */
export function rangesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Is `day` inside the half-open range [start, end)? */
export function isWithin(day: ISODate, start: ISODate, end: ISODate): boolean {
  return day >= start && day < end
}

/**
 * Day of week as 0=Mon … 6=Sun, computed purely from the calendar date (no
 * `Date`, no timezone) so it is identical on the server and the client.
 * Reference: 2021-01-04 was a Monday.
 */
export function weekdayIndex(iso: ISODate): number {
  return (((daysBetween('2021-01-04', iso) % 7) + 7) % 7)
}


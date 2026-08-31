import type { Enums } from '@/types/database'
import { weekdayIndex } from '@/lib/calendar/dates'

/**
 * Albanian date parts, hard-coded rather than pulled from `Intl` on purpose:
 * ICU 'sq-AL' data differs between Node and browsers, which makes any
 * locale-formatted date rendered in a Client Component mismatch between SSR and
 * hydration. Formatting by hand keeps the output byte-identical everywhere
 * (same reasoning as `formatEur`).
 */
const MONTHS_SHORT = [
  'jan', 'shk', 'mar', 'pri', 'maj', 'qer',
  'korr', 'gush', 'sht', 'tet', 'nën', 'dhj',
]
const MONTHS_LONG = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
]
const WEEKDAYS_SHORT = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die']

/** Split 'YYYY-MM-DD' into numeric [year, month(1-12), day]. */
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number)
  return [y, m, d]
}

/**
 * e.g. 45 → "45 €", 1200 → "1.200 €". Albanian style: '.' thousands
 * separator, symbol after a space. Formatted manually (not via Intl) so the
 * output is identical on the server and in the browser — ICU currency data for
 * 'sq-AL' differs between Node and browsers and causes hydration mismatches.
 */
export function formatEur(value: number): string {
  const grouped = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped} €`
}

/** 'YYYY-MM-DD' → e.g. "7 sht 2026" (Albanian, deterministic). */
export function formatDate(isoDate: string): string {
  const [y, m, d] = parts(isoDate)
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`
}

/** 'YYYY-MM-DD' → e.g. "7 sht" (no year). */
export function formatDayMonth(isoDate: string): string {
  const [, m, d] = parts(isoDate)
  return `${d} ${MONTHS_SHORT[m - 1]}`
}

/** 'YYYY-MM-DD' → e.g. "Shtator 2026". */
export function formatMonthYear(isoDate: string): string {
  const [y, m] = parts(isoDate)
  return `${MONTHS_LONG[m - 1]} ${y}`
}

/** Short Albanian weekday for a date, e.g. "Hën". */
export function formatWeekdayShort(isoDate: string): string {
  return WEEKDAYS_SHORT[weekdayIndex(isoDate)]
}

export const CATEGORY_LABELS: Record<Enums<'car_category'>, string> = {
  suv: 'SUV',
  sedan: 'Sedan',
  economy: 'Ekonomik',
}

export const STATUS_LABELS: Record<Enums<'car_status'>, string> = {
  available: 'E disponueshme',
  maintenance: 'Në mirëmbajtje',
  retired: 'E tërhequr',
}

export const BOOKING_STATUS_LABELS: Record<Enums<'booking_status'>, string> = {
  pending: 'Në pritje',
  confirmed: 'Konfirmuar',
  cancelled: 'Anuluar',
  completed: 'Përfunduar',
}

export const BLOCK_KIND_LABELS: Record<Enums<'car_block_kind'>, string> = {
  maintenance: 'Mirëmbajtje',
  unavailable: 'E padisponueshme',
}

export const TRANSMISSION_LABELS: Record<Enums<'transmission'>, string> = {
  automatic: 'Automatik',
  manual: 'Manual',
}

export const FUEL_LABELS: Record<Enums<'fuel_type'>, string> = {
  petrol: 'Benzinë',
  diesel: 'Naftë',
  hybrid: 'Hibrid',
  electric: 'Elektrik',
}

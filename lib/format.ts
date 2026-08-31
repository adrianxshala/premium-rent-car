import type { Enums } from '@/types/database'

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

const dateFmt = new Intl.DateTimeFormat('sq-AL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** 'YYYY-MM-DD' → localized date (Albanian). */
export function formatDate(isoDate: string): string {
  return dateFmt.format(new Date(`${isoDate}T00:00:00`))
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

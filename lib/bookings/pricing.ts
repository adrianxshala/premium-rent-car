import type { Car } from '@/types/database'

/**
 * Pricing is computed here and ONLY here — never trusted from the client
 * (Sprint 2 DoD). Both the live UI estimate and the server-side INSERT call
 * this same function, so what the user sees is what the server charges.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Rental days for a half-open range [start, end): the number of nights.
 * A pickup on Jun 1 and return on Jun 5 is 4 days. Dates are 'YYYY-MM-DD';
 * parsed as UTC so DST / local offsets never shift the count.
 */
export function rentalDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  return Math.round((end - start) / MS_PER_DAY)
}

export type PriceBreakdown = {
  days: number
  pricePerDay: number
  total: number
}

/** Total for booking `car` over [startDate, endDate). */
export function computePrice(
  car: Pick<Car, 'price_per_day'>,
  startDate: string,
  endDate: string,
): PriceBreakdown {
  const days = rentalDays(startDate, endDate)
  const total = Math.round(car.price_per_day * days * 100) / 100
  return {
    days,
    pricePerDay: car.price_per_day,
    total,
  }
}

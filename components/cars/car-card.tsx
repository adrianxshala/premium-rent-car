import Image from 'next/image'
import Link from 'next/link'
import { Car as CarIcon } from 'lucide-react'

import type { Car } from '@/types/database'
import { CATEGORY_LABELS, formatEur } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CarCardProps = {
  car: Pick<
    Car,
    | 'id'
    | 'make'
    | 'model'
    | 'year'
    | 'category'
    | 'status'
    | 'price_per_day'
    | 'image_urls'
  >
  /** Searched range to carry into the detail page, so it prefills the form. */
  dates?: { from: string; to: string }
  /**
   * The car has an active booking covering today (rented out right now).
   * Only meaningful for `status='available'` cars — it drives the "E zënë"
   * badge while keeping the car bookable for free future dates.
   */
  occupied?: boolean
}

/** Availability badge state, derived from status + current occupancy. */
function availability(
  status: Car['status'],
  occupied: boolean,
): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  if (status === 'maintenance')
    return { label: 'Në mirëmbajtje', variant: 'outline' }
  // status === 'available' (retired cars never reach the listing)
  if (occupied) return { label: 'E zënë', variant: 'secondary' }
  return { label: 'E lirë', variant: 'default' }
}

export function CarCard({ car, dates, occupied = false }: CarCardProps) {
  const cover = car.image_urls[0]
  const badge = availability(car.status, occupied)
  const href = dates
    ? `/cars/${car.id}?from=${dates.from}&to=${dates.to}`
    : `/cars/${car.id}`

  return (
    <Link
      href={href}
      className="focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="bg-muted relative aspect-[4/3] w-full">
          {cover ? (
            <Image
              src={cover}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <CarIcon className="size-10" aria-hidden />
            </div>
          )}
          <Badge variant={badge.variant} className="absolute top-3 left-3">
            {badge.label}
          </Badge>
        </div>

        <CardContent className="flex flex-col gap-1 px-5 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold tracking-tight">
              {car.make} {car.model}
            </h3>
            <Badge variant="outline">{CATEGORY_LABELS[car.category]}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{car.year}</p>
        </CardContent>

        <CardFooter className="flex items-baseline justify-between px-5 pt-3 pb-5">
          <p className="text-lg font-semibold">
            {formatEur(car.price_per_day)}
            <span className="text-muted-foreground text-sm font-normal">
              {' '}
              / ditë
            </span>
          </p>
          <p className="text-muted-foreground text-xs">pa parapagesë</p>
        </CardFooter>
      </Card>
    </Link>
  )
}

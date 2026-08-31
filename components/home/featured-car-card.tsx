import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  Car as CarIcon,
  Cog,
  Fuel,
} from 'lucide-react'

import type { Car } from '@/types/database'
import {
  CATEGORY_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  formatEur,
} from '@/lib/format'

type FeaturedCar = Pick<
  Car,
  | 'id'
  | 'make'
  | 'model'
  | 'year'
  | 'category'
  | 'status'
  | 'price_per_day'
  | 'image_urls'
  | 'transmission'
  | 'fuel_type'
>

export function FeaturedCarCard({ car }: { car: FeaturedCar }) {
  const cover = car.image_urls[0]
  const available = car.status === 'available'

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group shadow-soft hover:shadow-float focus-visible:ring-ring relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white ring-1 ring-black/[0.04] transition-[box-shadow] duration-300 focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="bg-secondary relative aspect-[16/11] w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <CarIcon className="size-12" aria-hidden />
          </div>
        )}

        {/* Floating price badge — glass over imagery. */}
        <div className="glass shadow-soft absolute top-4 left-4 rounded-full px-3.5 py-1.5">
          <span className="text-sm font-semibold">
            {formatEur(car.price_per_day)}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {' '}
            /ditë
          </span>
        </div>

        <span className="glass absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-medium">
          {CATEGORY_LABELS[car.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {car.make} {car.model}
            </h3>
            <p className="text-muted-foreground text-sm">Kapar 20% e totalit</p>
          </div>
          <span className="bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.06] pt-4 text-sm">
          <Spec icon={<CalendarDays className="size-4" aria-hidden />}>
            {car.year}
          </Spec>
          <Spec icon={<Cog className="size-4" aria-hidden />}>
            {TRANSMISSION_LABELS[car.transmission]}
          </Spec>
          <Spec icon={<Fuel className="size-4" aria-hidden />}>
            {FUEL_LABELS[car.fuel_type]}
          </Spec>
          <span
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              available
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
            />
            {available ? 'E lirë' : 'E zënë'}
          </span>
        </div>
      </div>
    </Link>
  )
}

function Spec({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  )
}

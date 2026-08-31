import Link from 'next/link'
import { CarFront, Pencil, Plus } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatEur,
} from '@/lib/format'
import type { Enums } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'

const STATUS_TONES: Record<Enums<'car_status'>, string> = {
  available: 'bg-emerald-50 text-emerald-700',
  maintenance: 'bg-amber-50 text-amber-700',
  retired: 'bg-secondary text-muted-foreground',
}

export default async function AdminCarsPage() {
  const supabase = await createClient()
  const { data: cars } = await supabase
    .from('cars')
    .select(
      'id, make, model, year, category, status, price_per_day, image_urls',
    )
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })

  const list = cars ?? []

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Flota</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Makinat
          </h1>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/cars/new">
            <Plus className="size-4" aria-hidden />
            Shto makinë
          </Link>
        </Button>
      </div>

      {list.length > 0 ? (
        <StaggerGroup className="flex flex-col gap-3" stagger={0.05}>
          {list.map((car) => {
            const cover = car.image_urls[0]
            return (
              <StaggerItem key={car.id} lift={-2}>
                <Link
                  href={`/admin/cars/${car.id}/edit`}
                  className="group shadow-soft hover:shadow-float flex items-center gap-4 rounded-[24px] bg-white p-3 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300 sm:p-4"
                >
                  <div className="bg-secondary relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={`${car.make} ${car.model}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center">
                        <CarFront className="size-6" aria-hidden />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold tracking-tight">
                        {car.make} {car.model}
                      </p>
                      <span className="text-muted-foreground text-sm">
                        {car.year}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {CATEGORY_LABELS[car.category]} ·{' '}
                      {formatEur(car.price_per_day)}/ditë
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONES[car.status]}`}
                    >
                      {STATUS_LABELS[car.status]}
                    </span>
                  </div>

                  <span className="bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors">
                    <Pencil className="size-4" aria-hidden />
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      ) : (
        <Reveal>
          <div className="panel flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
              <CarFront className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Ende pa makina
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Shto makinën e parë në flotë.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/admin/cars/new">
                <Plus className="size-4" aria-hidden />
                Shto makinë
              </Link>
            </Button>
          </div>
        </Reveal>
      )}
    </>
  )
}

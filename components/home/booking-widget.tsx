'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tappable } from '@/components/motion/primitives'
import {
  BookingDatePicker,
  type DateRange,
} from '@/components/home/booking-calendar'

const LOCATION = 'Suharekë'

/** 'YYYY-MM-DD' for a Date, using its local calendar day. */
function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * App-style search card. It does not book directly — it collects intent
 * (where / when) and hands off to the car listing, where availability is
 * checked per car against the calendar.
 */
export function BookingWidget() {
  const router = useRouter()

  const [range, setRange] = useState<DateRange>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('location', LOCATION)
    if (range.from) params.set('from', toISODate(range.from))
    if (range.to) params.set('to', toISODate(range.to))
    router.push(`/cars${params.size ? `?${params.toString()}` : ''}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shadow-float rounded-[32px] bg-white/92 p-3 ring-1 ring-black/[0.05] backdrop-blur-2xl sm:p-4"
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:gap-2">
        <Field
          icon={<MapPin className="size-4" aria-hidden />}
          label="Vendndodhja"
        >
          <span className="text-foreground block w-full truncate text-sm font-medium">
            {LOCATION}
          </span>
        </Field>

        <Divider />

        <BookingDatePicker value={range} onChange={setRange} />

        <Tappable className="flex w-full shrink-0 sm:w-auto">
          <Button
            type="submit"
            size="lg"
            variant="brand"
            className="h-auto w-full rounded-[22px] px-9 py-4 text-base font-semibold sm:py-0"
          >
            <Search className="size-[1.15rem]" aria-hidden />
            Kërko
          </Button>
        </Tappable>
      </div>
    </form>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-[20px] px-4 py-3.5 transition-colors hover:bg-black/[0.025]">
      <span className="bg-secondary text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
          {label}
        </span>
        {children}
      </span>
    </label>
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

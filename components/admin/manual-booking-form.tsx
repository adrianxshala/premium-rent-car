'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

import type { BookingFormState } from '@/app/(site)/admin/actions'
import { computePrice } from '@/lib/bookings/pricing'
import { formatEur } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  RangeCalendar,
  type DateRange,
} from '@/components/home/booking-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type CarOption = {
  id: string
  make: string
  model: string
  year: number
  price_per_day: number
}

type Action = (
  state: BookingFormState,
  formData: FormData,
) => Promise<BookingFormState> | BookingFormState

/** Local-midnight Date for a 'YYYY-MM-DD' string (no timezone drift). */
function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 'YYYY-MM-DD' for a Date, using its local calendar day. */
function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function ManualBookingForm({
  cars,
  bookedByCar,
  action,
}: {
  cars: CarOption[]
  /** Active (taken) date ranges per car id — disabled in the calendar. */
  bookedByCar: Record<string, { start: string; end: string }[]>
  action: Action
}) {
  const [state, formAction] = useActionState<BookingFormState, FormData>(
    action,
    null,
  )
  const [carId, setCarId] = React.useState(cars[0]?.id ?? '')
  const [range, setRange] = React.useState<DateRange>({})

  const car = cars.find((c) => c.id === carId)
  const booked = React.useMemo(
    () => bookedByCar[carId] ?? [],
    [bookedByCar, carId],
  )
  const fieldErr = state?.fieldErrors

  // A day is taken if it falls in any active half-open [start, end) range.
  const isDateBooked = React.useCallback(
    (day: Date): boolean => {
      const t = day.getTime()
      return booked.some((r) => {
        const start = parseISODate(r.start).getTime()
        const end = parseISODate(r.end).getTime()
        return t >= start && t < end
      })
    },
    [booked],
  )

  const price =
    car && range.from && range.to && range.to > range.from
      ? computePrice(
          { price_per_day: car.price_per_day },
          toISODate(range.from),
          toISODate(range.to),
        )
      : null

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-500/15">
          {state.error}
        </p>
      )}

      {/* Values the calendar + select drive, submitted as plain fields. */}
      <input type="hidden" name="carId" value={carId} />
      <input
        type="hidden"
        name="startDate"
        value={range.from ? toISODate(range.from) : ''}
      />
      <input
        type="hidden"
        name="endDate"
        value={range.to ? toISODate(range.to) : ''}
      />

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Makina</h2>
        <div className="mt-5 flex flex-col gap-1.5">
          <Label htmlFor="carId-select">Zgjidh makinën</Label>
          <select
            id="carId-select"
            value={carId}
            onChange={(e) => {
              setCarId(e.target.value)
              setRange({}) // a new car has its own taken dates
            }}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          >
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model} {c.year} — {formatEur(c.price_per_day)}/ditë
              </option>
            ))}
          </select>
          {fieldErr?.carId?.[0] && (
            <p className="text-destructive text-xs">{fieldErr.carId[0]}</p>
          )}
        </div>
      </section>

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Datat e qirasë</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Kliko datën e marrjes, pastaj datën e kthimit. Datat e zëna janë të
          bllokuara.
        </p>
        <RangeCalendar
          value={range}
          onChange={setRange}
          isDateDisabled={isDateBooked}
          isDateBooked={isDateBooked}
          className="mx-auto mt-4 w-full max-w-[26rem]"
        />
        {(fieldErr?.startDate?.[0] || fieldErr?.endDate?.[0]) && (
          <p className="text-destructive mt-1 text-center text-xs">
            {fieldErr.startDate?.[0] ?? fieldErr.endDate?.[0]}
          </p>
        )}
        {price && (
          <dl className="mx-auto mt-4 max-w-[26rem] rounded-2xl bg-black/[0.025] p-4 text-sm">
            <div className="flex justify-between font-medium">
              <dt className="text-muted-foreground font-normal">
                {formatEur(car!.price_per_day)} × {price.days} ditë
              </dt>
              <dd>{formatEur(price.total)}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Klienti</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Emri i plotë"
            name="customerName"
            error={fieldErr?.customerName}
          >
            <Input
              id="customerName"
              name="customerName"
              placeholder="P.sh. Arben Krasniqi"
              autoComplete="off"
              required
            />
          </Field>
          <Field
            label="Telefoni"
            name="customerPhone"
            error={fieldErr?.customerPhone}
          >
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="+383 4X XXX XXX"
              autoComplete="off"
              required
            />
          </Field>
          <Field
            label="Email (opsional)"
            name="customerEmail"
            error={fieldErr?.customerEmail}
          >
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              placeholder="klienti@example.com"
              autoComplete="off"
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/admin/bookings">Anulo</Link>
        </Button>
        <Submit disabled={!car || !price} />
      </div>
    </form>
  )
}

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="rounded-full"
      disabled={pending || disabled}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      Krijo rezervimin
    </Button>
  )
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string[]
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5')}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error?.[0] && <p className="text-destructive text-xs">{error[0]}</p>}
    </div>
  )
}

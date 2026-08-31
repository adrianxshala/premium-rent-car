'use client'

import { useCallback, useState } from 'react'
import { ChevronLeft } from 'lucide-react'

import type { DateRange as BookedRange } from '@/lib/bookings/availability'
import { computePrice } from '@/lib/bookings/pricing'
import { formatDate, formatEur } from '@/lib/format'
import {
  RangeCalendar,
  type DateRange,
} from '@/components/home/booking-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

/** Uppercase the first letter of every word; leaves the rest as typed. */
function capitalizeWords(value: string): string {
  return value.replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Step = 'dates' | 'info' | 'summary'

type BookingPanelProps = {
  carId: string
  carTitle: string
  pricePerDay: number
  available: boolean
  bookedRanges: BookedRange[]
  /** Dates carried over from the search, 'YYYY-MM-DD' (prefilled if free). */
  initialFrom?: string
  initialTo?: string
  /** Prefill for a logged-in visitor (the flow itself needs no account). */
  defaultName?: string
  defaultEmail?: string
}

/** True if [from, to) overlaps any booked night — i.e. the range isn't free. */
function rangeOverlapsBooked(
  from: Date,
  to: Date,
  bookedRanges: BookedRange[],
): boolean {
  const f = from.getTime()
  const t = to.getTime()
  return bookedRanges.some((r) => {
    const start = parseISODate(r.start).getTime()
    const end = parseISODate(r.end).getTime()
    return f < end && start < t
  })
}

/**
 * Build the starting range from the search dates — but only if it's a valid,
 * future, non-overlapping period. Otherwise start empty.
 */
function initialRange(
  initialFrom: string | undefined,
  initialTo: string | undefined,
  bookedRanges: BookedRange[],
): DateRange {
  if (!initialFrom || !initialTo) return {}
  const from = parseISODate(initialFrom)
  const to = parseISODate(initialTo)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (to <= from || from < today) return {}
  if (rangeOverlapsBooked(from, to, bookedRanges)) return {}
  return { from, to }
}

export function BookingPanel({
  carId,
  carTitle,
  pricePerDay,
  available,
  bookedRanges,
  initialFrom,
  initialTo,
  defaultName = '',
  defaultEmail = '',
}: BookingPanelProps) {
  const [step, setStep] = useState<Step>('dates')
  const [range, setRange] = useState<DateRange>(() =>
    initialRange(initialFrom, initialTo, bookedRanges),
  )
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // True for every occupied night. Booked ranges are half-open [start, end):
  // the last held night is end-1, so a new rental may still begin on `end`.
  // Drives both the block (can't pick it) and the "reserved" look. (Past days
  // are blocked by the calendar itself.)
  const isDateBooked = useCallback(
    (day: Date): boolean => {
      const t = day.getTime()
      return bookedRanges.some((r) => {
        const start = parseISODate(r.start).getTime()
        const end = parseISODate(r.end).getTime()
        return t >= start && t < end
      })
    },
    [bookedRanges],
  )

  const price =
    range.from && range.to && range.to > range.from
      ? computePrice(
          { price_per_day: pricePerDay },
          toISODate(range.from),
          toISODate(range.to),
        )
      : null

  const infoValid =
    name.trim().length >= 2 &&
    EMAIL_RE.test(email.trim()) &&
    phone.trim().length >= 6

  function goToInfo() {
    if (!price) return
    setError(null)
    setStep('info')
  }

  function goToSummary() {
    if (!infoValid) {
      setError('Plotëso emrin, email-in dhe telefonin për të vazhduar.')
      return
    }
    setError(null)
    setStep('summary')
  }

  async function handleSubmit() {
    if (!range.from || !range.to || !price) return
    setSubmitting(true)
    setError(null)

    try {
      // Create the (confirmed) booking with the contact details, then send the
      // visitor to their confirmation page. No account, no online payment.
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          startDate: toISODate(range.from),
          endDate: toISODate(range.to),
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        setError(data?.error ?? 'Rezervimi dështoi. Provo sërish.')
        setSubmitting(false)
        return
      }

      const booking = (await res.json()) as { id: string; accessToken: string }
      window.location.href = `/booking/${booking.id}/confirmed?token=${booking.accessToken}`
    } catch {
      setError('Probleme me lidhjen. Provo sërish.')
      setSubmitting(false)
    }
  }

  return (
    <div className="shadow-float flex flex-col gap-4 rounded-[28px] bg-white p-5 ring-1 ring-black/[0.04] sm:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            {formatEur(pricePerDay)}
            <span className="text-muted-foreground text-base font-normal">
              {' '}
              / ditë
            </span>
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Pagesa në marrjen e makinës
          </p>
        </div>
      </div>

      {!available ? (
        <p className="text-muted-foreground text-sm">
          Kjo makinë nuk është e disponueshme për rezervim tani.
        </p>
      ) : (
        <>
          <Stepper step={step} />
          <div className="divider-soft" />

          {/* ── Step 1: dates ────────────────────────────────────────── */}
          {step === 'dates' && (
            <>
              <RangeCalendar
                value={range}
                onChange={setRange}
                isDateDisabled={isDateBooked}
                isDateBooked={isDateBooked}
                className="mx-auto w-full max-w-[24rem]"
              />

              {price && (
                <PriceBreakdown pricePerDay={pricePerDay} price={price} />
              )}

              <Button
                onClick={goToInfo}
                disabled={!price}
                className="h-11 w-full rounded-2xl text-base"
              >
                Vazhdo
              </Button>
            </>
          )}

          {/* ── Step 2: personal information ─────────────────────────── */}
          {step === 'info' && (
            <>
              <div className="flex flex-col gap-3.5">
                <Field
                  id="booking-name"
                  label="Emri i plotë"
                  value={name}
                  onChange={(v) => setName(capitalizeWords(v))}
                  placeholder="P.sh. Arben Krasniqi"
                  autoComplete="name"
                />
                <Field
                  id="booking-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="ti@example.com"
                  autoComplete="email"
                />
                <Field
                  id="booking-phone"
                  label="Telefoni"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+383 4X XXX XXX"
                  autoComplete="tel"
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-2.5">
                <BackButton onClick={() => setStep('dates')} />
                <Button
                  onClick={goToSummary}
                  disabled={!infoValid}
                  className="h-11 flex-1 rounded-2xl text-base"
                >
                  Vazhdo
                </Button>
              </div>
            </>
          )}

          {/* ── Step 3: summary + confirm ────────────────────────────── */}
          {step === 'summary' && price && range?.from && range?.to && (
            <>
              <dl className="rounded-2xl bg-black/[0.025] p-4 text-sm">
                <SummaryRow label="Makina" value={carTitle} />
                <SummaryRow
                  label="Datat"
                  value={`${formatDate(toISODate(range.from))} → ${formatDate(toISODate(range.to))}`}
                />
                <SummaryRow
                  label={`${formatEur(pricePerDay)} × ${price.days} ditë`}
                  value={formatEur(price.total)}
                />
                <div className="mt-2 flex justify-between border-t border-black/[0.06] pt-2 font-semibold">
                  <dt>Totali</dt>
                  <dd>{formatEur(price.total)}</dd>
                </div>
              </dl>

              <p className="text-muted-foreground text-xs">
                {name.trim()} · {email.trim()} · {phone.trim()}
              </p>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-2.5">
                <BackButton
                  onClick={() => setStep('info')}
                  disabled={submitting}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-11 flex-1 rounded-2xl text-base"
                >
                  {submitting ? 'Duke rezervuar…' : 'Konfirmo rezervimin'}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const STEP_INDEX: Record<Step, number> = { dates: 0, info: 1, summary: 2 }
const STEP_TITLES = ['Datat', 'Të dhënat', 'Përmbledhja']

function Stepper({ step }: { step: Step }) {
  const current = STEP_INDEX[step]
  return (
    <div className="flex items-center gap-1.5">
      {STEP_TITLES.map((title, i) => {
        const active = i <= current
        return (
          <div key={title} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1 rounded-full transition-colors ${
                active ? 'bg-primary' : 'bg-black/[0.08]'
              }`}
            />
            <span
              className={`text-[0.7rem] font-medium ${
                i === current ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {title}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PriceBreakdown({
  pricePerDay,
  price,
}: {
  pricePerDay: number
  price: { days: number; total: number }
}) {
  return (
    <dl className="rounded-2xl bg-black/[0.025] p-4 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          {formatEur(pricePerDay)} × {price.days} ditë
        </dt>
        <dd>{formatEur(price.total)}</dd>
      </div>
      <div className="mt-2 flex justify-between border-t border-black/[0.06] pt-2 font-semibold">
        <dt>Total</dt>
        <dd>{formatEur(price.total)}</dd>
      </div>
    </dl>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-xl"
      />
    </div>
  )
}

function BackButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-2xl px-4"
      aria-label="Kthehu"
    >
      <ChevronLeft className="size-4" aria-hidden />
    </Button>
  )
}

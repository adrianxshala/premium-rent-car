'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { Check, Loader2 } from 'lucide-react'

import { updateBookingStatus } from '@/app/(site)/admin/actions'
import { BOOKING_TRANSITIONS } from '@/lib/bookings/stateMachine'
import { BOOKING_STATUS_LABELS } from '@/lib/format'
import type { Enums } from '@/types/database'
import { cn } from '@/lib/utils'

export function BookingStatusControl({
  id,
  status,
}: {
  id: string
  status: Enums<'booking_status'>
}) {
  const options = BOOKING_TRANSITIONS[status]

  if (options.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        Status përfundimtar — pa veprime.
      </p>
    )
  }

  return (
    <form action={updateBookingStatus} className="flex items-center gap-2">
      <input type="hidden" name="bookingId" value={id} />
      <input type="hidden" name="from" value={status} />
      <select
        name="to"
        defaultValue=""
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-full border bg-transparent px-3 text-xs font-medium shadow-xs outline-none focus-visible:ring-[3px]',
        )}
      >
        {/* No-op placeholder so clicking ✓ never applies an unintended status
            (the action rejects an empty/invalid `to`). The admin must pick. */}
        <option value="">Ndrysho statusin…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            → {BOOKING_STATUS_LABELS[opt]}
          </option>
        ))}
      </select>
      <Apply />
    </form>
  )
}

function Apply() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
      aria-label="Apliko statusin"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Check className="size-4" aria-hidden />
      )}
    </button>
  )
}

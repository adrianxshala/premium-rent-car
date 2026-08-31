import Link from 'next/link'
import { ArrowLeft, CarFront } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { createManualBooking } from '@/app/(site)/admin/actions'
import {
  ManualBookingForm,
  type CarOption,
} from '@/components/admin/manual-booking-form'

/**
 * Admin desk: log an offline rental (a walk-in who collects the car in person).
 * Creates a `confirmed` booking that holds the chosen dates — see
 * `createManualBooking`. We seed the calendar with each car's already-taken
 * ranges so the admin can't pick a conflicting window (the action re-checks
 * server-side regardless).
 */
export default async function NewManualBookingPage() {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select('id, make, model, year, price_per_day')
    .eq('status', 'available')
    .order('make')

  // Taken date ranges per car, via the same RPC the public calendar uses — its
  // "booked" definition (confirmed OR a live pending hold) is the unified one,
  // consistent with the action's is_car_available re-check.
  const carList = cars ?? []
  const rangeResults = await Promise.all(
    carList.map((c) => supabase.rpc('car_booked_ranges', { p_car_id: c.id })),
  )
  const bookedByCar: Record<string, { start: string; end: string }[]> = {}
  carList.forEach((c, i) => {
    bookedByCar[c.id] = (rangeResults[i].data ?? []).map((r) => ({
      start: r.start_date,
      end: r.end_date,
    }))
  })

  return (
    <>
      <Link
        href="/admin/bookings"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Rezervimet
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Rezervim manual
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Klienti e merr makinën te lokali. Rezervimi krijohet i konfirmuar dhe i
        bllokon datat si çdo rezervim online.
      </p>

      {carList.length > 0 ? (
        <ManualBookingForm
          cars={carList as CarOption[]}
          bookedByCar={bookedByCar}
          action={createManualBooking}
        />
      ) : (
        <div className="panel flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
            <CarFront className="size-6" aria-hidden />
          </span>
          <p className="text-lg font-semibold tracking-tight">
            Asnjë makinë e disponueshme
          </p>
          <p className="text-muted-foreground text-sm">
            Shto një makinë me status “E disponueshme” për të krijuar një
            rezervim.
          </p>
        </div>
      )}
    </>
  )
}

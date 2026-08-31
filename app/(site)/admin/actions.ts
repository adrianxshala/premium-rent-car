'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { carSchema } from '@/lib/validators/car'
import { manualBookingSchema } from '@/lib/validators/booking'
import { isCarAvailable } from '@/lib/bookings/availability'
import { computePrice } from '@/lib/bookings/pricing'
import { canTransition, type BookingStatus } from '@/lib/bookings/stateMachine'

export type CarFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

/** Pull + coerce the car fields out of a submitted form. */
function parseCarForm(formData: FormData) {
  let imageUrls: unknown = []
  try {
    imageUrls = JSON.parse((formData.get('imageUrls') as string) || '[]')
  } catch {
    imageUrls = []
  }

  return carSchema.safeParse({
    make: formData.get('make'),
    model: formData.get('model'),
    year: formData.get('year'),
    category: formData.get('category'),
    status: formData.get('status'),
    transmission: formData.get('transmission'),
    fuel_type: formData.get('fuel_type'),
    price_per_day: formData.get('price_per_day'),
    description: formData.get('description') || undefined,
    image_urls: imageUrls,
  })
}

export async function createCar(
  _prev: CarFormState,
  formData: FormData,
): Promise<CarFormState> {
  await requireAdmin()

  const parsed = parseCarForm(formData)
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { description, ...rest } = parsed.data
  const { error } = await supabase
    .from('cars')
    .insert({ ...rest, description: description || null })

  if (error) return { error: error.message }

  revalidatePath('/admin/cars')
  revalidatePath('/admin')
  revalidatePath('/cars')
  redirect('/admin/cars')
}

export async function updateCar(
  id: string,
  _prev: CarFormState,
  formData: FormData,
): Promise<CarFormState> {
  await requireAdmin()

  const parsed = parseCarForm(formData)
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { description, ...rest } = parsed.data
  const { error } = await supabase
    .from('cars')
    .update({ ...rest, description: description || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/cars')
  revalidatePath('/admin')
  revalidatePath('/cars')
  revalidatePath(`/cars/${id}`)
  redirect('/admin/cars')
}

/** Soft delete (ADR-5): retire a car so its booking history stays intact. */
export async function retireCar(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()
  await supabase.from('cars').update({ status: 'retired' }).eq('id', id)

  revalidatePath('/admin/cars')
  revalidatePath('/admin')
  revalidatePath('/cars')
}

/** Hard delete — only succeeds for a car with no bookings (FK protects history). */
export async function deleteCar(
  id: string,
): Promise<{ error?: string } | void> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('cars').delete().eq('id', id)

  if (error) {
    return {
      error:
        'Makina ka rezervime në histori — nuk fshihet dot. Përdor “Tërhiq nga flota”.',
    }
  }

  revalidatePath('/admin/cars')
  revalidatePath('/admin')
  revalidatePath('/cars')
}

export type BookingFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

/** Postgres exclusion_violation — the bookings_no_overlap constraint fired. */
const PG_EXCLUSION_VIOLATION = '23P01'

/**
 * Create an offline booking from the admin desk — a walk-in who takes the car
 * physically. This is the right way to mark a car "taken" for a date window:
 * it reuses the same date model as online bookings, so the no-overlap
 * constraint and the public calendar block these dates automatically. It is
 * NOT a car-status toggle (that's for maintenance/retire, which carry no dates).
 *
 * The booking is created already `confirmed`, holding the dates (no
 * expires_at). When the car comes back, the admin moves it to `completed`,
 * which frees the dates.
 */
export async function createManualBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  await requireAdmin()

  const parsed = manualBookingSchema.safeParse({
    carId: formData.get('carId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    customerEmail: formData.get('customerEmail') || undefined,
  })
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const {
    carId,
    startDate,
    endDate,
    customerName,
    customerPhone,
    customerEmail,
  } = parsed.data

  // Service-role: there is no admin INSERT policy on bookings by design (the
  // public flow writes through this same privileged path). requireAdmin above
  // is the authorization gate.
  const admin = createAdminClient()

  const { data: car, error: carError } = await admin
    .from('cars')
    .select('id, status, price_per_day')
    .eq('id', carId)
    .single()
  if (carError || !car) return { error: 'Makina nuk u gjet.' }
  if (car.status !== 'available') {
    return { error: 'Kjo makinë nuk është e disponueshme për rezervim.' }
  }

  // Release dead pending holds, then pre-check the window. The DB EXCLUDE
  // constraint remains the final arbiter on the INSERT below (ADR-3).
  const { error: expireError } = await admin.rpc('expire_stale_bookings')
  if (expireError) console.error('expire_stale_bookings failed:', expireError)

  if (!(await isCarAvailable(admin, carId, startDate, endDate))) {
    return { error: 'Makina është e zënë në këto data.' }
  }

  const { total } = computePrice(car, startDate, endDate)

  const { error: insertError } = await admin.from('bookings').insert({
    car_id: carId,
    user_id: null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail ?? null,
    start_date: startDate,
    end_date: endDate,
    status: 'confirmed',
    total_price: total,
    expires_at: null,
  })

  if (insertError) {
    if (insertError.code === PG_EXCLUSION_VIOLATION) {
      return { error: 'Makina sapo u zu në këto data. Provo data të tjera.' }
    }
    return { error: insertError.message }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  revalidatePath('/cars')
  redirect('/admin/bookings')
}

const statusSchema = z.object({
  bookingId: z.guid(),
  from: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  to: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
})

/** Admin manual status change — guarded by the booking state machine. */
export async function updateBookingStatus(formData: FormData): Promise<void> {
  await requireAdmin()

  const parsed = statusSchema.safeParse({
    bookingId: formData.get('bookingId'),
    from: formData.get('from'),
    to: formData.get('to'),
  })
  if (!parsed.success) return

  const { bookingId, from, to } = parsed.data
  if (from === to) return
  if (!canTransition(from as BookingStatus, to as BookingStatus)) return

  const supabase = await createClient()
  await supabase.from('bookings').update({ status: to }).eq('id', bookingId)

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
}

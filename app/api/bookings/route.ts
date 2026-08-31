import { after } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  notifyAdminsOfNewBooking,
  sendBookingConfirmation,
} from '@/lib/email/notifications'
import { getUser } from '@/lib/auth/dal'
import { HttpError, withGuard } from '@/lib/auth/guards'
import { isCarAvailable } from '@/lib/bookings/availability'
import { computePrice } from '@/lib/bookings/pricing'
import { createBookingSchema } from '@/lib/validators/booking'

/** Postgres exclusion_violation — the bookings_no_overlap constraint fired. */
const PG_EXCLUSION_VIOLATION = '23P01'

/**
 * POST /api/bookings — create a confirmed booking.
 *
 * Guest-friendly: NO login required. The visitor supplies the car, dates and
 * contact details (name/email/phone); the price is computed server-side and
 * the booking is inserted with the service-role client (the controlled write
 * path — there is no public INSERT policy by design). There is no online
 * payment, so the booking is created already `confirmed` and holds the dates
 * immediately. If the caller happens to be logged in, the booking is linked to
 * their profile so it shows on their dashboard. Auth is otherwise untouched.
 *
 * Returns the booking id + its access_token: the unguessable secret the client
 * then uses to view the confirmation without a session.
 */
export const POST = withGuard(async (request) => {
  const body = await request.json().catch(() => null)
  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Të dhëna të pavlefshme.'
    throw new HttpError(400, message)
  }
  const {
    carId,
    startDate,
    endDate,
    customerName,
    customerEmail,
    customerPhone,
  } = parsed.data

  // Optional: a signed-in visitor gets the booking attached to their account.
  const user = await getUser()

  const admin = createAdminClient()

  // The car must exist and be rentable.
  const { data: car, error: carError } = await admin
    .from('cars')
    .select('id, status, price_per_day')
    .eq('id', carId)
    .single()

  if (carError || !car) throw new HttpError(404, 'Makina nuk u gjet.')
  if (car.status !== 'available') {
    throw new HttpError(409, 'Kjo makinë nuk është e disponueshme.')
  }

  // Clean pre-check (the constraint still guards the race).
  if (!(await isCarAvailable(admin, carId, startDate, endDate))) {
    throw new HttpError(409, 'Datat e zgjedhura janë të zëna.')
  }

  const { total } = computePrice(car, startDate, endDate)

  const { data: booking, error: insertError } = await admin
    .from('bookings')
    .insert({
      car_id: carId,
      user_id: user?.id ?? null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      status: 'confirmed',
      total_price: total,
      expires_at: null,
    })
    .select('id, access_token')
    .single()

  if (insertError) {
    if (insertError.code === PG_EXCLUSION_VIOLATION) {
      throw new HttpError(409, 'Datat e zgjedhura sapo u zunë. Provo të tjera.')
    }
    throw insertError
  }

  // Notify admins of the new booking and email the customer their confirmation,
  // both without delaying the response. Best-effort: each helper swallows its
  // own errors (email must never break a booking), so the client still gets its
  // id + token immediately.
  after(() => notifyAdminsOfNewBooking(admin, booking.id))
  after(() => sendBookingConfirmation(admin, booking.id))

  return Response.json(
    { id: booking.id, accessToken: booking.access_token },
    { status: 201 },
  )
})

/**
 * GET /api/bookings — the current user's bookings (RLS-scoped to own rows).
 * Login still required here; this powers the authenticated dashboard.
 */
export const GET = withGuard(async () => {
  const user = await getUser()
  if (!user) throw new HttpError(401, 'Authentication required')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(make, model, image_urls)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return Response.json(data)
})

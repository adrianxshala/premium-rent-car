import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'
import { sendEmail } from '@/lib/email/send'
import {
  bookingConfirmationEmail,
  newBookingAdminEmail,
} from '@/lib/email/templates'

type AdminClient = SupabaseClient<Database>

/** Public base URL for links inside emails (trailing slash trimmed). */
function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
}

/**
 * Send the confirmation email for a booking. Loads the booking (with its car)
 * via the service-role client — RLS does not apply. Runs right after the
 * booking is created (auto-confirmed).
 *
 * Best-effort: any failure is logged, never thrown. Intended to be scheduled
 * with `after()` so it cannot delay or break the booking response.
 */
export async function sendBookingConfirmation(
  admin: AdminClient,
  bookingId: string,
): Promise<void> {
  try {
    const { data: booking, error } = await admin
      .from('bookings')
      .select(
        'id, access_token, customer_name, customer_email, start_date, end_date, total_price, user_id, cars(make, model)',
      )
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !booking) {
      console.error('[email] confirmation: booking not found', bookingId, error)
      return
    }

    // A guest always has customer_email; a logged-in booking may only have the
    // account email — fall back to that.
    let recipient = booking.customer_email
    if (!recipient && booking.user_id) {
      const { data: authUser } = await admin.auth.admin.getUserById(
        booking.user_id,
      )
      recipient = authUser?.user?.email ?? null
    }
    if (!recipient) {
      console.warn('[email] confirmation: no recipient for booking', bookingId)
      return
    }

    const car = Array.isArray(booking.cars)
      ? (booking.cars[0] ?? null)
      : (booking.cars ?? null)
    const carTitle = car ? `${car.make} ${car.model}` : 'Makina e rezervuar'

    const manageUrl = `${siteUrl()}/booking/${booking.id}/confirmed?token=${booking.access_token}`

    const { subject, html } = bookingConfirmationEmail({
      customerName: booking.customer_name,
      carTitle,
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalPrice: booking.total_price,
      manageUrl,
    })

    await sendEmail({ to: recipient, subject, html })
  } catch (error) {
    console.error('[email] confirmation failed for', bookingId, error)
  }
}

/**
 * Resolve the email addresses of every admin. Roles live on `profiles`
 * (ADR-4), but the email itself lives on `auth.users`, so we read the admin
 * ids from profiles and look each address up through the auth admin API.
 */
async function getAdminEmails(admin: AdminClient): Promise<string[]> {
  const { data: admins, error } = await admin
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (error || !admins?.length) {
    if (error) console.error('[email] new-booking: admin lookup failed', error)
    return []
  }

  const emails = await Promise.all(
    admins.map(async ({ id }) => {
      const { data } = await admin.auth.admin.getUserById(id)
      return data?.user?.email ?? null
    }),
  )
  return emails.filter((e): e is string => Boolean(e))
}

/**
 * Notify every admin that a new booking was just created.
 * Best-effort and meant to run under `after()` — mirrors the confirmation
 * email: any failure is logged, never thrown, so booking creation is never
 * blocked or broken by email delivery.
 */
export async function notifyAdminsOfNewBooking(
  admin: AdminClient,
  bookingId: string,
): Promise<void> {
  try {
    const { data: booking, error } = await admin
      .from('bookings')
      .select(
        'id, customer_name, customer_email, customer_phone, start_date, end_date, total_price, cars(make, model)',
      )
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !booking) {
      console.error('[email] new-booking: booking not found', bookingId, error)
      return
    }

    const recipients = await getAdminEmails(admin)
    if (!recipients.length) {
      console.warn('[email] new-booking: no admin recipients for', bookingId)
      return
    }

    const car = Array.isArray(booking.cars)
      ? (booking.cars[0] ?? null)
      : (booking.cars ?? null)
    const carTitle = car ? `${car.make} ${car.model}` : 'Makina e rezervuar'

    const { subject, html } = newBookingAdminEmail({
      carTitle,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalPrice: booking.total_price,
      adminUrl: `${siteUrl()}/admin/bookings`,
    })

    await Promise.all(
      recipients.map((to) => sendEmail({ to, subject, html })),
    )
  } catch (error) {
    console.error('[email] new-booking notify failed for', bookingId, error)
  }
}

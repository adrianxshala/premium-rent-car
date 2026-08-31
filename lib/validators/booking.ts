import { z } from 'zod'

/**
 * Booking input from the client. The car + date window are the only trusted
 * commercials — pricing and status are derived server-side, never sent here.
 * Contact details ride along so a guest can book without an account; a
 * logged-in user sends them too (prefilled) and the booking is linked to their
 * profile.
 */
export const createBookingSchema = z
  .object({
    carId: z.guid({ error: 'Makinë e pavlefshme.' }),
    startDate: z.iso.date({ error: 'Data e fillimit e pavlefshme.' }),
    endDate: z.iso.date({ error: 'Data e mbarimit e pavlefshme.' }),
    customerName: z
      .string()
      .trim()
      .min(2, { error: 'Shkruaj emrin e plotë.' })
      .max(120, { error: 'Emri është shumë i gjatë.' }),
    customerEmail: z.email({ error: 'Email i pavlefshëm.' }).max(160),
    customerPhone: z
      .string()
      .trim()
      .min(6, { error: 'Numri i telefonit i pavlefshëm.' })
      .max(32, { error: 'Numri i telefonit i pavlefshëm.' }),
  })
  .refine((v) => v.endDate > v.startDate, {
    error: 'Data e mbarimit duhet të jetë pas datës së fillimit.',
    path: ['endDate'],
  })
  .refine((v) => v.startDate >= new Date().toISOString().slice(0, 10), {
    error: 'Nuk mund të rezervosh në të kaluarën.',
    path: ['startDate'],
  })

export type CreateBookingInput = z.infer<typeof createBookingSchema>

/**
 * Admin-created offline booking (a walk-in who picks the car up at the shop).
 * Like the public flow the booking is created already `confirmed`; a phone is
 * enough to reach the customer (email optional). Dates may start today or
 * later; an admin logs upcoming/active rentals, not ones already in the past.
 */
export const manualBookingSchema = z
  .object({
    carId: z.guid({ error: 'Zgjidh një makinë.' }),
    startDate: z.iso.date({ error: 'Data e marrjes e pavlefshme.' }),
    endDate: z.iso.date({ error: 'Data e kthimit e pavlefshme.' }),
    customerName: z
      .string()
      .trim()
      .min(2, { error: 'Shkruaj emrin e klientit.' })
      .max(120, { error: 'Emri është shumë i gjatë.' }),
    customerPhone: z
      .string()
      .trim()
      .min(6, { error: 'Numri i telefonit i pavlefshëm.' })
      .max(32, { error: 'Numri i telefonit i pavlefshëm.' }),
    customerEmail: z
      .email({ error: 'Email i pavlefshëm.' })
      .max(160)
      .optional(),
  })
  .refine((v) => v.endDate > v.startDate, {
    error: 'Data e kthimit duhet të jetë pas datës së marrjes.',
    path: ['endDate'],
  })
  .refine((v) => v.startDate >= new Date().toISOString().slice(0, 10), {
    error: 'Data e marrjes nuk mund të jetë në të kaluarën.',
    path: ['startDate'],
  })

export type ManualBookingInput = z.infer<typeof manualBookingSchema>

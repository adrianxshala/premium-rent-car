import { z } from 'zod'

/**
 * A dated maintenance / unavailable hold logged from the fleet calendar.
 * Unlike bookings, a block MAY start in the past (an admin can record an
 * ongoing repair after the fact) — the only hard rule is end > start.
 */
export const carBlockSchema = z
  .object({
    carId: z.guid({ error: 'Zgjidh një makinë.' }),
    kind: z.enum(['maintenance', 'unavailable'], {
      error: 'Zgjidh llojin e bllokimit.',
    }),
    startDate: z.iso.date({ error: 'Data e fillimit e pavlefshme.' }),
    endDate: z.iso.date({ error: 'Data e mbarimit e pavlefshme.' }),
    reason: z.string().trim().max(120).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.endDate > v.startDate, {
    error: 'Data e mbarimit duhet të jetë pas datës së fillimit.',
    path: ['endDate'],
  })

export type CarBlockInput = z.infer<typeof carBlockSchema>

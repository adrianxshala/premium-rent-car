import { z } from 'zod'

/**
 * Admin car create/update input. Pricing the *customer* pays is still derived
 * server-side at booking time (see lib/bookings/pricing.ts); these are the
 * catalog fields the admin controls directly.
 */
export const carSchema = z.object({
  make: z.string().trim().min(1, 'Marka është e detyrueshme.').max(60),
  model: z.string().trim().min(1, 'Modeli është i detyrueshëm.').max(60),
  year: z.coerce
    .number({ error: 'Viti i pavlefshëm.' })
    .int()
    .min(1980, 'Viti shumë i vjetër.')
    .max(2100, 'Viti i pavlefshëm.'),
  category: z.enum(['suv', 'sedan', 'economy'], {
    error: 'Kategori e pavlefshme.',
  }),
  status: z.enum(['available', 'maintenance', 'retired'], {
    error: 'Status i pavlefshëm.',
  }),
  transmission: z.enum(['automatic', 'manual'], {
    error: 'Transmision i pavlefshëm.',
  }),
  fuel_type: z.enum(['petrol', 'diesel', 'hybrid', 'electric'], {
    error: 'Karburant i pavlefshëm.',
  }),
  price_per_day: z.coerce
    .number({ error: 'Çmimi i pavlefshëm.' })
    .positive('Çmimi duhet të jetë pozitiv.')
    .max(100000),
  description: z
    .string()
    .trim()
    .max(2000, 'Përshkrimi shumë i gjatë.')
    .optional(),
  image_urls: z
    .array(z.string().url())
    .max(12, 'Maksimumi 12 foto.')
    .default([]),
})

export type CarInput = z.infer<typeof carSchema>

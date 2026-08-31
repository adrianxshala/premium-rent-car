'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { carBlockSchema } from '@/lib/validators/car-block'

export type CarBlockFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  ok?: boolean
} | null

/**
 * Log a dated maintenance / unavailable hold on a car. Runs as the admin
 * session — the `car_blocks` RLS policies gate the write on `is_admin()`.
 * A block does not need the no-overlap machinery bookings use: overlapping a
 * booking is a *conflict the calendar surfaces*, not something we reject here,
 * so the admin can see and resolve it.
 */
export async function createCarBlock(
  _prev: CarBlockFormState,
  formData: FormData,
): Promise<CarBlockFormState> {
  await requireAdmin()

  const parsed = carBlockSchema.safeParse({
    carId: formData.get('carId'),
    kind: formData.get('kind'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    reason: formData.get('reason') || undefined,
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const { carId, kind, startDate, endDate, reason, note } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('car_blocks').insert({
    car_id: carId,
    kind,
    start_date: startDate,
    end_date: endDate,
    reason: reason || null,
    note: note || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/calendar')
  return { ok: true }
}

const deleteSchema = z.object({ blockId: z.guid() })

/** Remove a maintenance / unavailable hold. */
export async function deleteCarBlock(formData: FormData): Promise<void> {
  await requireAdmin()

  const parsed = deleteSchema.safeParse({ blockId: formData.get('blockId') })
  if (!parsed.success) return

  const supabase = await createClient()
  await supabase.from('car_blocks').delete().eq('id', parsed.data.blockId)

  revalidatePath('/admin/calendar')
}

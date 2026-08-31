import { requireAdmin, withGuard } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'Car'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Uploads a single car photo to the public `car-images` bucket and returns its
 * public URL. Admin-only. Writes use the service-role client (bypasses RLS).
 */
export const POST = withGuard(async (request: Request) => {
  await requireAdmin()

  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'Asnjë skedar.' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json(
      { error: 'Format i palejuar (vetëm JPG, PNG, WebP, AVIF).' },
      { status: 400 },
    )
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Foto më e madhe se 5 MB.' }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const base = file.name
    .replace(/\.[^.]+$/, '') // drop extension
    .replace(/[^a-zA-Z0-9-]+/g, '-') // safe slug
    .slice(0, 40)
  // Content-derived stamp keeps names unique without Math.random/Date here.
  const key = `${base || 'foto'}-${file.size}-${file.lastModified}.${ext}`

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: true })

  if (error) {
    return Response.json(
      {
        error:
          'Ngarkimi dështoi. Sigurohu që bucket-i “Car” ekziston dhe është publik.',
      },
      { status: 500 },
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(key)

  return Response.json({ url: publicUrl })
})

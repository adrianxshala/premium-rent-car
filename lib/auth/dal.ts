import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/**
 * Data Access Layer for auth. Centralizes "who is the current user" so every
 * caller gets the same revalidated answer. `cache()` dedupes within a single
 * server render pass.
 */

/** Current authenticated user, or null. Validates the token with Supabase. */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/** Current user's profile (id, full_name, role), or null if not signed in. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
})

/** Require an authenticated user; redirect to /login otherwise. For pages. */
export async function requireUser(redirectTo = '/login'): Promise<User> {
  const user = await getUser()
  if (!user) redirect(redirectTo)
  return user
}

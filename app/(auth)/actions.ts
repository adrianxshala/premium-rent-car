'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validators/auth'

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  message?: string
} | null

/**
 * Where to send a user after auth: an explicit in-app `redirect` target if one
 * was provided (and is safe — no open redirects), otherwise role-based —
 * admins land on the admin panel, everyone else on their dashboard.
 */
async function postAuthDestination(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requested: FormDataEntryValue | null,
): Promise<string> {
  if (
    typeof requested === 'string' &&
    requested.startsWith('/') &&
    !requested.startsWith('//')
  ) {
    return requested
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') return '/admin'
  }
  return '/dashboard'
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Email confirmation on → no session yet. Email confirmation off → signed in.
  if (!data.session) {
    return {
      message:
        'Të dërguam një email konfirmimi. Hap linkun për të aktivizuar llogarinë.',
    }
  }

  redirect('/dashboard')
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Email ose fjalëkalim i pasaktë.' }
  }

  redirect(await postAuthDestination(supabase, formData.get('redirect')))
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

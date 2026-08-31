import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import type { Database } from '@/types/database'

/** Route prefixes that require an authenticated user. */
const PROTECTED_PREFIXES = ['/admin', '/dashboard']
/** Auth pages a logged-in user should be bounced away from. */
const AUTH_PREFIXES = ['/login', '/register']

/**
 * Refreshes the Supabase session on every request and performs an *optimistic*
 * authorization gate. The authoritative checks still live close to the data
 * (`requireAdmin()` in Route Handlers / Server Actions) — see ADR-4.
 *
 * Next.js 16: this runs from `proxy.ts` (formerly `middleware.ts`).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: getUser() revalidates the token with Supabase Auth. Do not run
  // any logic between createServerClient and getUser, or sessions may desync.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => path.startsWith(p))

  // Unauthenticated user hitting a protected route → login (keep destination).
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return redirectKeepingCookies(url, response)
  }

  // Authenticated user on an auth page → their home (admins → /admin).
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard'
    return redirectKeepingCookies(url, response)
  }

  // Optimistic admin gate. Role lives in `profiles` (ADR-4), so this needs a
  // lookup — scoped to /admin/* only to keep it off the hot path.
  if (path.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return redirectKeepingCookies(url, response)
    }
  }

  return response
}

/** Carry any refreshed auth cookies onto a redirect response. */
function redirectKeepingCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

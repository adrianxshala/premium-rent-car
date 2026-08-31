import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

// Next.js 16 renamed Middleware → Proxy. Same capability, runs before requests.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

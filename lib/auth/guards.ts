import 'server-only'

import { getProfile } from '@/lib/auth/dal'
import type { Profile } from '@/types/database'

/** Carries an HTTP status so Route Handlers can return the right code. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/**
 * Secure authorization check for Route Handlers and Server Actions.
 * Throws HttpError(401) if unauthenticated, HttpError(403) if not an admin.
 * Returns the admin profile on success.
 *
 * This is the authoritative gate — `proxy.ts` only does an optimistic redirect.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) {
    throw new HttpError(401, 'Authentication required')
  }
  if (profile.role !== 'admin') {
    throw new HttpError(403, 'Admin access required')
  }
  return profile
}

/**
 * Wraps a Route Handler so thrown HttpErrors become proper HTTP responses.
 *
 * @example
 *   export const POST = withGuard(async (req) => {
 *     await requireAdmin()
 *     // ...
 *     return Response.json({ ok: true })
 *   })
 */
export function withGuard(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json({ error: error.message }, { status: error.status })
      }
      throw error
    }
  }
}

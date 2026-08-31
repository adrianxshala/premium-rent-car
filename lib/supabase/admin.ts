import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

/**
 * Privileged Supabase client that bypasses Row Level Security.
 *
 * Uses the service role key — MUST only ever run on the server (never imported
 * into a Client Component). Reserve for trusted server-side work such as the
 * controlled booking write path, admin actions, and cron jobs, never exposed
 * to user-facing client requests.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

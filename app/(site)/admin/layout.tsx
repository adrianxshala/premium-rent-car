import { redirect } from 'next/navigation'

import { getProfile } from '@/lib/auth/dal'
import { PageReveal } from '@/components/motion/primitives'
import { AdminNav } from '@/components/admin/admin-nav'

/**
 * Authoritative admin guard + the admin nav. The outer shell (header, footer,
 * canvas, grain) comes from the parent (site) layout. `proxy.ts` redirects
 * non-admins optimistically; this is the secure server-side check.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[16%] -left-[12%] size-[28rem] bg-indigo-200/30" />
        <div className="blob top-[60%] -right-[10%] size-[24rem] bg-emerald-200/25" />
      </div>

      <PageReveal className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-12">
        <AdminNav />
        {children}
      </PageReveal>
    </>
  )
}

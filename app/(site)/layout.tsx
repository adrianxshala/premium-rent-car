import { getProfile, getUser } from '@/lib/auth/dal'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp'

/**
 * Shared shell for the public/customer + admin sections: the floating glass
 * header, the soft app canvas, the footer and the page-wide film grain. Pages
 * (and nested layouts like /admin) render only their own content inside <main>.
 *
 * Auth pages live under (auth) with their own minimal layout — that's why this
 * shell is a route-group layout, not the root layout.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, profile] = await Promise.all([getUser(), getProfile()])
  const sessionUser = profile
    ? {
        name: profile.full_name?.trim() || user?.email || 'Përdorues',
        role: profile.role,
      }
    : null

  return (
    <div className="app-canvas relative flex flex-1 flex-col">
      <SiteHeader signedIn={Boolean(profile)} user={sessionUser} />

      <main className="relative flex flex-1 flex-col">{children}</main>

      <SiteFooter />

      {/* Mobile-only floating WhatsApp button — appears on scroll. */}
      <FloatingWhatsApp />
    </div>
  )
}

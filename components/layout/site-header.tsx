'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileMenu, type SessionUser } from '@/components/home/mobile-menu'

/* ── Floating header — transparent at the top, frosted glass once scrolled ─ */

export function SiteHeader({
  signedIn,
  user,
}: {
  signedIn: boolean
  user?: SessionUser | null
}) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll() // sync on mount (e.g. restored scroll position)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2.5 ring-1 backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 sm:px-5',
          scrolled
            ? // Scrolled: strong liquid glass like the hero calendar — translucent
              // enough to read the blurred content behind it.
              'bg-white/65 shadow-[0_10px_34px_rgba(20,20,30,0.14)] ring-black/[0.05] backdrop-blur-[26px]'
            : // Top: a hint of frost + a visible hairline border so it always
              // reads as a defined surface, even before scrolling.
              'bg-white/35 ring-black/[0.08] backdrop-blur-md',
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 pl-1 font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="bg-foreground text-background flex size-9 items-center justify-center rounded-full text-lg font-semibold sm:size-10"
          >
            P
          </span>
          <span className="text-base">
            RentCar <span className="text-muted-foreground">Promo</span>
          </span>
        </Link>

        {/* Center anchor nav — scrolls to homepage sections from any page. */}
        <nav className="text-muted-foreground absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium lg:flex">
          <NavLink href="/cars">Makinat</NavLink>
          <NavLink href="/#si-funksionon">Si funksionon</NavLink>
          <NavLink href="/#lokacioni">Lokacioni</NavLink>
          <NavLink href="/#kontakt">Kontakt</NavLink>
        </nav>

        <nav className="hidden items-center gap-1.5 sm:flex">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={signedIn ? '/dashboard' : '/login'}>
              {signedIn ? 'Llogaria ime' : 'Hyr'}
            </Link>
          </Button>
          <Button asChild variant="brand" className="rounded-full">
            <Link href="/cars">Rezervo tani</Link>
          </Button>
        </nav>

        <MobileMenu signedIn={signedIn} user={user} />
      </div>
    </header>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="hover:text-foreground rounded-full px-3 py-2 transition-colors hover:bg-black/[0.04]"
    >
      {children}
    </Link>
  )
}

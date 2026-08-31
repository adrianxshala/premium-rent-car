'use client'

import * as React from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { Car, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'

import { logout } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { EASE_OUT, springTap } from '@/components/motion/primitives'

type MenuLink = {
  href: string
  label: string
  icon: React.ReactNode
  primary?: boolean
}

export type SessionUser = { name: string; role: 'user' | 'admin' }

const ROLE_LABELS: Record<SessionUser['role'], string> = {
  admin: 'Administrator',
  user: 'Klient',
}

/* ── MobileMenu ──────────────────────────────────────────────────────────── *
 * The same premium language as the booking calendar: a centered liquid-glass
 * card that fades + lifts + scales in over a blurred scrim. Mobile-only.
 * ────────────────────────────────────────────────────────────────────────── */

export function MobileMenu({
  signedIn,
  user,
}: {
  signedIn: boolean
  user?: SessionUser | null
}) {
  const [open, setOpen] = React.useState(false)

  const links: MenuLink[] = [
    { href: '/cars', label: 'Makinat', icon: <Car className="size-5" /> },
    ...(signedIn
      ? [
          {
            href: '/dashboard',
            label: 'Llogaria ime',
            icon: <LayoutDashboard className="size-5" />,
            primary: true,
          },
        ]
      : []),
  ]

  return (
    <div className="sm:hidden">
      <CircleButton ariaLabel="Hap menynë" onClick={() => setOpen(true)}>
        <Menu className="size-5" aria-hidden />
      </CircleButton>

      <MenuSheet
        open={open}
        onClose={() => setOpen(false)}
        links={links}
        signedIn={signedIn}
        user={user}
      />
    </div>
  )
}

/* ── MenuSheet — the centered glass card ─────────────────────────────────── */

function MenuSheet({
  open,
  onClose,
  links,
  signedIn,
  user,
}: {
  open: boolean
  onClose: () => void
  links: MenuLink[]
  signedIn: boolean
  user?: SessionUser | null
}) {
  const reduce = useReducedMotion()
  // SSR-safe client guard for createPortal.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  const panelVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { x: '100%' },
        show: {
          x: 0,
          transition: {
            duration: 0.35,
            ease: EASE_OUT,
            staggerChildren: 0.06,
            delayChildren: 0.12,
          },
        },
        exit: {
          x: '100%',
          transition: { duration: 0.25, ease: EASE_OUT },
        },
      }

  const itemVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
      }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel — liquid-glass drawer sliding in from the right */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menyja"
            className={cn(
              'relative ml-auto flex h-full w-[82%] max-w-[20rem] flex-col overflow-y-auto p-4 pr-[max(1rem,env(safe-area-inset-right))]',
              'border-l border-white/60 bg-white/85 shadow-[-24px_0_70px_rgba(20,20,30,0.22)] backdrop-blur-[26px] backdrop-saturate-150',
              'rounded-l-[28px]',
            )}
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
                Menyja
              </p>
              <CircleButton ariaLabel="Mbyll menynë" onClick={onClose}>
                <X className="size-4" aria-hidden />
              </CircleButton>
            </div>

            <nav className="flex flex-col gap-1.5">
              {links.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <MenuRow link={link} onNavigate={onClose} />
                </motion.div>
              ))}
            </nav>

            <motion.div variants={itemVariants} className="mt-auto pt-4">
              <div className="divider-soft mb-4" />
              {signedIn ? (
                <div className="bg-secondary/70 flex items-center gap-3 rounded-[20px] p-2 pl-3">
                  <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {(user?.name?.trim()?.[0] ?? 'P').toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {user?.name?.trim() || 'Përdorues'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {ROLE_LABELS[user?.role ?? 'user']}
                    </p>
                  </div>
                  <form action={logout}>
                    <motion.button
                      type="submit"
                      aria-label="Dil"
                      whileTap={reduce ? undefined : { scale: 0.92 }}
                      transition={springTap}
                      className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(20,20,30,0.18)] transition-colors"
                    >
                      <LogOut className="size-5" aria-hidden />
                    </motion.button>
                  </form>
                </div>
              ) : (
                <motion.div
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  transition={springTap}
                >
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="bg-primary text-primary-foreground flex w-full items-center gap-4 rounded-[20px] px-4 py-4 text-base font-medium shadow-[0_8px_20px_rgba(20,20,30,0.18)] transition-colors"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <LogIn className="size-5" aria-hidden />
                    </span>
                    Login
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ── MenuRow — large touch-friendly link ─────────────────────────────────── */

function MenuRow({
  link,
  onNavigate,
}: {
  link: MenuLink
  onNavigate: () => void
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div whileTap={reduce ? undefined : { scale: 0.98 }} transition={springTap}>
      <Link
        href={link.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-4 rounded-[20px] px-4 py-4 text-base font-medium transition-colors',
          link.primary
            ? 'bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(20,20,30,0.18)]'
            : 'text-foreground hover:bg-foreground/[0.05]',
        )}
      >
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            link.primary ? 'bg-white/15' : 'bg-secondary text-muted-foreground',
          )}
        >
          {link.icon}
        </span>
        {link.label}
      </Link>
    </motion.div>
  )
}

/* ── CircleButton — circular glass control (matches the calendar's) ──────── */

function CircleButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  ariaLabel: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={reduce ? undefined : { scale: 1.05 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={springTap}
      className="text-foreground flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/70 shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
    >
      {children}
    </motion.button>
  )
}

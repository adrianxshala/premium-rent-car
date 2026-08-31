'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarClock, CarFront, LayoutGrid } from 'lucide-react'

import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/admin', label: 'Përmbledhje', icon: LayoutGrid, exact: true },
  { href: '/admin/cars', label: 'Makinat', icon: CarFront },
  { href: '/admin/bookings', label: 'Rezervimet', icon: CalendarClock },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="glass shadow-soft mb-6 flex gap-1 overflow-x-auto rounded-full p-1.5 ring-1 ring-black/[0.04]">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04]',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

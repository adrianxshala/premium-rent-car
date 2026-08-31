'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { BOOKING_STATUS_LABELS } from '@/lib/format'
import { Constants, type Enums } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUSES = Constants.public.Enums.booking_status

export function BookingsFilter({
  status,
  q,
}: {
  status?: Enums<'booking_status'>
  q?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [term, setTerm] = React.useState(q ?? '')

  // Build a new query string from the current params with one key overridden.
  const withParam = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [params, pathname],
  )

  // Debounced search → URL (replace so it doesn't spam history).
  React.useEffect(() => {
    const id = setTimeout(() => {
      const current = params.get('q') ?? ''
      if (term !== current) {
        router.replace(withParam('q', term || null), { scroll: false })
      }
    }, 300)
    return () => clearTimeout(id)
  }, [term, params, router, withParam])

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Kërko sipas klientit ose makinës…"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-full border bg-white pr-10 pl-10 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2"
            aria-label="Pastro kërkimin"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Pill href={withParam('status', null)} active={!status}>
          Të gjitha
        </Pill>
        {STATUSES.map((s) => (
          <Pill key={s} href={withParam('status', s)} active={status === s}>
            {BOOKING_STATUS_LABELS[s]}
          </Pill>
        ))}
      </div>
    </div>
  )
}

function Pill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.replace(href, { scroll: false })}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground bg-white ring-1 ring-black/[0.06] hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

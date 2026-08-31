'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/format'
import type { Enums } from '@/types/database'
import type { CalendarStatus, VehicleLite } from '@/lib/calendar/types'
import {
  STATUS_META,
  STATUS_ORDER,
} from '@/components/admin/calendar/tokens'

export function CalendarFilters({
  open,
  onClose,
  vehicles,
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: {
  open: boolean
  onClose: () => void
  vehicles: VehicleLite[]
  statusFilter: Set<CalendarStatus>
  categoryFilter: Set<Enums<'car_category'>>
  onStatusChange: (next: Set<CalendarStatus>) => void
  onCategoryChange: (next: Set<Enums<'car_category'>>) => void
}) {
  // Only offer categories that actually exist in the fleet.
  const categories = React.useMemo(() => {
    const present = new Set(vehicles.map((v) => v.category))
    return [...present]
  }, [vehicles])

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const clearAll = () => {
    onStatusChange(new Set())
    onCategoryChange(new Set())
  }

  const activeCount = statusFilter.size + categoryFilter.size

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed z-50 bg-white shadow-float ring-1 ring-black/[0.06]',
            // Mobile: bottom sheet. sm+: centered card.
            'inset-x-0 bottom-0 rounded-t-[28px] data-[state=open]:slide-in-from-bottom',
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <Dialog.Title className="text-base font-semibold tracking-tight">
              Filtra
            </Dialog.Title>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground hover:bg-secondary flex size-8 items-center justify-center rounded-full transition-colors"
              aria-label="Mbyll"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
            <Group title="Statusi">
              {STATUS_ORDER.map((s) => {
                const meta = STATUS_META[s]
                const checked = statusFilter.has(s)
                return (
                  <FilterRow
                    key={s}
                    checked={checked}
                    onToggle={() => onStatusChange(toggle(statusFilter, s))}
                  >
                    <span className={cn('size-2.5 rounded-full', meta.dot)} />
                    {meta.label}
                  </FilterRow>
                )
              })}
            </Group>

            {categories.length > 0 && (
              <Group title="Kategoria">
                {categories.map((c) => {
                  const checked = categoryFilter.has(c)
                  return (
                    <FilterRow
                      key={c}
                      checked={checked}
                      onToggle={() =>
                        onCategoryChange(toggle(categoryFilter, c))
                      }
                    >
                      {CATEGORY_LABELS[c]}
                    </FilterRow>
                  )
                })}
              </Group>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-4">
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCount === 0}
              className="text-muted-foreground hover:text-foreground text-sm font-medium disabled:opacity-40"
            >
              Pastro ({activeCount})
            </button>
            <Dialog.Close className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-full px-5 text-sm font-medium transition-opacity hover:opacity-90">
              Mbyll
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function FilterRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="hover:bg-secondary/60 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-md ring-1 transition-colors',
          checked
            ? 'bg-primary text-primary-foreground ring-primary'
            : 'ring-black/15',
        )}
      >
        {checked && <Check className="size-3.5" aria-hidden />}
      </span>
    </button>
  )
}

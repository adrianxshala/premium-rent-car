'use client'

import { AlertTriangle, CornerDownLeft, KeyRound, Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { TodayOps } from '@/lib/calendar/types'
import type { HighlightMode } from '@/components/admin/calendar/fleet-calendar'

type Metric = {
  key: HighlightMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: number
  iconClass: string
  activeRing: string
}

export function TodayOperations({
  ops,
  active,
  onToggle,
}: {
  ops: TodayOps
  active: HighlightMode | null
  onToggle: (mode: HighlightMode) => void
}) {
  const metrics: Metric[] = [
    {
      key: 'pickups',
      label: 'Marrje sot',
      icon: KeyRound,
      value: ops.pickups,
      iconClass: 'bg-emerald-50 text-emerald-600',
      activeRing: 'ring-emerald-500/30',
    },
    {
      key: 'returns',
      label: 'Kthime sot',
      icon: CornerDownLeft,
      value: ops.returns,
      iconClass: 'bg-blue-50 text-blue-600',
      activeRing: 'ring-blue-500/30',
    },
    {
      key: 'maintenance',
      label: 'Në mirëmbajtje',
      icon: Wrench,
      value: ops.maintenance,
      iconClass: 'bg-orange-50 text-orange-600',
      activeRing: 'ring-orange-500/30',
    },
    {
      key: 'attention',
      label: 'Vëmendje',
      icon: AlertTriangle,
      value: ops.attention,
      iconClass:
        ops.attention > 0
          ? 'bg-red-50 text-red-600'
          : 'bg-secondary text-muted-foreground',
      activeRing: 'ring-red-500/30',
    },
  ]

  return (
    <section aria-label="Operacionet e sotme">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metrics.map((m) => {
          const isActive = active === m.key
          const Icon = m.icon
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onToggle(m.key)}
              aria-pressed={isActive}
              className={cn(
                'group flex items-center gap-3 rounded-[20px] bg-white p-4 text-left ring-1 transition-all duration-200 sm:gap-3.5 sm:rounded-[22px] sm:p-5',
                isActive
                  ? cn('shadow-float ring-2', m.activeRing)
                  : 'shadow-soft ring-black/[0.05] hover:-translate-y-0.5 hover:shadow-float',
              )}
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  m.iconClass,
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-[28px]">
                  {m.value}
                </span>
                <span className="text-muted-foreground mt-1.5 block truncate text-xs font-medium">
                  {m.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

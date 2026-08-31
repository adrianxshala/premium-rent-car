'use client'

/** Compact, quiet legend — just small semantic dots. */
const ITEMS: { label: string; className: string }[] = [
  { label: 'E lirë', className: 'bg-white ring-1 ring-inset ring-emerald-500' },
  { label: 'Rezervuar', className: 'bg-blue-500' },
  { label: 'Në qira', className: 'bg-emerald-500' },
  { label: 'Në pritje', className: 'bg-amber-500' },
  { label: 'Mirëmbajtje', className: 'bg-orange-500' },
  { label: 'E padisponueshme', className: 'bg-red-500' },
]

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {ITEMS.map((d) => (
        <span
          key={d.label}
          className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <span className={`size-2 rounded-full ${d.className}`} />
          {d.label}
        </span>
      ))}
    </div>
  )
}

/** Route-level skeleton for the fleet calendar (matches its real layout). */
export default function CalendarLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-black/[0.06]" />
          <div className="h-7 w-56 rounded bg-black/[0.08]" />
          <div className="h-3 w-72 rounded bg-black/[0.05]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-full bg-black/[0.06]" />
          <div className="h-9 w-28 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      {/* Ops bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[20px] bg-black/[0.05]" />
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 overflow-hidden rounded-[24px] ring-1 ring-black/[0.05]">
        <div className="h-12 bg-black/[0.04]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-t border-black/[0.05] p-4"
          >
            <div className="size-12 shrink-0 rounded-xl bg-black/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-black/[0.07]" />
              <div className="h-2.5 w-20 rounded bg-black/[0.05]" />
            </div>
            <div className="h-7 flex-1 rounded-lg bg-black/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  )
}

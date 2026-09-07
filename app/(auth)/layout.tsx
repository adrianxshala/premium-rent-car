import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-canvas relative flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      {/* Ambient blurred blobs for depth, matching the home page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[8%] -left-[12%] size-[26rem] bg-indigo-200/35" />
        <div className="blob -right-[10%] bottom-[4%] size-[24rem] bg-emerald-200/30" />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2.5 font-semibold tracking-tight"
      >
        <span
          aria-hidden
          className="bg-foreground text-background flex size-10 items-center justify-center rounded-full text-lg font-semibold"
        >
          P
        </span>
        <span className="text-lg">
          RentCar <span className="text-muted-foreground">Promo</span>
        </span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        ← Kthehu në ballinë
      </Link>
    </div>
  )
}

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** Shared eyebrow + title + optional action link used across home sections. */
export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string
  title: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline sm:inline-flex"
        >
          {action.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  )
}

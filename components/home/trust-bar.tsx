import { ShieldCheck, Sparkles, Star, Tag, Headphones } from 'lucide-react'

import { Reveal } from '@/components/motion/primitives'

/* ── Trust bar ─────────────────────────────────────────────────────────────
 * A compact strip directly under the hero: the handful of proof points that
 * turn a browsing visitor into a booking one. Neutral by default; the rating
 * carries the single brand accent so the eye lands on it first.
 * ────────────────────────────────────────────────────────────────────────── */

const ITEMS = [
  {
    icon: <Star className="size-[1.05rem] fill-current" aria-hidden />,
    label: '4.9/5',
    sub: 'nga klientët',
    accent: true,
  },
  {
    icon: <Headphones className="size-[1.05rem]" aria-hidden />,
    label: '24/7',
    sub: 'mbështetje',
  },
  {
    icon: <Tag className="size-[1.05rem]" aria-hidden />,
    label: 'Çmime transparente',
    sub: 'pa tarifa të fshehura',
  },
  {
    icon: <ShieldCheck className="size-[1.05rem]" aria-hidden />,
    label: 'Vetura të kontrolluara',
    sub: 'të servisuara e të siguruara',
  },
  {
    icon: <Sparkles className="size-[1.05rem]" aria-hidden />,
    label: 'Rezervim në minuta',
    sub: 'konfirmim i shpejtë',
  },
] as const

export function TrustBar() {
  return (
    <section className="mx-auto hidden w-full max-w-6xl px-6 sm:block">
      <Reveal y={16}>
        <div className="shadow-soft flex items-center justify-between gap-2 rounded-[24px] bg-white px-8 py-5 ring-1 ring-black/[0.05]">
          {ITEMS.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              <TrustItem {...item} />
              {i < ITEMS.length - 1 && (
                <span
                  aria-hidden
                  className="ml-auto hidden h-9 w-px bg-black/[0.07] sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export function TrustItem({
  icon,
  label,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={
          accent
            ? 'text-brand flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft'
            : 'bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-full'
        }
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-foreground text-sm font-semibold tracking-tight">
          {label}
        </span>
        <span className="text-muted-foreground text-xs">{sub}</span>
      </span>
    </div>
  )
}

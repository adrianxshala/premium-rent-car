import Link from 'next/link'
import { ArrowRight, CalendarRange, MapPin, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal, Tappable } from '@/components/motion/primitives'

/* ── Promo section ─────────────────────────────────────────────────────────
 * A single, commercially alive offer. Light and brand-tinted so it reads as a
 * highlight without competing with the dark final CTA further down the page.
 * ────────────────────────────────────────────────────────────────────────── */

const PERKS = [
  {
    icon: <CalendarRange className="size-4" aria-hidden />,
    label: 'Anulim falas deri 48h para marrjes',
  },
  {
    icon: <MapPin className="size-4" aria-hidden />,
    label: 'Marrje & dorëzim në Suharekë pa pagesë',
  },
  {
    icon: <ShieldCheck className="size-4" aria-hidden />,
    label: 'Sigurim bazë i përfshirë në çmim',
  },
] as const

export function PromoSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-brand-soft via-white to-white p-8 ring-1 ring-black/[0.05] sm:p-12 lg:p-14">
          {/* Soft brand glow anchored to a corner for depth. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-brand/10 blur-3xl"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="text-brand inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-semibold ring-1 ring-brand/15">
                Ofertë e sezonit
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Rezervo 7+ ditë dhe kurse{' '}
                <span className="text-brand">15%</span>.
              </h2>
              <p className="text-muted-foreground mt-4 max-w-md text-pretty">
                Sa më gjatë e merr veturën, aq më i mirë çmimi. Zbritja aplikohet
                automatikisht për qira nga shtatë ditë e lart.
              </p>

              <ul className="mt-7 flex flex-col gap-3">
                {PERKS.map((perk) => (
                  <li
                    key={perk.label}
                    className="text-foreground flex items-center gap-3 text-sm"
                  >
                    <span className="text-brand flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                      {perk.icon}
                    </span>
                    {perk.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="shadow-soft w-full rounded-[28px] bg-white p-6 ring-1 ring-black/[0.05] lg:max-w-xs">
                <p className="text-muted-foreground text-sm">Deri në</p>
                <p className="text-brand text-5xl font-semibold tracking-tight">
                  −15%
                </p>
                <p className="text-muted-foreground mt-1 text-sm text-pretty">
                  për çdo rezervim 7 ditë ose më shumë.
                </p>
                <Tappable className="mt-5 w-full">
                  <Button
                    asChild
                    size="lg"
                    variant="brand"
                    className="h-12 w-full rounded-2xl text-base"
                  >
                    <Link href="/cars">
                      Rezervo tani
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </Tappable>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

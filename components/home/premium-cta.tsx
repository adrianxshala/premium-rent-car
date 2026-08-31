'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, CalendarCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal, Tappable } from '@/components/motion/primitives'

export function PremiumCta({ signedIn }: { signedIn: boolean }) {
  const reduce = useReducedMotion()

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="shadow-float text-primary-foreground relative overflow-hidden rounded-[40px] bg-[#0b0b0d] px-8 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_rgba(10,10,12,0.45)] sm:px-16 sm:py-20">
          {/* Deep radial sheen for luxury depth. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_-15%,rgba(60,60,72,0.55),transparent_60%)]"
          />
          {/* Almost-invisible ambient glows drifting on a very slow loop. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl"
            animate={reduce ? undefined : { x: [0, -28, 0], y: [0, 22, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 24, ease: 'easeInOut', repeat: Infinity }
            }
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-3xl"
            animate={reduce ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 28, ease: 'easeInOut', repeat: Infinity }
            }
          />

          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
            <CalendarCheck className="size-3.5" aria-hidden />
            Disponueshmëri në kohë reale
          </span>
          <h2 className="relative mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Makina jote e radhës është një kërkim larg.
          </h2>
          <p className="text-primary-foreground/70 relative mx-auto mt-4 max-w-lg text-base text-pretty">
            Çmime transparente, konfirmim me kapar dhe asnjë surprizë. Provoje
            eksperiencën premium sot.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Tappable>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-7 transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(255,255,255,0.35)]"
              >
                <Link href="/cars">
                  Shiko makinat
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </Tappable>
            {!signedIn && (
              <Tappable>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-primary-foreground hover:text-primary-foreground rounded-full px-7 hover:bg-white/10"
                >
                  <Link href="/register">Krijo llogari</Link>
                </Button>
              </Tappable>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

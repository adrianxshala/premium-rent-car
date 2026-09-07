import Link from 'next/link'
import { ArrowRight, CalendarCheck, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal, Tappable } from '@/components/motion/primitives'

const WHATSAPP_URL = 'https://wa.me/38349624299'

export function PremiumCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section
      id="kontakt"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <Reveal>
        <div className="shadow-float text-primary-foreground relative overflow-hidden rounded-[40px] bg-[#0b0b0d] px-8 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_rgba(10,10,12,0.45)] sm:px-16 sm:py-20">
          {/* Static radial sheen for luxury depth — no animation. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_-15%,rgba(60,60,72,0.55),transparent_60%)]"
          />
          {/* A single static brand glow, high in the panel, for a hint of color. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
          />

          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
            <CalendarCheck className="size-3.5" aria-hidden />
            Disponueshmëri në kohë reale
          </span>
          <h2 className="relative mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Gati për rrugën?
          </h2>
          <p className="text-primary-foreground/70 relative mx-auto mt-4 max-w-lg text-base text-pretty">
            Shiko makinat e lira për datat e tua dhe rezervo në pak minuta — pa
            parapagesë dhe pa surpriza.
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
                  Kontrollo disponueshmërinë
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </Tappable>
            <Tappable>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground rounded-full px-7 ring-1 ring-white/25 hover:bg-white/10"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  Na shkruaj në WhatsApp
                </a>
              </Button>
            </Tappable>
          </div>
          {!signedIn && (
            <p className="text-primary-foreground/50 relative mt-6 text-sm">
              Apo{' '}
              <Link
                href="/register"
                className="text-primary-foreground/80 font-medium underline-offset-4 hover:underline"
              >
                krijo një llogari
              </Link>{' '}
              për të ndjekur rezervimet e tua.
            </p>
          )}
        </div>
      </Reveal>
    </section>
  )
}

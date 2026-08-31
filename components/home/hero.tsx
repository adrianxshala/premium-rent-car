'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { KeyRound } from 'lucide-react'

import heroCar from '@/public/hero-car.jpg'
import heroCarMobile from '@/public/hero-car-mobile.jpg'
import { BookingWidget } from '@/components/home/booking-widget'
import { EASE_OUT } from '@/components/motion/primitives'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

// The booking card lands like a floating app component: fade + soft rise +
// the faintest scale-up.
const card: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
}

// The car glides in from the right and settles — fade + x-drift + a hair of
// scale-up. Slightly delayed so the headline leads the eye first.
const carImage: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.15 },
  },
}

export function Hero({ signedIn }: { signedIn: boolean }) {
  const reduce = useReducedMotion()

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pt-24 pb-14 sm:pt-28 lg:pt-24 lg:pb-16">
      {/* Ambient hero backdrop — a soft mesh of gradient lights for depth, with
          a faint engineering grid layered in on desktop. Decorative only; it
          sets the premium "app" mood without ever competing for attention. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob -top-[14%] right-[4%] size-[28rem] bg-indigo-200/25" />
        <div className="blob top-[28%] -left-[12%] size-[24rem] bg-violet-200/20" />
        <div className="blob top-[60%] right-[18%] size-[24rem] bg-emerald-200/20" />
        <div className="hero-grid absolute inset-0 hidden lg:block" />
      </div>

      {/* Mobile: a dedicated portrait photo becomes the full-bleed hero backdrop
          (the desktop AMG shot is landscape and crops poorly on a tall screen).
          It extends up past the section top (-top-24) so it sits *behind the
          floating navbar* too — no white gap above it. The composition places
          open sky at the top (headline) and dark asphalt at the bottom (booking
          card), so a layered scrim keeps the headline legible then dissolves into
          the page color below. Desktop renders the framed AMG on the right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 z-0 overflow-hidden lg:hidden"
      >
        <Image
          src={heroCarMobile}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Top-down scrim for headline contrast, fading into the page below. */}
        <div className="to-background absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-85%" />
        {/* Faint side vignette to ground the photo against the edges. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
      </div>

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:gap-14">
        {/* ── Left: copy + booking widget + trust indicators ─────────────── */}
        <motion.div
          className="text-center lg:text-left"
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <motion.h1
            variants={reduce ? undefined : item}
            className="lg:text-foreground text-[2.65rem] leading-[1.04] font-semibold tracking-tight text-balance text-white [text-shadow:0_1px_24px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl lg:leading-[1.05] lg:[text-shadow:none]"
          >
            Vetura premium për çdo udhëtim.
          </motion.h1>
          <motion.p
            variants={reduce ? undefined : item}
            className="lg:text-muted-foreground mx-auto mt-7 max-w-xl text-lg text-pretty text-white/90 [text-shadow:0_1px_18px_rgba(0,0,0,0.3)] lg:mx-0 lg:[text-shadow:none]"
          >
            Gjej veturën e duhur, kontrollo dhe rezervo online në sekonda —
            thjeshtë, shpejt dhe pa komplikime.
          </motion.p>

          <motion.div variants={reduce ? undefined : card} className="mt-9">
            <BookingWidget />
          </motion.div>

          <motion.div
            variants={reduce ? undefined : item}
            className="mt-10 flex justify-center lg:justify-start"
          >
            <div className="text-muted-foreground inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl bg-white/55 px-5 py-3 text-sm ring-1 ring-black/[0.04] backdrop-blur-md">
              <Stat icon={<KeyRound className="size-[1.05rem]" aria-hidden />}>
                <span className="text-foreground font-semibold">24/7</span>{' '}
                marrje fleksibël
              </Stat>
              {!signedIn && (
                <>
                  <Separator />
                  <Link
                    href="/register"
                    className="text-foreground font-medium underline-offset-4 hover:underline"
                  >
                    Krijo llogari →
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: the premium car, floating in a soft frame (desktop only —
            on mobile the same photo serves as the section backdrop above). ── */}
        <motion.div
          className="relative hidden lg:block"
          variants={reduce ? undefined : carImage}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          {/* Ambient light pooled behind the car for depth. */}
          <div
            aria-hidden
            className="absolute inset-x-2 -inset-y-6 -z-10 rounded-[40px] bg-gradient-to-tr from-indigo-300/25 via-white/0 to-emerald-200/25 blur-2xl"
          />

          {/* Perpetual, almost-imperceptible float (≈5px) — kept on a separate
              element from the entrance transform so they never fight. */}
          <motion.div
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 4.5, ease: 'easeInOut', repeat: Infinity }
            }
            className="shadow-float relative aspect-[4/3] overflow-hidden rounded-[28px] ring-1 ring-black/[0.06]"
          >
            <Image
              src={heroCar}
              alt="Veturë premium gati për rezervim"
              fill
              priority
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            {/* Gradient overlay — adds depth and keeps any overlaid text fully
                legible; light from the top, grounded with a soft shade below. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-[28px] ring-1 ring-white/10 ring-inset"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="bg-secondary text-foreground flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/[0.04]">
        {icon}
      </span>
      <span>{children}</span>
    </span>
  )
}

function Separator() {
  return <span aria-hidden className="hidden h-5 w-px bg-black/10 sm:block" />
}

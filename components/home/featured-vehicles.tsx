'use client'

import * as React from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'motion/react'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { CATEGORY_LABELS } from '@/lib/format'
import { EASE_OUT, Reveal, springGentle } from '@/components/motion/primitives'
import { FeaturedCarCard } from '@/components/home/featured-car-card'
import { SectionHead } from '@/components/home/section-head'
import { Button } from '@/components/ui/button'

type FeaturedCar = React.ComponentProps<typeof FeaturedCarCard>['car']

const FILTERS = [
  { key: 'all', label: 'Të gjitha' },
  { key: 'suv', label: CATEGORY_LABELS.suv },
  { key: 'sedan', label: CATEGORY_LABELS.sedan },
  { key: 'economy', label: CATEGORY_LABELS.economy },
] as const

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } },
}

// Transform + opacity only — no `scale`. Scaling six image cards (each with a
// backdrop-filter glass badge inside) at once forces heavy repaints and blocks
// scroll as the section enters. A plain y-slide is GPU-composited and smooth.
const cardItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
}

export function FeaturedVehicles({ cars }: { cars: FeaturedCar[] }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const [active, setActive] = React.useState<string>('all')

  if (cars.length === 0) return null

  // Only offer filters that actually match the cars on display.
  const present = new Set(cars.map((c) => c.category))
  const filters = FILTERS.filter((f) => f.key === 'all' || present.has(f.key))
  const visible =
    active === 'all' ? cars : cars.filter((c) => c.category === active)

  return (
    <section id="makinat" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16">
      <Reveal>
        <SectionHead
          eyebrow="Flota"
          title="Makina të zgjedhura"
          action={{ href: '/cars', label: 'Shiko të gjitha' }}
        />
      </Reveal>

      {filters.length > 2 && (
        <Reveal delay={0.05} className="mt-6">
          <div
            role="tablist"
            aria-label="Filtro sipas kategorisë"
            className="bg-secondary/70 inline-flex flex-wrap gap-1 rounded-full p-1 ring-1 ring-black/[0.04]"
          >
            {filters.map((f) => {
              const isActive = f.key === active
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(f.key)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="featured-filter-pill"
                      className="bg-brand absolute inset-0 rounded-full"
                      transition={reduce ? { duration: 0 } : springGentle}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              )
            })}
          </div>
        </Reveal>
      )}

      <div ref={ref} className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={reduce ? undefined : grid}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : inView ? 'show' : 'hidden'}
            exit={reduce ? undefined : 'exit'}
          >
            {visible.map((car) => (
              <motion.div
                key={car.id}
                className="h-full"
                variants={reduce ? undefined : cardItem}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={springGentle}
              >
                <FeaturedCarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile-only: the header's "Shiko të gjitha" link is hidden < sm, so
          give the section a full-width CTA at the bottom on phones. */}
      <Reveal y={8} className="mt-8 sm:hidden">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-2xl text-base"
        >
          <Link href="/cars">
            Shiko të gjitha makinat
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </Reveal>
    </section>
  )
}

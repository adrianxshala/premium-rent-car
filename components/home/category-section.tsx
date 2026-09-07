import Link from 'next/link'
import { ArrowUpRight, Car, Mountain, Wallet, Zap } from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

/* ── Category section ──────────────────────────────────────────────────────
 * "Find your car" — four honest entry points that deep-link into the listing
 * with a real filter applied (three DB categories + electric by fuel type).
 * The icon carries the category's *benefit*, not just a car silhouette.
 * ────────────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    href: '/cars?category=suv',
    icon: <Mountain className="size-6" aria-hidden />,
    title: 'SUV',
    desc: 'Hapësirë e komoditet për familje e udhëtime të gjata.',
  },
  {
    href: '/cars?category=sedan',
    icon: <Car className="size-6" aria-hidden />,
    title: 'Sedan',
    desc: 'Elegancë dhe qetësi për qytet dhe biznes.',
  },
  {
    href: '/cars?category=economy',
    icon: <Wallet className="size-6" aria-hidden />,
    title: 'Ekonomike',
    desc: 'Konsum i ulët, çmim miqësor — ideale për çdo ditë.',
  },
  {
    href: '/cars?fuel=electric',
    icon: <Zap className="size-6" aria-hidden />,
    title: 'Elektrike',
    desc: 'Drejtim i heshtur, zero karburant, teknologji e re.',
  },
] as const

export function CategorySection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHead
          eyebrow="Kategoritë"
          title="Gjej makinën që të përshtatet"
          action={{ href: '/cars', label: 'Shiko të gjitha' }}
        />
      </Reveal>
      <StaggerGroup
        className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
        stagger={0.07}
      >
        {CATEGORIES.map((cat) => (
          <StaggerItem key={cat.title} lift={-6} className="h-full">
            <CategoryCard {...cat} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export function CategoryCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group shadow-soft hover:shadow-float focus-visible:ring-brand relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300 focus-visible:ring-2 focus-visible:outline-none"
    >
      {/* Ambient brand wash that warms on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand-soft opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="text-brand relative flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
        {icon}
      </span>
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <ArrowUpRight
            className="text-muted-foreground group-hover:text-brand size-5 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
        <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
          {desc}
        </p>
      </div>
    </Link>
  )
}

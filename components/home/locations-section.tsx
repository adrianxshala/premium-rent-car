'use client'

import { MapPin } from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

const LOCATIONS = [
  {
    city: 'Rrugë Brigada 123, Suharekë 23000',
    note: 'Zyra jonë',
  },
] as const

export function LocationsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHead
          eyebrow="Vendndodhjet"
          title="Të presim në qytetin tënd"
          action={{ href: '/cars', label: 'Rezervo tani' }}
        />
      </Reveal>
      <StaggerGroup
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
        stagger={0.07}
      >
        {LOCATIONS.map((loc) => (
          <StaggerItem
            key={loc.city}
            lift={-4}
            className="shadow-soft hover:shadow-float flex items-center gap-3 rounded-[24px] bg-white p-5 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300"
          >
            <span className="bg-secondary text-foreground flex size-11 shrink-0 items-center justify-center rounded-2xl">
              <MapPin className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">{loc.city}</p>
              <p className="text-muted-foreground text-sm">{loc.note}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

'use client'

import { BadgeCheck, ShieldCheck, Tag, Lock } from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

const REASONS = [
  {
    icon: <BadgeCheck className="size-5" aria-hidden />,
    title: 'Vetura të verifikuara',
    desc: 'Çdo shpallje kontrollohet.',
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    title: 'Shitës të verifikuar',
    desc: 'Më pak mashtrime dhe më shumë besim.',
  },
  {
    icon: <Tag className="size-5" aria-hidden />,
    title: 'Çmime transparente',
    desc: 'Pa tarifa të fshehura.',
  },
  {
    icon: <Lock className="size-5" aria-hidden />,
    title: 'Blerje e sigurt',
    desc: 'Proces i thjeshtë nga kërkimi deri te blerja.',
  },
] as const

export function WhyUsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHead
          eyebrow="Pse ne"
          title="Pse të zgjedhësh platformën tonë?"
        />
      </Reveal>
      <StaggerGroup
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        stagger={0.07}
      >
        {REASONS.map((r) => (
          <StaggerItem
            key={r.title}
            lift={-4}
            className="shadow-soft hover:shadow-float flex flex-col gap-4 rounded-[24px] bg-white p-6 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300"
          >
            <span className="bg-secondary text-foreground flex size-12 items-center justify-center rounded-2xl">
              {r.icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                {r.title}
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                {r.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

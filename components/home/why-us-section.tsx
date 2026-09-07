import {
  Tag,
  Headphones,
  BadgeCheck,
  CalendarClock,
  Zap,
  ShieldCheck,
} from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

const REASONS = [
  {
    icon: <Tag className="size-5" aria-hidden />,
    title: 'Çmime pa surpriza',
    desc: 'Çmimi që sheh është çmimi që paguan — pa tarifa të fshehura.',
  },
  {
    icon: <Headphones className="size-5" aria-hidden />,
    title: 'Mbështetje 24/7',
    desc: 'Je gjithmonë një telefonatë apo mesazh larg ndihmës sonë.',
  },
  {
    icon: <BadgeCheck className="size-5" aria-hidden />,
    title: 'Vetura të kontrolluara',
    desc: 'Çdo veturë servisohet, pastrohet dhe kontrollohet para çdo qiraje.',
  },
  {
    icon: <CalendarClock className="size-5" aria-hidden />,
    title: 'Marrje fleksibile',
    desc: 'Marrje dhe dorëzim në orarin që të përshtatet, edhe jashtë orarit.',
  },
  {
    icon: <Zap className="size-5" aria-hidden />,
    title: 'Rezervim i shpejtë',
    desc: 'Zgjidh datat, konfirmo online dhe je gati — brenda pak minutash.',
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    title: 'Udhëtim i sigurt',
    desc: 'Sigurim bazë i përfshirë dhe procedura të qarta që nga fillimi.',
  },
] as const

export function WhyUsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHead
          eyebrow="Pse RentCar Leo"
          title="Përvojë qiraje pa stres"
        />
      </Reveal>
      <StaggerGroup
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        stagger={0.06}
      >
        {REASONS.map((r) => (
          <StaggerItem
            key={r.title}
            lift={-4}
            className="shadow-soft hover:shadow-float flex flex-col gap-4 rounded-[24px] bg-white p-6 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300"
          >
            <span className="text-brand flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
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

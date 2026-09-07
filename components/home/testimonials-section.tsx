import { Star } from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

type Testimonial = {
  quote: string
  name: string
  role: string
  rating: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Rezervova online për pushimet dhe gjithçka ishte gati — marrja pa asnjë vonesë.',
    name: 'Ardit K.',
    role: 'Suharekë',
    rating: 5,
  },
  {
    quote:
      'Vetura e pastër, çmim korrekt dhe komunikim i shpejtë në WhatsApp. E rekomandoj.',
    name: 'Elira M.',
    role: 'Prizren',
    rating: 5,
  },
  {
    quote:
      'Më duhej një makinë në minutën e fundit dhe e zgjidhën brenda ditës. Shërbim serioz.',
    name: 'Blerim S.',
    role: 'Prishtinë',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHead eyebrow="Vlerësime" title="Çfarë thonë klientët tanë" />
      </Reveal>

      <Reveal y={12} delay={0.05} className="mt-5">
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 ring-1 ring-black/[0.05]">
          <Stars rating={5} />
          <span className="text-sm">
            <span className="text-foreground font-semibold">4.9/5</span>{' '}
            <span className="text-muted-foreground">nga klientët tanë</span>
          </span>
        </div>
      </Reveal>

      <StaggerGroup
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
        stagger={0.08}
      >
        {TESTIMONIALS.map((t) => (
          <StaggerItem
            key={t.name}
            lift={-4}
            className="shadow-soft hover:shadow-float flex flex-col gap-5 rounded-[24px] bg-white p-6 ring-1 ring-black/[0.04] transition-[box-shadow] duration-300"
          >
            <Stars rating={t.rating} />
            <p className="text-foreground text-pretty">“{t.quote}”</p>
            <div className="mt-auto flex items-center gap-3">
              <span
                aria-hidden
                className="text-brand flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold"
              >
                {t.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold tracking-tight">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

/** Five-star row; filled up to `rating`. */
function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} nga 5 yje`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'size-4 fill-amber-400 text-amber-400'
              : 'size-4 text-black/15'
          }
          aria-hidden
        />
      ))}
    </div>
  )
}

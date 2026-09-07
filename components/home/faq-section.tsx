'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'

import { EASE_OUT, Reveal } from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

/* ── FAQ ───────────────────────────────────────────────────────────────────
 * A single-open accordion. Answers are honest to this product: online booking
 * takes no prepayment; a refundable security deposit may be taken at pickup.
 * ────────────────────────────────────────────────────────────────────────── */

const FAQ = [
  {
    q: 'Sa është depozita?',
    a: 'Rezervimi online bëhet pa parapagesë. Në marrje të veturës mund të kërkohet një depozitë e vogël e kthyeshme si garanci, në varësi të modelit — ju e merrni të plotë kur e ktheni veturën pa dëmtime.',
  },
  {
    q: 'Çfarë dokumentesh më duhen?',
    a: 'Një dokument identifikimi (letërnjoftim ose pasaportë) dhe patentë shoferi e vlefshme prej të paktën një viti. Mosha minimale për qira është 21 vjeç.',
  },
  {
    q: 'A mund ta marr makinën jashtë orarit?',
    a: 'Po. Me një njoftim paraprak organizojmë marrjen dhe dorëzimin edhe jashtë orarit, në orën që të përshtatet ty.',
  },
  {
    q: 'A mund të udhëtoj jashtë Kosovës?',
    a: 'Po, me njoftim paraprak. Për disa shtete nevojitet dokumentacion shtesë (p.sh. kartoni jeshil), të cilin e përgatisim bashkë para nisjes.',
  },
  {
    q: 'Çfarë ndodh në rast dëmtimi?',
    a: 'Çdo veturë vjen me sigurim bazë të përfshirë. Në rast incidenti, na njofton menjëherë dhe plotësojmë raportin — përgjegjësia jote është e kufizuar deri te shuma e depozitës.',
  },
  {
    q: 'Si funksionon anulimi?',
    a: 'Anulimi është falas deri 48 orë para marrjes. Pas këtij afati mund të aplikohet një tarifë e vogël për ditën e parë.',
  },
  {
    q: 'A mund të rezervoj me telefon ose WhatsApp?',
    a: 'Sigurisht. Na shkruaj në WhatsApp në +383 49 624 299 dhe ta rezervojmë veturën bashkë, hap pas hapi.',
  },
] as const

export function FaqSection() {
  const [open, setOpen] = React.useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-24 px-6 py-16">
      <Reveal>
        <SectionHead eyebrow="Pyetje të shpeshta" title="Gjithçka që të duhet të dish" />
      </Reveal>
      <Reveal y={16} delay={0.05} className="mt-8">
        <div className="shadow-soft divide-y divide-black/[0.06] overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.04]">
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string
  answer: string
  open: boolean
  onToggle: () => void
}) {
  const reduce = useReducedMotion()

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-black/[0.015]"
      >
        <span className="text-foreground font-medium tracking-tight">
          {question}
        </span>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            open ? 'bg-brand text-brand-foreground' : 'bg-secondary text-foreground'
          }`}
        >
          <Plus
            className={`size-4 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
            aria-hidden
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? undefined : { height: 0, opacity: 0 }}
            animate={reduce ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground px-6 pb-5 text-sm leading-relaxed text-pretty">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

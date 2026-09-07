import { Clock, MapPin, MessageCircle, Navigation } from 'lucide-react'

import { Reveal } from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

/* ── Location section ──────────────────────────────────────────────────────
 * Where we are and how to reach us — the practical trust signals a local
 * customer looks for before booking: address, hours, WhatsApp, and a live map.
 * ────────────────────────────────────────────────────────────────────────── */

const WHATSAPP_URL = 'https://wa.me/38349624299'
const ADDRESS = 'Rrugë Brigada 123, Suharekë 23000'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Suhareke'

const HOURS = [
  { day: 'E hënë – E shtunë', time: '08:00 – 20:00' },
  { day: 'E diel', time: '09:00 – 18:00' },
] as const

export function LocationsSection() {
  return (
    <section
      id="lokacioni"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <Reveal>
        <SectionHead
          eyebrow="Lokacioni"
          title="Na gjen në Suharekë-Prishtinë"
        />
      </Reveal>

      <Reveal y={20} delay={0.05} className="mt-8">
        <div className="shadow-soft grid overflow-hidden rounded-[32px] bg-white ring-1 ring-black/[0.04] lg:grid-cols-2">
          {/* ── Left: the practical details ─────────────────────────────── */}
          <div className="flex flex-col gap-6 p-6 sm:gap-7 sm:p-10">
            <p className="text-muted-foreground max-w-md text-pretty">
              Marrja e veturës bëhet shpejt dhe pa komplikime. Na kontakto dhe e
              organizojmë bashkë marrjen te zyra jonë ose te vendi që të
              përshtatet.
            </p>

            <InfoRow icon={<MapPin className="size-5" aria-hidden />} label="Adresa">
              {ADDRESS}
            </InfoRow>

            <InfoRow icon={<Clock className="size-5" aria-hidden />} label="Orari">
              <span className="flex flex-col gap-0.5">
                {HOURS.map((h) => (
                  <span key={h.day} className="flex justify-between gap-6">
                    <span>{h.day}</span>
                    <span className="text-foreground font-medium">{h.time}</span>
                  </span>
                ))}
              </span>
            </InfoRow>

            <InfoRow
              icon={<Navigation className="size-5" aria-hidden />}
              label="Marrja"
            >
              Marrje & dorëzim pa pagesë brenda Suharekës. Për qytete të tjera,
              marrëvesh me ne paraprakisht.
            </InfoRow>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="shadow-soft inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 sm:justify-start sm:py-2.5"
              >
                <MessageCircle className="size-4" aria-hidden />
                Na kontakto në WhatsApp
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-black/[0.1] transition-colors hover:bg-black/[0.03] sm:justify-start sm:py-2.5"
              >
                <Navigation className="size-4" aria-hidden />
                Hap në Maps
              </a>
            </div>
          </div>

          {/* ── Right: live map ─────────────────────────────────────────── */}
          <div className="relative min-h-[16rem] bg-secondary lg:min-h-full">
            <iframe
              title="Harta e lokacionit — Suharekë"
              src="https://www.google.com/maps?q=Suhareke&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 grayscale-[0.15]"
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-brand flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <div className="text-foreground mt-1 text-sm text-pretty">{children}</div>
      </div>
    </div>
  )
}

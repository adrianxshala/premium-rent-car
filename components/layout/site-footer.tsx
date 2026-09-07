import Link from 'next/link'
import { Clock, MapPin, MessageCircle, Navigation } from 'lucide-react'

/* ── Footer — brand, contact, locations + links ────────────────────────── *
 * Mobile: a friendly, centered stack with a tappable green WhatsApp pill.
 * sm+: a left-aligned four-column layout.
 * ──────────────────────────────────────────────────────────────────────── */

/** WhatsApp click-to-chat link for +383 49 624 299 (digits only, no spaces). */
const WHATSAPP_URL = 'https://wa.me/38349624299'

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col items-center gap-9 border-t border-black/[0.06] pt-10 text-center sm:grid sm:grid-cols-2 sm:items-start sm:gap-8 sm:text-left lg:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="bg-foreground text-background flex size-8 items-center justify-center rounded-full text-sm font-semibold"
            >
              P
            </span>
            RentCar <span className="text-muted-foreground">Promo</span>
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm text-balance">
            Vetura premium për çdo udhëtim — rezervo online, shpejt e pa
            komplikime.
          </p>
        </div>

        {/* Contact — WhatsApp pill + opening hours */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <h3 className="text-sm font-semibold tracking-tight">Kontakt</h3>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="shadow-soft inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            +383 49 624 299
          </a>
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Hën–Sht: 08:00–20:00
              <br />
              Diel: 09:00–18:00
            </span>
          </p>
        </div>

        {/* Location */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <h3 className="text-sm font-semibold tracking-tight">Vendndodhja</h3>
          <p className="text-muted-foreground flex items-start justify-center gap-2 text-left text-sm sm:justify-start">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            Rrugë Brigada 123, Suharekë 23000
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Suhareke"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <Navigation className="size-4 shrink-0" aria-hidden />
            Hap në Google Maps
          </a>
        </div>

        {/* Links */}
        <nav className="flex flex-col items-center gap-3 sm:items-start">
          <h3 className="text-sm font-semibold tracking-tight">Lidhje</h3>
          <Link
            href="/cars"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Makinat
          </Link>
          <Link
            href="/#si-funksionon"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Si funksionon
          </Link>
          <Link
            href="/#faq"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Pyetje të shpeshta
          </Link>
          <Link
            href="/#kontakt"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Kontakt
          </Link>
        </nav>
      </div>

      <div className="text-muted-foreground mt-10 flex flex-col items-center gap-3 border-t border-black/[0.06] pt-6 text-sm sm:flex-row sm:justify-between">
        <p>© 2026 RentCar Promo</p>

        <div className="flex items-center gap-2.5">
          <span>
            Design &amp; develop by{' '}
            <span className="text-foreground font-medium">Adrian</span>
          </span>
          <a
            href="https://www.linkedin.com/in/adrian-shala-a80ba5198/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn — Adrian Shala"
            className="hover:text-foreground inline-flex size-8 items-center justify-center rounded-full ring-1 ring-black/[0.06] transition-colors hover:bg-black/[0.04]"
          >
            <LinkedinIcon className="size-4" />
          </a>
          <a
            href="https://wa.me/38349153002"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp — +383 49 153 002"
            className="hover:text-foreground inline-flex size-8 items-center justify-center rounded-full ring-1 ring-black/[0.06] transition-colors hover:bg-black/[0.04]"
          >
            <MessageCircle className="size-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  )
}

/** LinkedIn brand glyph (lucide ships no brand icons). */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

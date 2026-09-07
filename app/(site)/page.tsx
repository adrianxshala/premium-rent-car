import { getUser } from '@/lib/auth/dal'
import { createClient } from '@/lib/supabase/server'
import { PageReveal } from '@/components/motion/primitives'
import { Hero } from '@/components/home/hero'
import { TrustBar } from '@/components/home/trust-bar'
import { FeaturedVehicles } from '@/components/home/featured-vehicles'
import { CategorySection } from '@/components/home/category-section'
import { WhyUsSection } from '@/components/home/why-us-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { PromoSection } from '@/components/home/promo-section'
import { LocationsSection } from '@/components/home/locations-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { FaqSection } from '@/components/home/faq-section'
import { PremiumCta } from '@/components/home/premium-cta'
import { MobileStickyCta } from '@/components/layout/mobile-sticky-cta'

export default async function Home() {
  const user = await getUser()

  const supabase = await createClient()
  const { data: featured } = await supabase
    .from('cars')
    .select(
      'id, make, model, year, category, status, price_per_day, image_urls, transmission, fuel_type',
    )
    .neq('status', 'retired')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {/* Ambient blurred blobs for depth behind the lighter sections.
          Clipped to the viewport so they never add scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob top-[34%] -left-[12%] size-[30rem] bg-indigo-200/35" />
        <div className="blob top-[64%] -right-[10%] size-[26rem] bg-emerald-200/30" />
      </div>

      <PageReveal className="flex flex-1 flex-col">
        <Hero signedIn={Boolean(user)} />

        {/* Proof points, tucked directly under the hero. */}
        <TrustBar />

        {/* Elevated soft band — depth via surface change, not borders. */}
        <div className="surface mt-4">
          <FeaturedVehicles cars={featured ?? []} />
        </div>

        <CategorySection />

        <WhyUsSection />

        {/* Warm soft band holds the floating "how it works" panel. */}
        <div className="surface-warm">
          <HowItWorksSection />
        </div>

        <PromoSection />

        <LocationsSection />

        <TestimonialsSection />

        <FaqSection />

        <PremiumCta signedIn={Boolean(user)} />
      </PageReveal>

      {/* Mobile-only sticky booking bar (folds in WhatsApp; the global floating
          WhatsApp FAB is suppressed on this route to avoid stacking). */}
      <MobileStickyCta />
    </>
  )
}

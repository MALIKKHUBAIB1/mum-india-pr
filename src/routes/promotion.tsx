import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { PricingCard } from "@/components/PricingCard";
import { PromotionProductCard } from "@/components/PromotionProductCard";
import { LeadForm } from "@/components/LeadForm";
import { plans, promotionProducts, howItWorks } from "@/data/promotion";

export const Route = createFileRoute("/promotion")({
  head: () => ({
    meta: [
      { title: "Political Promotion Plans & Pricing | Mum India Strategy Research Pvt Ltd" },
      { name: "robots", content: "index, follow" },
      {
        name: "description",
        content:
          "Choose a political promotion package — profile promotion, social creatives, video content and regional campaign visibility. Contact for pricing.",
      },
      { property: "og:title", content: "Political Promotion Plans & Pricing" },
      {
        property: "og:description",
        content:
          "Starter, Growth and Authority promotion plans plus individual political branding services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/promotion" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "CollectionPage", "name": "Political Promotion Plans", "url": "https://mumindiapr.com/promotion"}) }],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/promotion" }],
  }),
  component: PromotionPage,
});

function PromotionPage() {
  return (
    <>
      <PageHero
        eyebrow="Packages"
        title="Political Promotion Plans"
        description="Choose the right promotional plan to increase your visibility, build public presence and reach your target audience."
      />

      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
          {/* PRICE HIDDEN - uncomment to restore
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Listed prices are indicative. Final pricing depends on region, scope and campaign
            duration.
          </p>
          */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Contact us for pricing — tailored to your region, scope and campaign duration.
          </p>
        </div>
      </section>

      <section className="section-y brand-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Add-ons"
            title="Individual Promotion Services"
            description="Purchase a single service when you need a focused piece of promotion rather than a full package."
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {promotionProducts.map((product) => (
              <PromotionProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y brand-gradient-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Process" title="How It Works" onDark />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <li
                key={s.step}
                className="rounded-lg border border-white/10 bg-white/5 p-7 transition-colors hover:border-india-green/60"
              >
                <span className="text-3xl font-extrabold text-accent">{s.step}</span>
                <h3 className="mt-4 text-lg font-bold text-primary-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                  {s.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Consultation"
              title="Tell us about your campaign"
              description="Share your profile, region and promotion requirement. Our team will respond with a suitable plan and timeline."
            />
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              <li className="rule-accent pl-5">No obligation — a consultation first, always.</li>
              <li className="rule-accent pl-5">
                Packages can be adjusted to a specific constituency or event.
              </li>
              <li className="rule-accent pl-5">
                Your details are used only to prepare and discuss your promotion plan.
              </li>
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}

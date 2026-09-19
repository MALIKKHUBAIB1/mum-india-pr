import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { faqs } from "@/data/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Mum India Strategy Research Pvt Ltd" },
      {
        name: "description",
        content:
          "Answers about political promotion services, packages, regional campaigns, timelines and pricing.",
      },
      { property: "og:title", content: "Frequently Asked Questions | Mum India Strategy Research Pvt Ltd" },
      {
        property: "og:description",
        content: "Common questions about our political promotion packages and process.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/faq" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        description="Everything you need to know about our political promotion services, packages and process."
      />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FAQAccordion items={faqs} />
        </div>
      </section>
      <CTASection
        title="Still have a question?"
        description="Send us your requirement and our team will answer directly."
        primaryLabel="Contact Us"
        secondaryLabel="View Plans"
      />
    </>
  );
}

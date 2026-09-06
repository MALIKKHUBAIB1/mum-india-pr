import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | MUM India PR" },
      {
        name: "description",
        content: "Terms governing the use of our website and our political promotion services.",
      },
      { property: "og:title", content: "Terms & Conditions | MUM India PR" },
      { property: "og:description", content: "Service terms, pricing and scope conditions." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "Services",
    body: "We provide promotional and digital branding services for political leaders, representatives and organisations. We are not a news publisher and do not offer editorial coverage.",
  },
  {
    title: "Pricing",
    body: "Prices listed on the website are indicative. Final pricing is confirmed in writing based on scope, region and campaign duration before work begins.",
  },
  {
    title: "Client Responsibilities",
    body: "Clients are responsible for the accuracy and legality of the material and claims they ask us to promote, and for compliance with applicable election and advertising rules.",
  },
  {
    title: "Deliverables & Timelines",
    body: "Deliverables and timelines are agreed per engagement. Delays in client approvals or inputs may affect the delivery schedule.",
  },
  {
    title: "Changes",
    body: "We may update these terms from time to time. The version published on this page applies to current engagements.",
  },
];

function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated: September 2026."
      />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-navy">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

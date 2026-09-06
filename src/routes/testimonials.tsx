import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CTASection } from "@/components/CTASection";
import { testimonials } from "@/data/site";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Feedback | MUM India PR" },
      {
        name: "description",
        content:
          "Feedback from political representatives and campaign teams about our promotion and creative support.",
      },
      { property: "og:title", content: "Client Feedback | MUM India PR" },
      {
        property: "og:description",
        content: "What political teams say about working with our promotion services.",
      },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What Our Clients Say"
        description="Placeholder statements are shown below until approved client feedback is published. We do not publish invented names or quotes."
      />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.role} {...t} />
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Work with our promotion team"
        description="Start with a consultation and we will map out a suitable campaign."
        primaryLabel="Contact Us"
        secondaryLabel="View Plans"
      />
    </>
  );
}

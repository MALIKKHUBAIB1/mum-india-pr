import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Megaphone, MonitorSmartphone, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { CTASection } from "@/components/CTASection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | MUM India PR" },
      {
        name: "description",
        content:
          "We help political leaders, representatives and public figures strengthen their digital presence and communicate their work effectively.",
      },
      { property: "og:title", content: "About Us | MUM India PR" },
      {
        property: "og:description",
        content: "Political promotion, regional expertise and digital campaign support.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    Icon: MapPin,
    title: "Regional Expertise",
    text: "We plan around specific districts and constituencies — their issues, their language and their audience — instead of generic national messaging.",
  },
  {
    Icon: Megaphone,
    title: "Political Promotion",
    text: "Profile promotion, campaign creatives, videos and content that present a leader's work clearly and consistently.",
  },
  {
    Icon: MonitorSmartphone,
    title: "Digital Campaign Support",
    text: "Ongoing support for social media presence, campaign phases and public communication activity.",
  },
];

const reasons = [
  "Regional Understanding",
  "Professional Branding",
  "Strategic Promotion",
  "Audience-Focused Campaigns",
  "Creative Political Content",
  "Digital Visibility",
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Us"
        description="We help political leaders, representatives and public figures strengthen their digital presence and communicate their activities effectively with their audience."
      />

      <section className="section-y bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading eyebrow="Who We Are" title="A promotion team built around political communication" />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              MUM India PR is a political promotion and regional campaign services brand. We
              work with leaders, representatives, candidates and political organisations to present
              their work, activities and message in a professional, consistent way.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our work is promotional, not editorial. We do not publish news — we build visibility
              for the people and organisations who hire us.
            </p>
          </div>
          <div className="space-y-8 rounded-lg border border-border bg-surface p-8 lg:p-10">
            <div>
              <h3 className="text-lg font-bold text-navy">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To make it easier for public representatives to communicate their work honestly and
                clearly to the communities they serve.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy">Our Approach</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Understand the region, define the message, produce the content, and promote it
                consistently — with agreed deliverables at each stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Three areas of focused support"
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pillars.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-md bg-navy text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why Choose Us" title="Why Choose Us?" align="center" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r) => (
              <div
                key={r}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-6 py-5 transition-colors hover:border-india-green/60"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-saffron-soft text-accent">
                  <Check className="size-4" />
                </span>
                <span className="font-semibold text-navy">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Let's plan your promotion"
        description="Share your region and objective and we will suggest a suitable programme."
        primaryLabel="Contact Us"
        secondaryLabel="View Plans"
      />
    </>
  );
}

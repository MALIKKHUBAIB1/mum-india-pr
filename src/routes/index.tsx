import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Target,
  Users,
  Sparkles,
  BarChart3,
  Handshake,
  Layers,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceGrid } from "@/components/ServiceGrid";
import { PricingCard } from "@/components/PricingCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { BlogCard } from "@/components/BlogCard";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { services as fallbackServices } from "@/data/services";
import { plans, howItWorks } from "@/data/promotion";
import { blogPosts as fallbackBlogPosts, testimonials as fallbackTestimonials } from "@/data/site";
import { getManagedContent } from "@/lib/content.server";
import { getBlogPosts } from "@/lib/blog-cms.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Political Promotion & Regional Campaign Services | Mum India Strategy Research Pvt Ltd" },
      { name: "robots", content: "index, follow" },
      {
        name: "description",
        content:
          "Professional political promotion, regional campaign visibility and digital outreach for leaders and public representatives across Uttar Pradesh.",
      },
      {
        property: "og:title",
        content: "Political Promotion & Regional Campaign Services | Mum India Strategy Research Pvt Ltd",
      },
      {
        property: "og:description",
        content:
          "Build your political presence with regional promotion, branding and digital campaign services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "Organization", "name": "Mum India Strategy Research Pvt Ltd", "url": "https://mumindiapr.com/", "logo": "https://mumindiapr.com/logo.jpeg", "contactPoint": {"@type": "ContactPoint", "telephone": "+91-9315203034", "contactType": "customer service", "email": "Info@mumindiapr.com"}, "address": {"@type": "PostalAddress", "streetAddress": "3rd Floor, Neelkanth Plaza, O-319, Alpha-I Commercial Belt, Block E, Alpha I", "addressLocality": "Greater Noida", "addressRegion": "Uttar Pradesh", "postalCode": "201308", "addressCountry": "IN"}, "sameAs": ["https://www.instagram.com/mumindiapr/?hl=de", "https://www.youtube.com/channel/UCdkC_YUP9LXl8BwqNcCyrVg", "https://www.linkedin.com/in/mum-india-pr-50a381434/"]}) }],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/" }],
  }),
  loader: async () => {
    try {
      const data = await getManagedContent();
      const imageBySlug = Object.fromEntries(fallbackServices.map((s) => [s.slug, s.image]));
      let posts = fallbackBlogPosts;
      try {
        posts = (await getBlogPosts()).posts;
      } catch {
        // keep static fallback
      }
      return {
        services: data.services.map((s) => ({
          ...s,
          image: (s.image || imageBySlug[s.slug]) ?? fallbackServices[0]!.image,
        })),
        testimonials: data.testimonials,
        posts,
      };
    } catch {
      return { services: fallbackServices, testimonials: fallbackTestimonials, posts: fallbackBlogPosts };
    }
  },
  component: Index,
});

const strengths = [
  {
    Icon: Target,
    title: "Region-Focused Strategy",
    text: "Campaigns planned around a specific constituency, its issues and its audience.",
  },
  {
    Icon: Sparkles,
    title: "Professional Creatives",
    text: "Posters, social posts and videos produced to a consistent brand standard.",
  },
  {
    Icon: Users,
    title: "Public Engagement",
    text: "Communication that turns everyday field work into visible, shareable content.",
  },
  {
    Icon: BarChart3,
    title: "Structured Promotion",
    text: "Clear deliverables, timelines and reporting for every promotional programme.",
  },
  {
    Icon: Handshake,
    title: "Direct Support",
    text: "A responsive team working with you and your campaign staff throughout.",
  },
  {
    Icon: Layers,
    title: "Scalable Packages",
    text: "Start small and expand into a complete regional visibility campaign.",
  },
];

function Index() {
  const { services, testimonials, posts: blogPosts } = Route.useLoaderData();
  return (
    <>
      <HeroSection />

      {/* Services */}
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Regional Services"
              title="Our Regional Political Services"
              description="Explore dedicated political promotion and visibility services across key regions of Uttar Pradesh."
            />
            <Button asChild variant="outlineAccent" size="lg" className="w-fit">
              <Link to="/services">
                View All Services <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <ServiceGrid services={services.slice(0, 6)} />
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section-y brand-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Promotion built for political ground reality"
            description="We work with leaders, representatives and campaign teams to present their work clearly and consistently to the people they serve."
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60 hover:shadow-[var(--shadow-card)]"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-md bg-navy text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Promotion Plans"
            title="Choose a promotion programme"
            description="Transparent packages designed for different stages of political visibility."
            align="center"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-y brand-gradient-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Process"
            title="How It Works"
            description="A simple, four-step path from selecting a service to launching your campaign."
            onDark
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <li
                key={s.step}
                className="rounded-lg border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-colors hover:border-india-green/60"
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

      {/* Testimonials */}
      <section className="section-y bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Client Feedback"
            title="What clients say"
            description="Placeholder feedback shown until approved client statements are published."
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t, i) => (
              <TestimonialCard
                key={"id" in t ? (t as { id: string }).id : `${t.role}-${i}`}
                role={t.role}
                quote={t.quote}
                {...(t.context ? { context: t.context } : {})}
                {...("image" in t && t.image ? { image: t.image as string } : {})}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Insights"
              title="Political marketing guides"
              description="Practical writing on campaign strategy, branding and digital outreach."
            />
            <Button asChild variant="outlineAccent" size="lg" className="w-fit">
              <Link to="/blog">
                Read the Blog <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.slice(0, 4).map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to strengthen your political presence?"
        description="Tell us about your region and requirement — our team will prepare a promotion approach suited to you."
        primaryLabel="Request Consultation"
        secondaryLabel="View Promotion Plans"
      />
    </>
  );
}

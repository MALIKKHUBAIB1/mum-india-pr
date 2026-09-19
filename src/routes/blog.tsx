import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { BlogCard } from "@/components/BlogCard";
import { CTASection } from "@/components/CTASection";
import { blogPosts } from "@/data/site";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Political Marketing & Campaign Guides | Mum India Strategy Research Pvt Ltd" },
      { name: "robots", content: "index, follow" },
      {
        name: "description",
        content:
          "Guides on political marketing, campaign strategy, social media branding and local digital promotion.",
      },
      { property: "og:title", content: "Political Marketing & Campaign Guides" },
      {
        property: "og:description",
        content: "Practical writing on political branding, public relations and digital promotion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/blog" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "Blog", "name": "Political Marketing Guides", "url": "https://mumindiapr.com/blog"}) }],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Political Marketing & Campaign Guides"
        description="Practical guidance on political branding, campaign strategy, public relations and digital promotion."
      />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Want this applied to your campaign?"
        description="Our team can turn these approaches into a promotion plan for your region."
        primaryLabel="Request Consultation"
        secondaryLabel="View Plans"
      />
    </>
  );
}

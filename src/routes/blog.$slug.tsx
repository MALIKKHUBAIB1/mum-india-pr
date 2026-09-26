import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CalendarDays, Tag, ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PortableText } from "@/components/PortableText";
import { CTASection } from "@/components/CTASection";
import { getBlogPost } from "@/lib/blog-cms.server";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { post } = await getBlogPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const canonical = `https://mumindiapr.com/blog/${post.slug}`;
    const title = `${post.title} | Mum India Strategy Research Pvt Ltd`;
    return {
      meta: [
        { title },
        { name: "robots", content: "index, follow" },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: post.image },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  notFoundComponent: ArticleNotFound,
  component: ArticlePage,
});

function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="text-3xl font-extrabold text-navy">Article not found</h1>
      <p className="mt-4 text-muted-foreground">This article may have been moved or deleted.</p>
      <Link to="/blog" className="mt-6 inline-block font-bold text-accent">
        Back to all articles
      </Link>
    </div>
  );
}

function ArticlePage() {
  const { post } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} description={post.excerpt} />
      <article className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-accent">
            <ArrowLeft className="size-4" /> All articles
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-accent" /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="size-4 text-accent" /> {post.category}
            </span>
          </div>
          <img
            src={post.image}
            alt={post.title}
            className="mt-6 aspect-[16/9] w-full rounded-lg border object-cover"
          />
          <div className="mt-4">
            <PortableText blocks={post.body} />
          </div>
        </div>
      </article>
      <CTASection
        title="Want this applied to your campaign?"
        description="Our team can turn these approaches into a promotion plan for your region."
        primaryLabel="Request Consultation"
        secondaryLabel="View Plans"
      />
    </>
  );
}

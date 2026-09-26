import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  Tag,
  ArrowLeft,
  Clock3,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Link2,
  Check,
  ListTree,
  Phone,
} from "lucide-react";
import { PortableText } from "@/components/PortableText";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { BlogCard } from "@/components/BlogCard";
import { getBlogPost } from "@/lib/blog-cms.server";
import { tocFromBlocks, readingMinutes } from "@/lib/blog-types";
import { contactInfo } from "@/data/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { post, related } = await getBlogPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const canonical = `https://mumindiapr.com/blog/${post.slug}`;
    const title = post.metaTitle?.trim() || `${post.title} | Mum India Strategy Research Pvt Ltd`;
    const description = post.metaDescription?.trim() || post.excerpt;
    const schemas: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: post.image,
        datePublished: post.date,
        author: { "@type": "Organization", name: "Mum India Strategy Research Pvt Ltd" },
        publisher: { "@type": "Organization", name: "Mum India Strategy Research Pvt Ltd" },
        mainEntityOfPage: canonical,
      },
    ];
    if (post.faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    return {
      meta: [
        { title },
        { name: "robots", content: "index, follow" },
        { name: "description", content: description },
        ...(post.keywords && post.keywords.length > 0
          ? [{ name: "keywords", content: post.keywords.join(", ") }]
          : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: post.image },
        { property: "og:url", content: canonical },
      ],
      scripts: schemas.map((s) => ({ type: "application/ld+json", children: JSON.stringify(s) })),
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

function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const links = [
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: Linkedin,
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      Icon: Twitter,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: Facebook,
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      Icon: MessageCircle,
    },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-navy">Share</span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copy link"
        title="Copy link"
        onClick={() =>
          navigator.clipboard.writeText(url).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            },
            () => undefined,
          )
        }
        className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}

function ArticlePage() {
  const { post, related } = Route.useLoaderData();
  const canonical = `https://mumindiapr.com/blog/${post.slug}`;
  const toc = tocFromBlocks(post.body);
  const minutes = readingMinutes(post.body);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-accent">
          <ArrowLeft className="size-4" /> Back to Blog
        </Link>

        <div className="mt-6 max-w-3xl">
          <span className="inline-block rounded-sm bg-navy px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4 text-accent" /> {minutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-accent" /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="size-4 text-accent" /> {post.category}
            </span>
          </div>
          <div className="mt-4">
            <ShareRow url={canonical} title={post.title} />
          </div>
        </div>

        <img
          src={post.image}
          alt={post.title}
          className="mt-8 aspect-[16/8] w-full rounded-xl border object-cover"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Article body */}
          <article className="min-w-0">
            {toc.length > 0 && (
              <details className="mb-8 rounded-lg border border-border bg-card p-5 lg:hidden">
                <summary className="flex cursor-pointer items-center gap-2 font-bold text-navy">
                  <ListTree className="size-4 text-accent" /> Table of Contents
                </summary>
                <ol className="mt-3 space-y-2">
                  {toc.map((t, i) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-sm font-medium text-muted-foreground hover:text-accent">
                        <span className="mr-2 font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <PortableText blocks={post.body} />

            {/* Author */}
            <div className="mt-10 flex gap-4 rounded-lg border border-border bg-card p-6">
              {post.authorImage ? (
                <img
                  src={post.authorImage}
                  alt={post.authorName || "Author"}
                  className="size-14 shrink-0 rounded-full border object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-primary-foreground">
                  {(post.authorName || "M").charAt(0)}
                </span>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Written by</p>
                <p className="mt-1 font-bold text-navy">{post.authorName?.trim() || "Team Mum India PR"}</p>
                {post.authorRole?.trim() ? (
                  <p className="text-xs font-semibold text-accent">{post.authorRole}</p>
                ) : null}
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {post.authorBio?.trim() ||
                    "Political promotion and campaign communication team at Mum India Strategy Research Pvt Ltd — writing practical guides on regional outreach, branding and digital campaigns."}
                </p>
              </div>
            </div>

            {/* FAQs */}
            {post.faqs.length > 0 && (
              <section className="mt-12">
                <p className="text-sm font-bold uppercase tracking-wider text-accent">FAQs</p>
                <h2 className="mt-2 text-2xl font-extrabold text-navy">Frequently Asked Questions</h2>
                <div className="mt-6">
                  <FAQAccordion items={post.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
                </div>
              </section>
            )}
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-navy">Summary</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </div>

              {toc.length > 0 && (
                <nav className="rounded-lg border border-border bg-card p-5" aria-label="Table of contents">
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy">
                    <ListTree className="size-4 text-accent" /> Table of Contents
                  </p>
                  <ol className="mt-3 space-y-2.5">
                    {toc.map((t, i) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className="text-sm font-medium leading-snug text-muted-foreground transition-colors hover:text-accent"
                        >
                          <span className="mr-2 font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Published</p>
                  <p className="mt-1 text-sm font-bold text-navy">{post.date}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reading time</p>
                  <p className="mt-1 text-sm font-bold text-navy">{minutes} min</p>
                </div>
              </div>

              <div className="rounded-lg bg-navy p-6 text-primary-foreground">
                <p className="text-lg font-extrabold leading-snug">Have a campaign in mind? Let's build it.</p>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Talk to our team about promotion tailored to your region and goals.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Get in Touch
                  </Link>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/10"
                  >
                    <Phone className="size-4" /> {contactInfo.phone}
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <p className="text-sm font-bold uppercase tracking-wider text-accent">Related articles</p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.slug} post={r} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CTASection
        title="Want this applied to your campaign?"
        description="Our team can turn these approaches into a promotion plan for your region."
        primaryLabel="Request Consultation"
        secondaryLabel="View Plans"
      />
    </div>
  );
}

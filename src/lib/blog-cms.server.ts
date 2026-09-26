import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { blogPosts as staticPosts } from "@/data/site";
import type { BlogPostDetail, BlogPostSummary, Faq, PortableBlock } from "./blog-types";

const API_VERSION = "2025-01-01";

function sanityEnv() {
  const projectId = process.env["SANITY_PROJECT_ID"];
  if (!projectId) return null;
  return {
    projectId,
    dataset: process.env["SANITY_DATASET"] || "production",
    token: process.env["SANITY_READ_TOKEN"] || "",
  };
}

export function sanityConfigured() {
  return Boolean(sanityEnv());
}

async function sanityQuery<T>(groq: string, params: Record<string, string> = {}): Promise<T> {
  const env = sanityEnv();
  if (!env) throw new Error("sanity not configured");
  const url = new URL(`https://${env.projectId}.apicdn.sanity.io/v${API_VERSION}/data/query/${env.dataset}`);
  url.searchParams.set("query", groq);
  // Sanity expects param values JSON-encoded (strings need quotes).
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url.toString(), {
    headers: env.token ? { Authorization: `Bearer ${env.token}` } : {},
    // Cache at Sanity CDN edge; our own short cache below absorbs bursts.
    next: undefined,
  } as RequestInit);
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const json = (await res.json()) as { result: T };
  return json.result;
}

// Tiny in-memory cache (per server instance) — avoids hammering the API.
let listCache: { at: number; data: BlogPostSummary[] } | null = null;
const CACHE_MS = 60_000;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function staticSummaries(): BlogPostSummary[] {
  return staticPosts.map((p) => ({ ...p }));
}

const LIST_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  category,
  excerpt,
  "date": publishedAt,
  "image": mainImage.asset->url
}`;

const DETAIL_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  "slug": slug.current,
  title,
  category,
  excerpt,
  metaTitle,
  metaDescription,
  keywords,
  "date": publishedAt,
  "image": mainImage.asset->url,
  authorName,
  authorRole,
  authorBio,
  "authorImage": authorImage.asset->url,
  faqs[]{question, answer},
  body[] {
    _type, _key, style, listItem, level, markDefs,
    children[] { _type, _key, text, marks },
    "url": asset->url, alt
  }
}`;

type SanityListRow = {
  slug: string;
  title: string;
  category?: string;
  excerpt?: string;
  date?: string;
  image?: string;
};

const FALLBACK_IMAGE = staticPosts[0]?.image ?? "/logo.jpeg";

function toSummary(r: SanityListRow): BlogPostSummary {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category || "Insights",
    excerpt: r.excerpt || "",
    date: r.date ? formatDate(r.date) : "",
    image: r.image ? `${r.image}?w=1200&q=75&auto=format` : FALLBACK_IMAGE,
  };
}

function staticDetail(slug: string): BlogPostDetail | null {
  const p = staticPosts.find((x) => x.slug === slug);
  if (!p) return null;
  const body: PortableBlock[] = [
    {
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: p.excerpt }],
    },
  ];
  return {
    ...p,
    body,
    faqs: [],
    metaTitle: "",
    metaDescription: "",
    keywords: [] as string[],
    authorName: "",
    authorRole: "",
    authorBio: "",
    authorImage: "",
  };
}

async function relatedPosts(currentSlug: string, category: string): Promise<BlogPostSummary[]> {
  try {
    const { posts } = await getBlogPosts();
    const others = posts.filter((p) => p.slug !== currentSlug);
    others.sort((a, b) => Number(b.category === category) - Number(a.category === category));
    return others.slice(0, 3);
  } catch {
    return [];
  }
}

export const getBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  if (!sanityEnv()) return { posts: staticSummaries(), source: "static" as const };
  if (listCache && Date.now() - listCache.at < CACHE_MS) {
    return { posts: listCache.data, source: "sanity" as const };
  }
  try {
    const rows = await sanityQuery<SanityListRow[]>(LIST_QUERY);
    if (!rows || rows.length === 0) return { posts: staticSummaries(), source: "static" as const };
    const posts = rows.map(toSummary);
    listCache = { at: Date.now(), data: posts };
    return { posts, source: "sanity" as const };
  } catch (e) {
    console.error("[blog-cms] Sanity list failed, using static:", e);
    return { posts: staticSummaries(), source: "static" as const };
  }
});

export const getBlogPost = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    if (sanityEnv()) {
      try {
        const row = await sanityQuery<
          (
            SanityListRow & {
              body?: PortableBlock[];
              faqs?: Faq[];
              metaTitle?: string;
              metaDescription?: string;
              keywords?: string[];
              authorName?: string;
              authorRole?: string;
              authorBio?: string;
              authorImage?: string;
            }
          ) | null
        >(DETAIL_QUERY, { slug: data.slug });
        if (row) {
          const post = {
            ...toSummary(row),
            body: Array.isArray(row.body) && row.body.length > 0 ? row.body : [],
            faqs: Array.isArray(row.faqs) ? row.faqs.filter((f) => f.question && f.answer) : [],
            metaTitle: row.metaTitle || "",
            metaDescription: row.metaDescription || "",
            keywords: Array.isArray(row.keywords) ? row.keywords.filter(Boolean) : [],
            authorName: row.authorName || "",
            authorRole: row.authorRole || "",
            authorBio: row.authorBio || "",
            authorImage: row.authorImage ? `${row.authorImage}?w=200&q=75&auto=format` : "",
          } as BlogPostDetail;
          return {
            post,
            related: await relatedPosts(post.slug, post.category),
            source: "sanity" as const,
          };
        }
      } catch (e) {
        console.error("[blog-cms] Sanity detail failed, trying static:", e);
      }
    }
    const post = staticDetail(data.slug);
    return {
      post,
      related: post ? await relatedPosts(post.slug, post.category) : [],
      source: "static" as const,
    };
  });

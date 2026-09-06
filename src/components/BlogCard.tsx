import { ArrowRight, CalendarDays } from "lucide-react";

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
};

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60 hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          width={900}
          height={640}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-navy-deep/90 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-primary-foreground">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="size-3.5 text-accent" />
          {post.date}
        </p>
        <h3 className="mt-3 text-lg font-bold leading-snug text-navy transition-colors group-hover:text-india-green-deep">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <button
          type="button"
          className="mt-6 inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-bold text-accent"
        >
          Read Article
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

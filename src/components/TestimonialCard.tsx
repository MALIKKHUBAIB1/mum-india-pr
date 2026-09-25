import { Quote } from "lucide-react";

export function TestimonialCard({
  role,
  quote,
  context,
  image,
}: {
  role: string;
  quote: string;
  context?: string;
  image?: string;
}) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60">
      <div className="flex items-center justify-between">
        <Quote className="size-8 text-accent" />
        {image ? (
          <img src={image} alt={role} loading="lazy" className="size-12 rounded-full border object-cover" />
        ) : null}
      </div>
      <blockquote className="mt-5 flex-1 text-lg font-medium leading-relaxed text-navy">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        {image ? (
          <img src={image} alt="" aria-hidden className="size-10 rounded-full object-cover" />
        ) : null}
        <span>
          <span className="block text-sm font-bold text-navy">{role}</span>
          {context && (
            <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
              {context}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

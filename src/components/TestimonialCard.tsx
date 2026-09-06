import { Quote } from "lucide-react";

export function TestimonialCard({
  role,
  quote,
  context,
}: {
  role: string;
  quote: string;
  context?: string;
}) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60">
      <Quote className="size-8 text-accent" />
      <blockquote className="mt-5 flex-1 text-lg font-medium leading-relaxed text-navy">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-border pt-5">
        <span className="block text-sm font-bold text-navy">{role}</span>
        {context && (
          <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
            {context}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

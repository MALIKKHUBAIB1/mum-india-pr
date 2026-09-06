import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          width={900}
          height={640}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-navy-deep/10 to-transparent" />
        <span className="hindi absolute bottom-3 left-3 rounded-sm bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
          {service.region}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="hindi text-xl font-bold leading-snug text-navy transition-colors group-hover:text-india-green-deep">
          {service.title}
        </h3>
        <p className="hindi mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {service.shortDescription}
        </p>
        <span className="hindi mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
          और जानें
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  );
}

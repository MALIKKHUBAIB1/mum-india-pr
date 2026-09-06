import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryTo = "/contact",
  secondaryLabel,
  secondaryTo = "/promotion",
  hindi = false,
}: {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryTo?: "/contact" | "/promotion" | "/services";
  secondaryLabel?: string;
  secondaryTo?: "/contact" | "/promotion" | "/services";
  hindi?: boolean;
}) {
  return (
    <section className="relative overflow-hidden brand-gradient-dark">
      
      <div className="absolute inset-x-0 top-0 h-1.5 brand-bar" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-8 lg:py-20">
        <div className={cn("max-w-2xl", hindi && "hindi")}>
          <h2 className="text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75">
              {description}
            </p>
          )}
        </div>
        <div className={cn("mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0", hindi && "hindi")}>
          <Button asChild variant="accent" size="xl">
            <Link to={primaryTo}>
              {primaryLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
          {secondaryLabel && (
            <Button asChild variant="onDark" size="xl">
              <Link to={secondaryTo}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

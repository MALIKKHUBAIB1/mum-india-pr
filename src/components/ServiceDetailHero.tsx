import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/data/services";

export function ServiceDetailHero({ service }: { service: Service }) {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <img
        src={service.image}
        alt={service.title}
        width={900}
        height={640}
        className="absolute inset-0 size-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/55" />
      <div className="absolute inset-x-0 bottom-0 h-1.5 brand-bar" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="hindi max-w-3xl">
          <span className="inline-flex rounded-sm bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            {service.title}
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-snug text-primary-foreground sm:text-4xl lg:text-[2.9rem]">
            {service.heroHeading}
          </h1>
          <div className="mt-6 space-y-4">
            {service.description.map((p) => (
              <p key={p} className="text-base leading-loose text-primary-foreground/80">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="xl">
              <Link to="/contact">
                अभी संपर्क करें <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="onDark" size="xl">
              <Link to="/promotion">प्रमोशन प्लान देखें</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

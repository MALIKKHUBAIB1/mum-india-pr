import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Plan } from "@/data/promotion";

export function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-8 transition-all duration-300 hover:-translate-y-1",
        plan.popular
          ? "border-accent shadow-[var(--shadow-accent)] lg:-mt-4 lg:pb-12"
          : "border-border shadow-[var(--shadow-card)] hover:border-india-green/60",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-8 rounded-sm bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
          Most Popular
        </span>
      )}

      <h3 className="text-lg font-bold text-navy">{plan.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>

      <div className="mt-6 flex items-end gap-2 border-b border-border pb-6">
        <span className="text-4xl font-extrabold tracking-tight text-navy">{plan.price}</span>
        <span className="pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {plan.cadence}
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground/85">
            <Check className="mt-0.5 size-4 shrink-0 text-india-green" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        variant={plan.popular ? "accent" : "navy"}
        className="mt-8 w-full"
      >
        <Link to="/contact">
          {plan.cta}
        </Link>
      </Button>
    </div>
  );
}

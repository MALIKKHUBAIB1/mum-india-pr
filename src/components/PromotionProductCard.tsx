import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromotionProduct } from "@/data/promotion";

export function PromotionProductCard({ product }: { product: PromotionProduct }) {
  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60 hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-snug text-navy">{product.name}</h3>
        {product.badge && (
          <span className="shrink-0 rounded-sm border border-accent/40 bg-saffron-soft px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-saffron-deep">
            {product.badge}
          </span>
        )}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <span className="text-2xl font-extrabold text-navy">{product.price}</span>
        <Button asChild variant="outlineAccent" size="sm">
          <Link to="/contact">
            Get Started <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

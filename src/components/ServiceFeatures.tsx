import { Check, UserCheck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

export function ServiceFeatures({
  deliverables,
  audience,
}: {
  deliverables: string[];
  audience: string[];
}) {
  return (
    <section className="section-y bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="सेवा विवरण" title="इस सेवा में क्या मिलेगा?" hindi />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((item) => (
            <div
              key={item}
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-india-green/60"
            >
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-saffron-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Check className="size-4" />
              </span>
              <span className="hindi text-[0.95rem] font-semibold leading-snug text-navy">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-border bg-surface p-8 lg:p-10">
          <SectionHeading title="किसके लिए है?" hindi />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audience.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-5 py-4"
              >
                <UserCheck className="size-5 shrink-0 text-india-green" />
                <span className="hindi font-semibold text-navy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

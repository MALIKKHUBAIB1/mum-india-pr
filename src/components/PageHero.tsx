import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  hindi = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  hindi?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-1.5 brand-bar" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className={cn("max-w-3xl", hindi && "hindi")}>
          {eyebrow && (
            <span className="eyebrow text-accent">
              <span className="h-px w-6 bg-current" aria-hidden />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

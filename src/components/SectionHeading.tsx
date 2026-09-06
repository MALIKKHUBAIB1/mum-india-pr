import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onDark = false,
  hindi = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  onDark?: boolean;
  hindi?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        hindi && "hindi",
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow", onDark && "text-accent")}>
          <span className={cn("h-[3px] w-8 rounded-full", onDark ? "bg-current" : "bg-gradient-to-r from-saffron to-india-green")} aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]",
          onDark ? "text-primary-foreground" : "text-navy",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            onDark ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

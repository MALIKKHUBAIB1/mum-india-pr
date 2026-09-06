import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

// NOTE: logo.jpeg was a Lovable-hosted asset (`/__l5e/assets-v1/...`) which only
// resolves inside Lovable previews (LOVABLE_PREVIEW_HOST proxy, serve-only).
// Downloaded projects don't include the binary — only `logo.jpeg.asset.json`.
// Use the vendored local copy instead so it works with `npm run dev` / build
// and any self-hosted deployment. Place your file at `public/logo.jpeg`
// (falls back to `/favicon.png`, which is the same MUM INDIA PR mark).
const LOGO_SRC = "/logo.jpeg";

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="MUM India PR — home">
      <img
        src={LOGO_SRC}
        onError={(e) => {
          // If public/logo.jpeg is missing, fall back to the favicon mark.
          if (e.currentTarget.src.endsWith("/favicon.png")) return;
          e.currentTarget.src = "/favicon.png";
        }}
        alt="MUM India PR logo"
        width={48}
        height={48}
        className="h-12 w-12 rounded-md bg-white object-contain p-0.5"
      />
      <span className="hidden leading-tight sm:block">
        <span className="block text-base font-extrabold tracking-tight">
          <span className={cn(onDark ? "text-primary-foreground" : "text-navy")}>MUM </span>
          <span className="text-india-green">INDIA </span>
          <span className="text-accent">PR</span>
        </span>
        <span
          className={cn(
            "block text-[0.65rem] font-bold uppercase tracking-[0.28em]",
            onDark ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          Political Promotion
        </span>
      </span>
    </Link>

  );
}

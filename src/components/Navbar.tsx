import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { contactInfo } from "@/data/site";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/promotion", label: "Promotion" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-navy after:scale-x-100" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-navy" }}
              className="relative px-3 py-2 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform hover:after:scale-x-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 text-sm font-semibold text-navy xl:flex"
          >
            <Phone className="size-4 text-accent" />
            {contactInfo.phone}
          </a>
          <Button asChild variant="accent" className="hidden sm:inline-flex">
            <Link to="/promotion">Get Promotion</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border text-navy lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-navy border-accent" }}
                inactiveProps={{ className: "text-muted-foreground border-transparent" }}
                className="border-l-2 py-3 pl-3 text-base font-semibold transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="accent" size="lg" className="mt-4">
              <Link to="/promotion" onClick={() => setOpen(false)}>
                Get Promotion
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

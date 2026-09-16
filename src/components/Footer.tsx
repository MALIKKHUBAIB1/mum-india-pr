import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { contactInfo } from "@/data/site";

const columns = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/testimonials", label: "Testimonials" },
      { to: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Services",
    links: [
      { to: "/services", label: "Regional Services" },
      { to: "/promotion", label: "Political Promotion" },
      { to: "/promotion", label: "Digital Branding" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy-policy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
] as const;

const socials = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "YouTube", Icon: Youtube },
  { label: "LinkedIn", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo onDark />
            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/70">
              Political promotion, regional campaign visibility and digital branding services for
              leaders, representatives and political teams across Uttar Pradesh.
            </p>
            <div className="mt-6 space-y-2 text-sm text-primary-foreground/70">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-accent" /> {contactInfo.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-accent" /> {contactInfo.email}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {contactInfo.location}
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-india-green">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link
                      to={l.to}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Mum India Strategy Research Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
            <a
              href="#"
              aria-label="X"
              className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-sm font-bold text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

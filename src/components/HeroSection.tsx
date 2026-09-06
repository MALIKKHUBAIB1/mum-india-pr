import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Megaphone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

const highlights = [
  { Icon: MapPin, label: "Region-first campaigns" },
  { Icon: Megaphone, label: "Profile & content promotion" },
  { Icon: ShieldCheck, label: "Structured, professional process" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <img
        src={heroImage}
        alt="Public rally crowd at a political campaign event"
        width={1600}
        height={1000}
        className="absolute inset-0 size-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/50" />
      <div className="absolute inset-x-0 bottom-0 h-1.5 brand-bar" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <span className="eyebrow text-accent">
            <span className="h-px w-6 bg-current" aria-hidden />
            Political Promotion & Regional Campaign Services
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] text-primary-foreground sm:text-5xl lg:text-6xl">
            Build Your Political Presence. Reach the Right Audience.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            Professional political promotion, regional campaign visibility and digital outreach
            services designed to help leaders and public representatives connect with their
            audience.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="xl">
              <Link to="/services">
                Explore Services <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="onDark" size="xl">
              <Link to="/promotion">View Promotion Plans</Link>
            </Button>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {highlights.map(({ Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 border-l-2 border-accent/70 pl-3 text-sm font-semibold text-primary-foreground/85"
              >
                <Icon className="size-5 shrink-0 text-accent" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { contactInfo } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Let's Discuss Your Promotion | Mum India Strategy Research Pvt Ltd" },
      { name: "robots", content: "index, follow" },
      {
        name: "description",
        content:
          "Contact our political promotion team by form, phone, email or WhatsApp to discuss your regional campaign.",
      },
      { property: "og:title", content: "Contact | Mum India Strategy Research Pvt Ltd" },
      {
        property: "og:description",
        content: "Discuss your political promotion requirement with our team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/contact" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "ContactPage", "name": "Contact", "url": "https://mumindiapr.com/contact"}) }],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/contact" }],
  }),
  component: ContactPage,
});

const details = [
  { Icon: Phone, label: "Phone", value: contactInfo.phone },
  { Icon: Mail, label: "Email", value: contactInfo.email },
  { Icon: MapPin, label: "Office", value: contactInfo.location },
  { Icon: Clock, label: "Working Hours", value: contactInfo.hours },
];

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Discuss Your Promotion"
        description="Tell us about your profile, region and objective. Our team will respond with a suitable promotion approach."
      />

      <section className="section-y bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
          <ContactForm />

          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-surface p-8">
              <h2 className="text-lg font-bold text-navy">Contact details</h2>
              <ul className="mt-6 space-y-5">
                {details.map(({ Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-navy text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                      <span className="block text-sm font-semibold text-navy">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                Phone, email and address shown here are placeholders — share your real details and
                we will update them.
              </p>
            </div>

            <div className="rounded-lg border border-india-green/40 bg-india-green-soft p-8">
              <h2 className="text-lg font-bold text-navy">Prefer WhatsApp?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Message us directly and we will reply during working hours.
              </p>
              <Button asChild variant="green" size="lg" className="mt-5 w-full">
                <a href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

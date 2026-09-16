import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Mum India Strategy Research Pvt Ltd" },
      {
        name: "description",
        content: "How Mum India Strategy Research Pvt Ltd collects, uses and protects the information you share with us.",
      },
      { property: "og:title", content: "Privacy Policy | Mum India Strategy Research Pvt Ltd" },
      { property: "og:description", content: "Our approach to your data and enquiry details." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information We Collect",
    body: "We collect the details you submit through our enquiry and consultation forms, such as your name, mobile number, email, city or constituency, political position and message.",
  },
  {
    title: "How We Use It",
    body: "Your details are used only to respond to your enquiry, prepare a promotion proposal and communicate with you about the service you requested.",
  },
  {
    title: "Sharing",
    body: "We do not sell your information. Details are shared only with team members working on your enquiry, or where required by law.",
  },
  {
    title: "Retention",
    body: "Enquiry details are retained for as long as needed to serve you or as required for our records. You can request deletion at any time.",
  },
  {
    title: "Contact",
    body: "For any question about this policy or your data, contact us through the details listed on the contact page.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated: September 2026." />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-navy">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

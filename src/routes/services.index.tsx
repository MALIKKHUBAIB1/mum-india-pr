import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ServiceGrid } from "@/components/ServiceGrid";
import { CTASection } from "@/components/CTASection";
import { services as fallbackServices } from "@/data/services";
import { getManagedContent } from "@/lib/content.server";

const imageBySlug = Object.fromEntries(fallbackServices.map((s) => [s.slug, s.image]));

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "क्षेत्रीय राजनीतिक सेवाएं | Mum India Strategy Research Pvt Ltd" },
      { name: "robots", content: "index, follow" },
      {
        name: "description",
        content:
          "गौतम बुद्ध नगर, नोएडा, दादरी, जेवर, बुलंदशहर, स्याना और अनूपशहर के लिए राजनीतिक प्रचार और जनसंपर्क सेवाएं।",
      },
      { property: "og:title", content: "क्षेत्रीय राजनीतिक सेवाएं | Mum India Strategy Research Pvt Ltd" },
      {
        property: "og:description",
        content: "उत्तर प्रदेश के प्रमुख क्षेत्रों के लिए राजनीतिक प्रमोशन सेवाएं।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://mumindiapr.com/logo.jpeg" },
      { property: "og:url", content: "https://mumindiapr.com/services" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "CollectionPage", "name": "Regional Political Services", "url": "https://mumindiapr.com/services"}) }],
    links: [{ rel: "canonical", href: "https://mumindiapr.com/services" }],
  }),
  loader: async () => {
    try {
      const data = await getManagedContent();
      return {
        services: data.services.map((s) => ({
          ...s,
          image: (s.image || imageBySlug[s.slug]) ?? fallbackServices[0]!.image,
        })),
      };
    } catch {
      return { services: fallbackServices };
    }
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="सेवाएं"
        title="हमारी क्षेत्रीय राजनीतिक सेवाएं"
        description="उत्तर प्रदेश के प्रमुख क्षेत्रों के लिए राजनीतिक प्रचार, जनसंपर्क और डिजिटल विजिबिलिटी सेवाएं।"
        hindi
      />
      <section className="section-y bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServiceGrid services={services} />
        </div>
      </section>
      <CTASection
        title="अपनी राजनीतिक पहचान को मजबूत बनाइए"
        description="अपने क्षेत्र और आवश्यकता के अनुसार प्रचार योजना के लिए हमसे संपर्क करें।"
        primaryLabel="अभी संपर्क करें"
        secondaryLabel="प्रमोशन प्लान देखें"
        hindi
      />
    </>
  );
}

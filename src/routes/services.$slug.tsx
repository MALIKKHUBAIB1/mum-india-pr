import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ServiceDetailHero } from "@/components/ServiceDetailHero";
import { ServiceFeatures } from "@/components/ServiceFeatures";
import { CTASection } from "@/components/CTASection";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { getService, services, serviceDeliverables, serviceAudience } from "@/data/services";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "सेवा उपलब्ध नहीं" }, { name: "robots", content: "noindex" }],
      };
    }
    const { service } = loaderData;
    const title = `${service.title} | MUM India PR`;
    return {
      meta: [
        { title },
        { name: "description", content: service.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: service.shortDescription },
      ],
    };
  },
  notFoundComponent: ServiceNotFound,
  component: ServiceDetail,
});

function ServiceNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="hindi text-3xl font-extrabold text-navy">यह सेवा उपलब्ध नहीं है</h1>
      <p className="hindi mt-4 text-muted-foreground">कृपया हमारी सभी सेवाएं देखें।</p>
      <Link to="/services" className="hindi mt-6 inline-block font-bold text-accent">
        सभी सेवाएं देखें
      </Link>
    </div>
  );
}

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <ServiceDetailHero service={service} />
      <ServiceFeatures deliverables={serviceDeliverables} audience={serviceAudience} />

      <section className="section-y bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="अन्य सेवाएं" title="अन्य क्षेत्रीय सेवाएं" hindi />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="अपनी राजनीतिक पहचान को मजबूत बनाइए"
        description="अपने क्षेत्र के लिए उपयुक्त प्रचार योजना जानने हेतु हमारी टीम से बात करें।"
        primaryLabel="अभी संपर्क करें"
        secondaryLabel="प्रमोशन प्लान देखें"
        hindi
      />
    </>
  );
}

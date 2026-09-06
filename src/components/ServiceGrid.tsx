import { ServiceCard } from "@/components/ServiceCard";
import type { Service } from "@/data/services";

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.slug} service={service} />
      ))}
    </div>
  );
}

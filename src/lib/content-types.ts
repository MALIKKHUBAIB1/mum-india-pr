export type ManagedTestimonial = {
  id: string;
  role: string;
  quote: string;
  context?: string;
  image?: string;
};

export type ManagedService = {
  slug: string;
  title: string;
  region: string;
  shortDescription: string;
  heroHeading: string;
  description: string[];
  image?: string;
};

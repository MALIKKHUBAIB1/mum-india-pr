/**
 * Demo pricing. Edit the values here to change every pricing card on the site.
 */

export type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter Promotion",
    price: "₹4,999",
    cadence: "One-Time",
    summary: "A focused starting point for leaders beginning their digital presence.",
    features: [
      "Political profile promotion",
      "5 social media creatives",
      "Basic campaign strategy",
      "Regional audience targeting",
      "1 promotional article/content piece",
      "WhatsApp support",
    ],
    cta: "Buy Starter Plan",
  },
  {
    id: "growth",
    name: "Growth Promotion",
    price: "₹9,999",
    cadence: "One-Time",
    summary: "Balanced visibility, creatives and video for an active regional campaign.",
    popular: true,
    features: [
      "Everything in Starter",
      "15 social media creatives",
      "Video promotional content",
      "Political profile branding",
      "Regional campaign promotion",
      "Social media campaign support",
      "3 promotional content pieces",
      "Priority support",
    ],
    cta: "Choose Growth Plan",
  },
  {
    id: "authority",
    name: "Authority Promotion",
    price: "₹19,999",
    cadence: "One-Time",
    summary: "Complete branding and campaign positioning for established representatives.",
    features: [
      "Complete political branding",
      "30 social media creatives",
      "Multiple promotional videos",
      "Political campaign strategy",
      "Regional visibility campaign",
      "Profile positioning",
      "Interview promotion",
      "Content marketing",
      "Dedicated support",
    ],
    cta: "Choose Authority Plan",
  },
];

export type PromotionProduct = {
  id: string;
  name: string;
  price: string;
  description: string;
  badge?: string;
};

export const promotionProducts: PromotionProduct[] = [
  {
    id: "profile-building",
    name: "Political Profile Building",
    price: "₹2,999",
    description: "Build a professional and powerful political digital identity.",
  },
  {
    id: "social-branding",
    name: "Social Media Political Branding",
    price: "₹4,999",
    description: "Professional branding and social media presence for political leaders.",
    badge: "Popular",
  },
  {
    id: "campaign-creative",
    name: "Campaign Creative Package",
    price: "₹3,999",
    description: "Political posters, banners, social media creatives and campaign graphics.",
  },
  {
    id: "video-promotion",
    name: "Video Promotion Package",
    price: "₹6,999",
    description:
      "Professional promotional videos designed for political and social media campaigns.",
  },
  {
    id: "regional-campaign",
    name: "Regional Digital Campaign",
    price: "₹9,999",
    description: "Targeted promotional campaign for a selected local constituency or region.",
    badge: "Best for elections",
  },
  {
    id: "interview-promotion",
    name: "Political Interview Promotion",
    price: "₹4,999",
    description: "Interview presentation, promotion and digital distribution support.",
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Choose Your Service",
    description: "Select your political service or promotion package.",
  },
  {
    step: "02",
    title: "Submit Your Details",
    description: "Tell us about your profile, region and promotion requirements.",
  },
  {
    step: "03",
    title: "Strategy & Content",
    description: "Our team prepares the promotional strategy and content.",
  },
  {
    step: "04",
    title: "Campaign Goes Live",
    description: "Your campaign or promotional activity is launched.",
  },
];

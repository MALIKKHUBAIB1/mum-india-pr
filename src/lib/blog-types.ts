export type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
};

export type PortableSpan = {
  _type: "span";
  _key?: string;
  text: string;
  marks?: string[];
};

export type PortableBlock = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children?: PortableSpan[];
  markDefs?: Array<{ _key: string; _type: string; href?: string }>;
  url?: string;
  alt?: string;
};

export type BlogPostDetail = BlogPostSummary & {
  body: PortableBlock[];
};

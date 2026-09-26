import { defineField, defineType } from "sanity";

/**
 * Blog Post schema for the Mum India PR website.
 *
 * HOW TO USE (in your separate Sanity Studio project):
 * 1. Save this file as `schemaTypes/post.ts` inside your studio folder.
 * 2. Import + add it to the `types` array in `sanity.config.ts`:
 *      import { post } from "./schemaTypes/post";
 *      schema: { types: [post] },
 * 3. Run `npm run dev` in the studio, open it, write a post and hit Publish.
 * 4. The website fetches published posts automatically — no code change needed.
 *
 * Field names (title, slug, category, excerpt, mainImage, publishedAt, body)
 * must stay exactly as-is — the website's GROQ queries depend on them.
 */
export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (page address)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      initialValue: "Insights",
      placeholder: "e.g. Digital Strategy",
    }),
    defineField({
      name: "excerpt",
      title: "Short summary (shows on cards + Google)",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "mainImage",
      title: "Cover photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Article content",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "mainImage" },
  },
});

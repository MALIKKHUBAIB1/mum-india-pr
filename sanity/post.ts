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
      name: "metaTitle",
      title: "SEO meta title",
      type: "string",
      description: "Shown in the browser tab and Google heading. Leave empty to use the normal title. Best within 60 characters.",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "SEO meta description",
      type: "text",
      rows: 2,
      description: "Shown under the heading in Google results. Leave empty to use the excerpt. Best within 155 characters.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Type a keyword and press Add.",
      options: { layout: "tags" },
    }),
    defineField({
      name: "mainImage",
      title: "Cover photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "authorName",
      title: "Writer name",
      type: "string",
      description: "Leave empty to show 'Team Mum India PR'.",
      placeholder: "Writer's full name",
    }),
    defineField({
      name: "authorRole",
      title: "Writer role",
      type: "string",
      placeholder: "e.g. Content Writer",
    }),
    defineField({
      name: "authorBio",
      title: "Writer bio (2-3 lines)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "authorImage",
      title: "Writer photo",
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
    defineField({
      name: "faqs",
      title: "FAQs (optional — accordion + Google snippet)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Question", type: "string", validation: (rule) => rule.required() },
            { name: "answer", title: "Answer", type: "text", rows: 3, validation: (rule) => rule.required() },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "mainImage" },
  },
});

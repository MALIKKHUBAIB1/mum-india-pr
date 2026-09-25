import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  loadContent,
  saveContent,
  deleteTestimonialRow,
  deleteServiceRow,
  usesSupabase,
} from "./content-store.server";
import type { ManagedService, ManagedTestimonial } from "./content-types";
import { requireAdminSession } from "./require-admin.server";
import { imageKitConfigured } from "./imagekit.server";

const urlSchema = z.string().trim().url().max(500).optional().or(z.literal(""));

const testimonialSchema = z.object({
  id: z.string().min(1).max(60),
  role: z.string().trim().min(2).max(120),
  quote: z.string().trim().min(5).max(1000),
  context: z.string().trim().max(200).optional().or(z.literal("")),
  image: urlSchema,
});

const serviceSchema = z.object({
  slug: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(200),
  region: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().min(10).max(500),
  heroHeading: z.string().trim().min(5).max(300),
  description: z.array(z.string().trim().min(5).max(2000)).min(1).max(10),
  image: urlSchema,
});

const sessionSchema = z.object({ session: z.string().min(1) });

export const getManagedContent = createServerFn({ method: "GET" }).handler(async () => {
  const db = await loadContent();
  return {
    ...db,
    storage: usesSupabase() ? ("supabase" as const) : ("file" as const),
    uploads: imageKitConfigured(),
  };
});

export const saveTestimonial = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ session: sessionSchema.shape.session, testimonial: testimonialSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdminSession(data.session);
    const db = await loadContent();
    const t = { ...data.testimonial, image: data.testimonial.image || undefined } as ManagedTestimonial;
    const idx = db.testimonials.findIndex((x) => x.id === t.id);
    if (idx >= 0) db.testimonials[idx] = t;
    else db.testimonials.push(t);
    const r = await saveContent(db);
    return { ok: true as const, ...r };
  });

export const removeTestimonial = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ session: sessionSchema.shape.session, id: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdminSession(data.session);
    const db = await loadContent();
    db.testimonials = db.testimonials.filter((x) => x.id !== data.id);
    await deleteTestimonialRow(data.id).catch(() => undefined);
    const r = await saveContent(db);
    return { ok: true as const, ...r };
  });

export const saveService = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ session: sessionSchema.shape.session, service: serviceSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdminSession(data.session);
    const db = await loadContent();
    const s = { ...data.service, image: data.service.image || undefined } as ManagedService;
    const idx = db.services.findIndex((x) => x.slug === s.slug);
    if (idx >= 0) db.services[idx] = s;
    else db.services.unshift(s);
    const r = await saveContent(db);
    return { ok: true as const, ...r };
  });

export const removeService = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ session: sessionSchema.shape.session, slug: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdminSession(data.session);
    const db = await loadContent();
    db.services = db.services.filter((x) => x.slug !== data.slug);
    await deleteServiceRow(data.slug).catch(() => undefined);
    const r = await saveContent(db);
    return { ok: true as const, ...r };
  });

import { promises as fs } from "node:fs";
import path from "node:path";
import { testimonials as defaultTestimonials } from "@/data/site";
import { services as defaultServices } from "@/data/services";
import { sbRequest, supabaseEnv, usesSupabase } from "./supabase-rest.server";
import type { ManagedService, ManagedTestimonial } from "./content-types";

export type { ManagedService, ManagedTestimonial };

type ContentDb = {
  testimonials: ManagedTestimonial[];
  services: ManagedService[];
};

const DB_FILE = path.join(process.cwd(), "content.db.json");

function seedDb(): ContentDb {
  return {
    testimonials: defaultTestimonials.map((t, i) => ({
      id: `t-${i + 1}`,
      role: t.role,
      quote: t.quote,
      context: t.context,
    })),
    services: defaultServices.map((s) => ({
      slug: s.slug,
      title: s.title,
      region: s.region,
      shortDescription: s.shortDescription,
      heroHeading: s.heroHeading,
      description: s.description,
      // NOTE: no `image` here on purpose. `image` stores ONLY custom absolute
      // https:// URLs (e.g. ImageKit). Default bundled photos resolve from code
      // by slug. Storing dev/relative paths here breaks save validation.
    })),
  };
}

/**
 * One-time cleanup: drop any non-absolute image values (e.g. `/src/assets/...`
 * written by an older backfill). Returns true if anything changed.
 */
function sanitizeImages(db: ContentDb): boolean {
  let changed = false;
  for (const s of db.services) {
    if (s.image && !/^https?:\/\//i.test(s.image)) {
      delete s.image;
      changed = true;
    }
  }
  for (const t of db.testimonials) {
    if (t.image && !/^https?:\/\//i.test(t.image)) {
      delete t.image;
      changed = true;
    }
  }
  return changed;
}

// ---------- Supabase (optional, for permanent persistence in production) ----------
// If SUPABASE_URL + SUPABASE_SERVICE_KEY are set, content is stored in Supabase
// tables `testimonials` and `services` (see supabase-schema.sql).
// Otherwise it falls back to content.db.json (works on localhost immediately;
// on Vercel/Netlify serverless the file is ephemeral, so add Supabase for prod).

async function sbFetch(table: string) {
  return sbRequest(`${table}?select=*`);
}

async function loadFromSupabase(): Promise<ContentDb | null> {
  if (!supabaseEnv()) return null;
  try {
    const [tRes, sRes] = await Promise.all([sbFetch("testimonials"), sbFetch("services")]);
    const testimonials = (await tRes.json()) as ManagedTestimonial[];
    const rawServices = (await sRes.json()) as Array<
      Omit<ManagedService, "description"> & { description: string[] | string }
    >;
    const services: ManagedService[] = rawServices.map((s) => ({
      ...s,
      description: Array.isArray(s.description) ? s.description : JSON.parse((s.description as string) || "[]"),
    }));
    if (testimonials.length === 0 && services.length === 0) return null; // not seeded yet
    sanitizeImages({ testimonials, services });
    return { testimonials, services };
  } catch (e) {
    console.error("[content-store] supabase load failed, falling back to file:", e);
    return null;
  }
}

// ---------- File fallback ----------

async function loadFromFile(): Promise<ContentDb> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ContentDb;
    if (!Array.isArray(parsed.testimonials) || !Array.isArray(parsed.services)) throw new Error("bad shape");
    if (sanitizeImages(parsed)) {
      try {
        await saveToFile(parsed);
      } catch {
        // ignore (read-only fs)
      }
    }
    return parsed;
  } catch {
    const seeded = seedDb();
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(seeded, null, 2), "utf-8");
    } catch {
      // read-only filesystem (serverless) — just serve seed in memory
    }
    return seeded;
  }
}

async function saveToFile(db: ContentDb) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function loadContent(): Promise<ContentDb> {
  const fromSb = await loadFromSupabase();
  if (fromSb) return fromSb;
  return loadFromFile();
}

export async function saveContent(db: ContentDb): Promise<{ persisted: "supabase" | "file" | "memory" }> {
  if (supabaseEnv()) {
    try {
      // Upsert all rows (small dataset, simplest correct approach)
      for (const t of db.testimonials) {
        await sbRequest("testimonials", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify(t),
        });
      }
      for (const s of db.services) {
        await sbRequest("services", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify(s),
        });
      }
      return { persisted: "supabase" };
    } catch (e) {
      console.error("[content-store] supabase save failed:", e);
    }
  }
  try {
    await saveToFile(db);
    return { persisted: "file" };
  } catch {
    return { persisted: "memory" };
  }
}

export async function deleteTestimonialRow(id: string) {
  if (supabaseEnv()) {
    await sbRequest(`testimonials?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  }
}

export async function deleteServiceRow(slug: string) {
  if (supabaseEnv()) {
    await sbRequest(`services?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE" });
  }
}

export { usesSupabase };

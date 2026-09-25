export function supabaseEnv() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_KEY"];
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function usesSupabase() {
  return Boolean(supabaseEnv());
}

/** Generic Supabase PostgREST request (service-role, server-only). */
export async function sbRequest(path: string, init?: RequestInit) {
  const env = supabaseEnv();
  if (!env) throw new Error("supabase not configured");
  const res = await fetch(`${env.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.key,
      Authorization: `Bearer ${env.key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res;
}

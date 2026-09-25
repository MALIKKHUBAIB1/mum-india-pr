import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sbRequest, supabaseEnv } from "./supabase-rest.server";

const scrypt = promisify(scryptCb);

export type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  resetHash?: string;
  resetExpires?: string; // ISO
  createdAt: string;
};

type Session = { tokenHash: string; userId: string; expiresAt: string };
type AuthDb = { users: AdminUser[]; sessions: Session[] };

const AUTH_FILE = path.join(process.cwd(), "admin-auth.json");
const SESSION_DAYS = 7;
// Stateless sessions work on read-only serverless (Vercel/Lambda) with zero I/O.
// Set SESSION_SECRET in hosting env for extra hardening; default keeps sessions
// valid across redeploys.
const SESSION_SECRET = process.env["SESSION_SECRET"] || "mum-india-admin-session-v1";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  try {
    const [, salt, hashHex] = stored.split("$");
    if (!salt || !hashHex) return false;
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hashHex, "hex");
    return hash.length === expected.length && timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

// ---------- File fallback ----------

async function loadFileDb(): Promise<AuthDb> {
  try {
    const raw = await fs.readFile(AUTH_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AuthDb;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.sessions)) throw new Error("bad shape");
    return parsed;
  } catch {
    return { users: [], sessions: [] };
  }
}

async function saveFileDb(db: AuthDb) {
  // Best-effort: serverless filesystems are read-only (EROFS) — never throw.
  try {
    await fs.writeFile(AUTH_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // ignore — Supabase (if configured) or stateless tokens cover persistence
  }
}

function prune(db: AuthDb) {
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
  for (const u of db.users) {
    if (u.resetExpires && new Date(u.resetExpires).getTime() < now) {
      delete u.resetHash;
      delete u.resetExpires;
    }
  }
}

// ---------- Supabase (optional) ----------

type SbUserRow = {
  id: string;
  email: string;
  password_hash: string;
  reset_hash: string | null;
  reset_expires: string | null;
  created_at: string;
};

function toUser(r: SbUserRow): AdminUser {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    ...(r.reset_hash ? { resetHash: r.reset_hash } : {}),
    ...(r.reset_expires ? { resetExpires: r.reset_expires } : {}),
    createdAt: r.created_at,
  };
}

async function sbListUsers(): Promise<AdminUser[] | null> {
  if (!supabaseEnv()) return null;
  try {
    const res = await sbRequest("admin_users?select=*");
    return ((await res.json()) as SbUserRow[]).map(toUser);
  } catch (e) {
    console.error("[auth-store] supabase users load failed:", e);
    return null;
  }
}

async function sbUpsertUser(u: AdminUser) {
  await sbRequest("admin_users", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: u.id,
      email: u.email,
      password_hash: u.passwordHash,
      reset_hash: u.resetHash ?? null,
      reset_expires: u.resetExpires ?? null,
      created_at: u.createdAt,
    }),
  });
}

// ---------- Public API ----------

export async function hasAnyUser() {
  const sb = await sbListUsers();
  if (sb) return sb.length > 0;
  const db = await loadFileDb();
  return db.users.length > 0;
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const norm = email.trim().toLowerCase();
  const sb = await sbListUsers();
  if (sb) return sb.find((u) => u.email === norm) ?? null;
  const db = await loadFileDb();
  return db.users.find((u) => u.email === norm) ?? null;
}

export async function createUser(email: string, password: string): Promise<AdminUser> {
  const user: AdminUser = {
    id: `u-${randomBytes(8).toString("hex")}`,
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  if (supabaseEnv()) {
    try {
      await sbUpsertUser(user);
      return user;
    } catch (e) {
      console.error("[auth-store] supabase user save failed, using file:", e);
    }
  }
  const db = await loadFileDb();
  prune(db);
  db.users.push(user);
  await saveFileDb(db);
  return user;
}

export async function updateUser(user: AdminUser) {
  if (supabaseEnv()) {
    try {
      await sbUpsertUser(user);
      return;
    } catch (e) {
      console.error("[auth-store] supabase user update failed, using file:", e);
    }
  }
  const db = await loadFileDb();
  prune(db);
  const idx = db.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) db.users[idx] = user;
  else db.users.push(user);
  await saveFileDb(db);
}

/**
 * Stateless session token (signed JWT-style). No storage needed, so login
 * works on read-only serverless filesystems. Validated purely with HMAC.
 */
export async function createSession(email: string): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + SESSION_DAYS * 864e5 }),
  ).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyStatelessSession(token: string): AdminUser | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      email?: string;
      exp?: number;
    };
    if (!data.email || typeof data.exp !== "number" || Date.now() > data.exp) return null;
    return { id: `jwt-${data.email}`, email: data.email, passwordHash: "", createdAt: "" };
  } catch {
    return null;
  }
}

export async function validateSession(token: string): Promise<AdminUser | null> {
  if (!token) return null;
  // Stateless first — works everywhere, zero I/O.
  const jwtUser = verifyStatelessSession(token);
  if (jwtUser) return jwtUser;
  // Legacy stateful sessions (Supabase / dev file). All guarded, never throws.
  try {
    const tokenHash = sha256(token);
    if (supabaseEnv()) {
      try {
        const res = await sbRequest(
          `admin_sessions?token_hash=eq.${tokenHash}&select=token_hash,user_id,expires_at`,
        );
        const rows = (await res.json()) as Array<{ token_hash: string; user_id: string; expires_at: string }>;
        const s = rows[0];
        if (!s || new Date(s.expires_at).getTime() < Date.now()) return null;
        const uRes = await sbRequest(`admin_users?id=eq.${encodeURIComponent(s.user_id)}&select=*`);
        const users = ((await uRes.json()) as SbUserRow[]).map(toUser);
        return users[0] ?? null;
      } catch (e) {
        console.error("[auth-store] supabase session check failed:", e);
        return null;
      }
    }
    const db = await loadFileDb();
    prune(db);
    const s = db.sessions.find((x) => {
      const a = Buffer.from(x.tokenHash);
      const b = Buffer.from(tokenHash);
      return a.length === b.length && timingSafeEqual(a, b);
    });
    if (!s) return null;
    return db.users.find((u) => u.id === s.userId) ?? null;
  } catch {
    return null;
  }
}

export async function destroySession(token: string) {
  // Stateless sessions can't be revoked server-side — the client discards the
  // token on logout. Best-effort cleanup of any legacy stateful session.
  try {
    const tokenHash = sha256(token);
    if (supabaseEnv()) {
      try {
        await sbRequest(`admin_sessions?token_hash=eq.${tokenHash}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    const db = await loadFileDb();
    db.sessions = db.sessions.filter((x) => x.tokenHash !== tokenHash);
    await saveFileDb(db);
  } catch {
    // ignore — logout still succeeds client-side
  }
}

export function newResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: sha256(token) };
}

/** Self-contained reset token — verifiable without any storage. */
export function newStatelessResetToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + 3600e3, purpose: "reset" }),
  ).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(`reset:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyStatelessResetToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", SESSION_SECRET).update(`reset:${payload}`).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      email?: string;
      exp?: number;
      purpose?: string;
    };
    if (data.purpose !== "reset" || !data.email || typeof data.exp !== "number" || Date.now() > data.exp) {
      return null;
    }
    return data.email;
  } catch {
    return null;
  }
}

export async function validateResetToken(token: string): Promise<AdminUser | null> {
  if (!token) return null;
  // Stateless first — works on read-only serverless.
  const email = verifyStatelessResetToken(token);
  if (email) {
    const user = await findUserByEmail(email);
    // Storage-less envs have no user row — still honor the signed token for
    // the fixed owner account so reset works everywhere.
    if (user) return user;
    return { id: `jwt-${email}`, email, passwordHash: "", createdAt: "" };
  }
  // Legacy stored-token lookup. Guarded, never throws.
  try {
    const hash = sha256(token);
    const now = Date.now();
    const match = (u: AdminUser) =>
      u.resetHash === hash && u.resetExpires && new Date(u.resetExpires).getTime() > now
        ? u
        : null;
    const sb = await sbListUsers();
    if (sb) return sb.map(match).find(Boolean) ?? null;
    const db = await loadFileDb();
    return db.users.map(match).find(Boolean) ?? null;
  } catch {
    return null;
  }
}

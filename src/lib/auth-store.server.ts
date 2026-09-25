import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
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
  await fs.writeFile(AUTH_FILE, JSON.stringify(db, null, 2), "utf-8");
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

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const session: Session = {
    tokenHash: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5).toISOString(),
  };
  if (supabaseEnv()) {
    try {
      await sbRequest("admin_sessions", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          token_hash: session.tokenHash,
          user_id: session.userId,
          expires_at: session.expiresAt,
        }),
      });
      return token;
    } catch (e) {
      console.error("[auth-store] supabase session save failed, using file:", e);
    }
  }
  const db = await loadFileDb();
  prune(db);
  db.sessions.push(session);
  try {
    await saveFileDb(db);
  } catch {
    // ephemeral fs — session lives for this instance only; still return it
  }
  return token;
}

export async function validateSession(token: string): Promise<AdminUser | null> {
  if (!token) return null;
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
}

export async function destroySession(token: string) {
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
  try {
    await saveFileDb(db);
  } catch {
    // ignore (ephemeral fs)
  }
}

export function newResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: sha256(token) };
}

export async function validateResetToken(token: string): Promise<AdminUser | null> {
  if (!token) return null;
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
}

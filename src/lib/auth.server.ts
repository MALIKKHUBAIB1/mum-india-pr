import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createSession,
  createUser,
  destroySession,
  findUserByEmail,
  hashPassword,
  newStatelessResetToken,
  updateUser,
  validateResetToken,
  validateSession,
  verifyPassword,
} from "./auth-store.server";
import { sendMail } from "./email";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters.").max(128);

// Fixed owner login — always these credentials, on every machine and deploy.
const HARDCODED_EMAIL = "mumindiaadmin@gmail.com";
const HARDCODED_PASSWORD = "admin@1234";

/** Make sure the fixed owner account exists (create-if-missing only). */
async function ensureHardcodedAdmin() {
  const existing = await findUserByEmail(HARDCODED_EMAIL);
  if (existing) return existing;
  return createUser(HARDCODED_EMAIL, HARDCODED_PASSWORD);
}

export const getAuthStatus = createServerFn({ method: "GET" }).handler(async () => {
  // Setup flow is disabled — the fixed owner account always exists.
  return { hasUsers: true as const };
});

export const setupAdmin = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ email: emailSchema, password: passwordSchema }).parse(d))
  .handler(async () => {
    throw new Error("Account creation is disabled. Log in with the admin account.");
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ email: emailSchema, password: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    // Fixed owner login — always works.
    if (data.email === HARDCODED_EMAIL && data.password === HARDCODED_PASSWORD) {
      const user = await ensureHardcodedAdmin();
      const token = await createSession(user.email);
      return { ok: true as const, token, email: user.email };
    }
    const user = await findUserByEmail(data.email);
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      throw new Error("Invalid email or password.");
    }
    const token = await createSession(user.email);
    return { ok: true as const, token, email: user.email };
  });

export const logoutAdmin = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    await destroySession(data.token);
    return { ok: true as const };
  });

export const getSessionUser = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const user = await validateSession(data.token);
    if (!user) throw new Error("Session expired. Please log in again.");
    return { ok: true as const, email: user.email };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: emailSchema, origin: z.string().url().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    // The fixed owner account uses a permanent password — there is nothing to
    // reset (and nowhere to store a new one on storage-less hosting).
    if (data.email === HARDCODED_EMAIL) {
      throw new Error("Ye admin account fixed password use karta hai, reset link nahi bheja ja sakta.");
    }
    // Always return ok for other emails to avoid leaking which exist.
    const user = await findUserByEmail(data.email);
    if (user) {
      // Self-contained token: verifiable without any storage, so it works on
      // read-only serverless too.
      const token = newStatelessResetToken(user.email);
      const origin = data.origin.replace(/\/$/, "");
      const link = `${origin}/admin/reset?token=${token}`;
      try {
        await sendMail({
          to: user.email,
          subject: "Reset your admin password — Mum India PR",
          html: `
            <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto">
              <h2 style="color:#0f172a">Reset your admin password</h2>
              <p style="color:#475569;font-size:14px">Someone requested a password reset for the Mum India PR admin panel. If this was you, click the link below (valid for 1 hour):</p>
              <p><a href="${link}" style="display:inline-block;background:#0f2a5c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Set a new password</a></p>
              <p style="color:#94a3b8;font-size:12px">Or paste this link: ${link}</p>
              <p style="color:#94a3b8;font-size:12px">If you didn't request this, ignore this email.</p>
            </div>`,
        });
      } catch (e) {
        console.error("[auth] reset email failed:", e);
        throw new Error("Could not send reset email. Check SMTP settings on the server.");
      }
    }
    return { ok: true as const };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ token: z.string().min(1), password: passwordSchema }).parse(d))
  .handler(async ({ data }) => {
    // Token identifies the user only via stored hash; scan is fine at this scale.
    const user = await validateResetToken(data.token);
    if (!user) throw new Error("This reset link is invalid or expired.");
    user.passwordHash = await hashPassword(data.password);
    delete user.resetHash;
    delete user.resetExpires;
    await updateUser(user);
    const token = await createSession(user.email);
    return { ok: true as const, token, email: user.email };
  });

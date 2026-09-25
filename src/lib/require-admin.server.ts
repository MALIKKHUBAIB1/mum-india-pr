import { validateSession } from "./auth-store.server";

/**
 * Server-only auth guard for other server functions.
 * Lives in its own module (never imported by client components) so the
 * client RPC stubs stay free of node builtins.
 */
export async function requireAdminSession(token: unknown) {
  if (typeof token !== "string" || !token) throw new Error("Not authenticated.");
  const user = await validateSession(token);
  if (!user) throw new Error("Session expired. Please log in again.");
  return user;
}

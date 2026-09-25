import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, randomBytes } from "node:crypto";
import { requireAdminSession } from "./require-admin.server";

export function imageKitConfigured() {
  return Boolean(
    process.env["IMAGEKIT_PUBLIC_KEY"] &&
      process.env["IMAGEKIT_PRIVATE_KEY"] &&
      process.env["IMAGEKIT_URL_ENDPOINT"],
  );
}

/**
 * Returns short-lived upload auth params for direct browser → ImageKit upload.
 * Private key never leaves the server.
 */
export const getImageKitAuth = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ session: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    await requireAdminSession(data.session);
    const publicKey = process.env["IMAGEKIT_PUBLIC_KEY"];
    const privateKey = process.env["IMAGEKIT_PRIVATE_KEY"];
    const urlEndpoint = (process.env["IMAGEKIT_URL_ENDPOINT"] || "").replace(/\/$/, "");
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.",
      );
    }
    const token = randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min
    const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
    return { publicKey, urlEndpoint, token, expire, signature };
  });

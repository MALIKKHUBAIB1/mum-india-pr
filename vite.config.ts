// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Nitro preset is auto-detected from the hosting env:
  // - Vercel (VERCEL=1) -> "vercel"
  // - Netlify (NETLIFY=true) -> "netlify"
  // - Cloudflare/local fallback -> "cloudflare-module"
  // Do NOT hard-pin to "netlify" or Vercel builds will output the wrong
  // format (static `dist/` with no index.html) and return 404 NOT_FOUND.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : process.env.NETLIFY ? "netlify" : undefined,
  },
});

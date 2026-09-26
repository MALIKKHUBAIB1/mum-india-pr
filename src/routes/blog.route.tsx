import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Explicit parent layout for /blog/* so the list (blog.index) and article
 * (blog.$slug) pages are true siblings — the article must NOT render inside
 * the list page. Renders only an outlet, no visible UI of its own.
 */
export const Route = createFileRoute("/blog")({
  component: () => <Outlet />,
});

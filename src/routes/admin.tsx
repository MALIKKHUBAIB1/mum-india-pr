import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  MessageSquareQuote,
  Layers,
  Images,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Upload,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Database,
  CloudUpload,
} from "lucide-react";
import { getManagedContent, saveTestimonial, removeTestimonial, saveService, removeService } from "@/lib/content.server";
import {
  loginAdmin,
  logoutAdmin,
  getSessionUser,
  requestPasswordReset,
} from "@/lib/auth.server";
import { getImageKitAuth } from "@/lib/imagekit.server";
import { uploadToImageKit, type ImageKitAuth } from "@/lib/imagekit-client";
import type { ManagedService, ManagedTestimonial } from "@/lib/content-types";
import { services as staticServices } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Mum India Strategy Research Pvt Ltd" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

const SESSION_KEY = "mum_admin_session";
const MEDIA_KEY = "mum_media_uploads";

// Bundled default photos by slug — shown as preview when a service has no custom image.
const defaultImgBySlug: Record<string, string> = Object.fromEntries(
  staticServices.map((s) => [s.slug, s.image]),
);

function effectiveServiceImage(s: ManagedService): string {
  return s.image || defaultImgBySlug[s.slug] || "";
}

/** Slug for service page URLs: lowercase English, numbers, hyphens only. */
function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidSlug(v: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

function getSession() {
  return sessionStorage.getItem(SESSION_KEY) ?? "";
}

function newId() {
  return `t-${Date.now().toString(36)}`;
}

/** Turn raw server/zod errors into something a human can act on. */
function friendlyError(err: unknown): string {
  const m = err instanceof Error ? err.message : "Save failed";
  if (m.includes("Invalid url") || m.includes("invalid_string")) {
    return "Photo must be a full https:// URL (e.g. from ImageKit). Clear the field to use the default photo.";
  }
  try {
    const parsed = JSON.parse(m) as Array<{ message?: string; path?: (string | number)[] }>;
    if (Array.isArray(parsed)) {
      return parsed
        .map((e) => `${e.path?.join(".")}: ${e.message}`)
        .join("; ")
        .slice(0, 300);
    }
  } catch {
    // not JSON — use raw message
  }
  return m.slice(0, 300);
}

type Tab = "overview" | "testimonials" | "services" | "media";

// ---------------- Recent uploads (shared between Media tab + pickers) ----------------

function readRecentUploads(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(MEDIA_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function rememberUpload(url: string): string[] {
  const next = [url, ...readRecentUploads().filter((u) => u !== url)].slice(0, 60);
  try {
    localStorage.setItem(MEDIA_KEY, JSON.stringify(next));
  } catch {
    // ignore (private mode etc.)
  }
  return next;
}

// ---------------- Image picker (ImageKit upload + URL fallback) ----------------

function ImagePicker({
  value,
  onChange,
  uploadsEnabled,
}: {
  value?: string | undefined;
  onChange: (url: string) => void;
  uploadsEnabled: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => readRecentUploads());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(readRecentUploads());
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const auth = (await getImageKitAuth({ data: { session: getSession() } })) as ImageKitAuth;
      const { url } = await uploadToImageKit(file, auth);
      onChange(url);
      setRecent(rememberUpload(url));
      toast.success("Image uploaded and applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>Photo</Label>
      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="preview" className="h-28 w-auto rounded-md border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No image selected
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {uploadsEnabled ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Upload className="mr-1 size-4" />}
              {uploading ? "Uploading…" : "Upload via ImageKit"}
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Direct upload disabled — set ImageKit keys in env, or paste a URL:
          </span>
        )}
        <Input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (leave empty for default photo)"
          className="min-w-52 flex-1"
        />
      </div>
      {recent.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Your uploads — click to use (no pasting needed):
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 12).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onChange(u)}
                title="Use this photo"
                className={`overflow-hidden rounded-md border-2 transition-all ${
                  value === u ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"
                }`}
              >
                <img src={u} alt="uploaded" loading="lazy" className="size-14 object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Main page ----------------

function AdminPage() {
  const [authView, setAuthView] = useState<"loading" | "login" | "forgot" | "app">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");
  const [storage, setStorage] = useState<"file" | "supabase">("file");
  const [uploadsEnabled, setUploadsEnabled] = useState(false);
  const [testimonials, setTestimonials] = useState<ManagedTestimonial[]>([]);
  const [services, setServices] = useState<ManagedService[]>([]);

  const [editingT, setEditingT] = useState<ManagedTestimonial | null>(null);
  const [editingS, setEditingS] = useState<ManagedService | null>(null);
  const [sMode, setSMode] = useState<"add" | "edit">("edit");
  const [tOpen, setTOpen] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    const data = await getManagedContent();
    setTestimonials(data.testimonials);
    setServices(data.services);
    setStorage(data.storage);
    setUploadsEnabled(data.uploads);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadContent();
      } catch {
        // ignore
      }
      const token = getSession();
      if (token) {
        try {
          const me = await getSessionUser({ data: { token } });
          setUserEmail(me.email);
          setAuthView("app");
          return;
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      setAuthView("login");
    })();
  }, [loadContent]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await loginAdmin({ data: { email, password } });
      sessionStorage.setItem(SESSION_KEY, r.token);
      setUserEmail(r.email);
      setPassword("");
      setAuthView("app");
      toast.success("Welcome back");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await requestPasswordReset({ data: { email, origin: window.location.origin } });
      toast.success("If the email exists, a reset link was sent.");
      setAuthView("login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const token = getSession();
    if (token) {
      try {
        await logoutAdmin({ data: { token } });
      } catch {
        // ignore
      }
    }
    sessionStorage.removeItem(SESSION_KEY);
    setUserEmail("");
    setPassword("");
    setAuthView("login");
  }

  async function refresh() {
    await loadContent().catch((err) => toast.error(err instanceof Error ? err.message : "Reload failed"));
  }

  async function handleSaveTestimonial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingT) return;
    setBusy(true);
    try {
      const r = await saveTestimonial({ data: { session: getSession(), testimonial: editingT } });
      if (r.persisted === "memory") toast.warning("Saved in memory only — add Supabase for persistence.");
      else toast.success("Testimonial saved");
      setTOpen(false);
      setEditingT(null);
      await refresh();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTestimonial(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await removeTestimonial({ data: { session: getSession(), id } });
      toast.success("Deleted");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleSaveService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingS) return;
    if (sMode === "add") {
      if (!isValidSlug(editingS.slug)) {
        toast.error("Slug me sirf a-z, 0-9 aur - chalega, e.g. lucknow-rajniti");
        return;
      }
      if (services.some((s) => s.slug === editingS.slug)) {
        toast.error("Ye slug already use me hai — kuch aur rakho.");
        return;
      }
    }
    setBusy(true);
    try {
      await saveService({ data: { session: getSession(), service: editingS } });
      toast.success("Service saved");
      setSOpen(false);
      setEditingS(null);
      await refresh();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteService(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?\n\nIska page /services/${slug} hamesha ke liye hat jayega.`)) return;
    try {
      await removeService({ data: { session: getSession(), slug } });
      toast.success("Service deleted");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(url);
        setTimeout(() => setCopied(null), 1500);
      },
      () => toast.error("Copy failed"),
    );
  }

  // ---------- Auth screens ----------

  if (authView === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authView !== "app") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-[#0b2447] font-extrabold text-white">
              M
            </div>
            <CardTitle>{authView === "forgot" ? "Forgot password" : "Admin login"}</CardTitle>
            <CardDescription>
              {authView === "forgot"
                ? "Enter your admin email and we'll send a reset link."
                : "Sign in with your admin email and password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authView === "forgot" ? (
              <form onSubmit={handleForgot} className="space-y-3">
                <div>
                  <Label htmlFor="f-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="f-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
                <button type="button" onClick={() => setAuthView("login")} className="w-full text-center text-sm text-muted-foreground hover:underline">
                  Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <Label htmlFor="a-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="a-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="mumindiaadmin@gmail.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="a-pass">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="a-pass" type={showPass ? "text" : "password"} required minLength={1} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" placeholder="••••••••" />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : "Log in"}
                </Button>
                <button type="button" onClick={() => setAuthView("forgot")} className="w-full text-center text-sm font-medium text-blue-700 hover:underline">
                  Forgot password?
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Dashboard ----------

  const mediaUrls: string[] = [
    ...services.map((s) => effectiveServiceImage(s)).filter(Boolean),
    ...testimonials.map((t) => t.image).filter((x): x is string => Boolean(x)),
  ];

  const nav: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard; count?: number }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote, count: testimonials.length },
    { id: "services", label: "Services", icon: Layers, count: services.length },
    { id: "media", label: "Media", icon: Images, count: mediaUrls.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl gap-0 px-0 py-0 md:gap-6 md:px-6 md:py-6">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#0b2447] p-5 text-white md:flex md:h-[calc(100vh-3rem)] md:rounded-2xl">
          <div className="flex items-center gap-3 px-1">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500 font-extrabold">M</span>
            <div>
              <p className="font-bold leading-tight">MUM India PR</p>
              <p className="text-xs text-white/60">Content Admin</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === n.id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <n.icon className="size-4" />
                {n.label}
                {typeof n.count === "number" && (
                  <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-xs">{n.count}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <Database className="size-3.5" />
              Storage: <span className="font-bold">{storage}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <CloudUpload className="size-3.5" />
              Uploads: <span className="font-bold">{uploadsEnabled ? "ImageKit" : "off"}</span>
            </div>
            <div className="truncate rounded-lg bg-white/10 px-3 py-2" title={userEmail}>{userEmail}</div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-1 size-4" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-0">
          {/* Mobile nav */}
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
                  tab === n.id ? "bg-[#0b2447] text-white" : "bg-white text-slate-700"
                }`}
              >
                <n.icon className="size-4" /> {n.label}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {tab === "overview" && "Dashboard"}
                {tab === "testimonials" && "Testimonials"}
                {tab === "services" && "Services"}
                {tab === "media" && "Media library"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tab === "overview" && `Welcome, ${userEmail}`}
                {tab === "testimonials" && "Client feedback shown on the site."}
                {tab === "services" && "Regional service pages (text + cover image)."}
                {tab === "media" && "Upload images with ImageKit and reuse the URLs."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank" rel="noreferrer"><ExternalLink className="mr-1 size-4" /> View site</a>
              </Button>
              <Button variant="outline" size="sm" className="md:hidden" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>

          {!uploadsEnabled && (
            <Card className="mb-6 border-amber-300 bg-amber-50">
              <CardContent className="pt-4 text-sm text-amber-900">
                <strong>Image uploads are off.</strong> Add <code>IMAGEKIT_PUBLIC_KEY</code>,{" "}
                <code>IMAGEKIT_PRIVATE_KEY</code> and <code>IMAGEKIT_URL_ENDPOINT</code> (free at imagekit.io) to enable
                direct uploads. You can still paste image URLs manually.
              </CardContent>
            </Card>
          )}

          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Testimonials</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold">{testimonials.length}</p>
                  <Button size="sm" className="mt-3" onClick={() => setTab("testimonials")}>Manage</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Services</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold">{services.length}</p>
                  <Button size="sm" className="mt-3" onClick={() => setTab("services")}>Manage</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Images in use</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold">{mediaUrls.length}</p>
                  <Button size="sm" className="mt-3" onClick={() => setTab("media")}>Library</Button>
                </CardContent>
              </Card>
              <Card className="sm:col-span-3">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Publishing</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {storage === "file" ? (
                    <>Edits save to the site database file. For permanent production storage add Supabase keys (see .env.example).</>
                  ) : (
                    <><CheckCircle2 className="size-4 text-green-600" /> Connected to Supabase — edits persist permanently.</>
                  )}
                  <Button size="sm" variant="outline" onClick={refresh}>Refresh data</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "testimonials" && (
            <div className="space-y-4">
              <Dialog open={tOpen} onOpenChange={setTOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingT({ id: newId(), role: "", quote: "", context: "", image: "" })}>
                    <Plus className="mr-1 size-4" /> Add testimonial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{testimonials.some((t) => t.id === editingT?.id) ? "Edit" : "Add"} testimonial</DialogTitle></DialogHeader>
                  {editingT && (
                    <form onSubmit={handleSaveTestimonial} className="space-y-3">
                      <div><Label>Name / Role</Label><Input value={editingT.role} onChange={(e) => setEditingT({ ...editingT, role: e.target.value })} required /></div>
                      <div><Label>Quote</Label><Textarea value={editingT.quote} onChange={(e) => setEditingT({ ...editingT, quote: e.target.value })} required rows={4} /></div>
                      <div><Label>Context (optional)</Label><Input value={editingT.context ?? ""} onChange={(e) => setEditingT({ ...editingT, context: e.target.value })} /></div>
                      <ImagePicker value={editingT.image} onChange={(url) => setEditingT({ ...editingT, image: url })} uploadsEnabled={uploadsEnabled} />
                      <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Save testimonial"}</Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 lg:grid-cols-2">
                {testimonials.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="flex gap-4 pt-5">
                      {t.image ? (
                        <img src={t.image} alt={t.role} className="size-14 shrink-0 rounded-full border object-cover" />
                      ) : (
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-500">
                          {t.role.charAt(0) || "?"}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{t.role}</p>
                        <p className="truncate text-sm text-muted-foreground">“{t.quote}”</p>
                        {t.context && <p className="text-xs text-muted-foreground">{t.context}</p>}
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingT({ ...t }); setTOpen(true); }}>
                            <Pencil className="mr-1 size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTestimonial(t.id)}>
                            <Trash2 className="mr-1 size-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "services" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">Slug = page ka address. Banne ke baad change nahi hoga.</p>
                <Button
                  onClick={() => {
                    setEditingS({ slug: "", title: "", region: "", shortDescription: "", heroHeading: "", description: [], image: "" });
                    setSMode("add");
                    setSOpen(true);
                  }}
                >
                  <Plus className="mr-1 size-4" /> Add service
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {services.map((s) => {
                  const preview = effectiveServiceImage(s);
                  return (
                    <Card key={s.slug} className="overflow-hidden">
                      {preview ? (
                        <div className="relative">
                          <img src={preview} alt={s.title} className="h-36 w-full object-cover" loading="lazy" />
                          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                            {s.image ? "Custom photo" : "Default photo"}
                          </span>
                        </div>
                      ) : null}
                      <CardContent className="space-y-1 pt-4">
                      <Badge variant="secondary" className="font-mono text-[11px]">{s.slug}</Badge>
                      <p className="font-semibold">{s.title} — {s.region}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{s.shortDescription}</p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingS({ ...s, description: [...s.description] }); setSMode("edit"); setSOpen(true); }}>
                          <Pencil className="mr-1 size-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteService(s.slug, s.title)}>
                          <Trash2 className="mr-1 size-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

              <Dialog open={sOpen} onOpenChange={setSOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{sMode === "add" ? "Add service" : "Edit service"}</DialogTitle>
                  </DialogHeader>
                  {editingS && (
                    <form onSubmit={handleSaveService} className="space-y-3">
                      {sMode === "add" && (
                        <div>
                          <Label>URL slug (English me, baad me change nahi hoga)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={editingS.slug}
                              onChange={(e) => setEditingS({ ...editingS, slug: slugify(e.target.value) })}
                              placeholder="e.g. lucknow-rajniti"
                              required
                              className="font-mono"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingS({ ...editingS, slug: slugify(editingS.title) })}
                            >
                              Auto
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Page banega: /services/{editingS.slug || "…"}
                          </p>
                        </div>
                      )}
                      <div><Label>Title</Label><Input value={editingS.title} onChange={(e) => setEditingS({ ...editingS, title: e.target.value })} required /></div>
                      <div><Label>Region</Label><Input value={editingS.region} onChange={(e) => setEditingS({ ...editingS, region: e.target.value })} required /></div>
                      <div><Label>Short description</Label><Textarea value={editingS.shortDescription} onChange={(e) => setEditingS({ ...editingS, shortDescription: e.target.value })} required rows={2} /></div>
                      <div><Label>Hero heading</Label><Input value={editingS.heroHeading} onChange={(e) => setEditingS({ ...editingS, heroHeading: e.target.value })} required /></div>
                      <div>
                        <Label>Description paragraphs (one per line gap)</Label>
                        <Textarea
                          value={editingS.description.join("\n\n")}
                          onChange={(e) => setEditingS({ ...editingS, description: e.target.value.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) })}
                          rows={6}
                          required
                        />
                      </div>
                      <div>
                        <Label>Cover photo preview (as visitors see it)</Label>
                        {(() => {
                          const preview = effectiveServiceImage(editingS);
                          return preview ? (
                            <div className="relative mt-1">
                              <img src={preview} alt={editingS.title} className="h-44 w-full rounded-md border object-cover" />
                              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                                {editingS.image ? "Custom photo" : "Default photo"}
                              </span>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">No photo</p>
                          );
                        })()}
                      </div>
                      <ImagePicker value={editingS.image} onChange={(url) => setEditingS({ ...editingS, image: url })} uploadsEnabled={uploadsEnabled} />
                      <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Save service"}</Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {tab === "media" && (
            <MediaTab uploadsEnabled={uploadsEnabled} urls={mediaUrls} onCopy={copyUrl} copied={copied} />
          )}
        </main>
      </div>
    </div>
  );
}

function MediaTab({
  uploadsEnabled,
  urls,
  onCopy,
  copied,
}: {
  uploadsEnabled: boolean;
  urls: string[];
  onCopy: (url: string) => void;
  copied: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(readRecentUploads());
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const auth = (await getImageKitAuth({ data: { session: getSession() } })) as ImageKitAuth;
      const { url } = await uploadToImageKit(file, auth);
      setRecent(rememberUpload(url));
      toast.success("Uploaded — now open any service/testimonial and click its thumbnail to use it");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload new image</CardTitle></CardHeader>
        <CardContent>
          {uploadsEnabled ? (
            <div className="flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Upload className="mr-1 size-4" />}
                {uploading ? "Uploading…" : "Choose & upload"}
              </Button>
              <span className="text-xs text-muted-foreground">Images go to your ImageKit /mum-india folder.</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Set ImageKit env keys to enable uploads.</p>
          )}
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent uploads</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((u) => (
              <UrlCard key={u} url={u} copied={copied} onCopy={onCopy} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Images in use ({urls.length})</h3>
        {urls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {urls.map((u) => (
              <UrlCard key={u} url={u} copied={copied} onCopy={onCopy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UrlCard({ url, copied, onCopy }: { url: string; copied: string | null; onCopy: (u: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <img src={url} alt="media" className="h-28 w-full object-cover" loading="lazy" />
      <button
        onClick={() => onCopy(url)}
        className="flex w-full items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        {copied === url ? <CheckCircle2 className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
        {copied === url ? "Copied!" : "Copy URL"}
      </button>
    </div>
  );
}

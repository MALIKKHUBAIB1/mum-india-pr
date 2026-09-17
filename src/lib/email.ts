import nodemailer from "nodemailer";

function getSmtpConfig() {
  // Nitro loads .env from project root; src/.env is kept for backward compat but root .env is authoritative.
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, ""); // Gmail app password has spaces for readability

  if (!host || !port || !user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env or hosting env vars (Vercel/Netlify dashboard).",
    );
  }
  return { host, port, user, pass };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, user, pass } = getSmtpConfig();
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const { user } = getSmtpConfig();
  const t = getTransporter();
  // verify quickly in dev to surface auth errors early
  // await t.verify(); // optional, skip for speed
  const info = await t.sendMail({
    from: `"Mum India Strategy Research Pvt Ltd" <${user}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });
  return info;
}

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatInquiryHtml(data: Record<string, string>, type: "contact" | "consultation") {
  const title = type === "contact" ? "New Contact Inquiry" : "New Consultation Request";
  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f8fafc;text-transform:capitalize">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(v || "-")}</td></tr>`,
    )
    .join("");
  return `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#0f172a">${title} — Mum India Strategy Research Pvt Ltd</h2>
      <p style="color:#475569;font-size:14px">Received via website form. Reply directly to the sender's email.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px">${rows}</table>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">Sent from ${esc(type)} form • ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
    </div>
  `;
}

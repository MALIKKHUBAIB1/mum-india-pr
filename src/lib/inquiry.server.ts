import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendMail, formatInquiryHtml } from "./email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  mobile: z.string().trim().regex(/^[0-9+\s-]{8,15}$/),
  email: z.string().trim().email().max(255),
  city: z.string().trim().min(2).max(120),
  service: z.string().trim().min(1),
  message: z.string().trim().min(5).max(1000),
});

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  mobile: z.string().trim().regex(/^[0-9+\s-]{8,15}$/),
  email: z.string().trim().email().max(255),
  city: z.string().trim().min(2).max(120),
  position: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().trim().min(1),
  packageName: z.string().trim().min(1),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

function getRecipient() {
  // Send to the SMTP user itself (Info@mumindiapr.com) by default; override via SMTP_TO if needed
  return process.env.SMTP_TO || process.env.SMTP_USER || "Info@mumindiapr.com";
}

export const sendContactInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const to = getRecipient();
    const html = formatInquiryHtml(data as Record<string, string>, "contact");
    await sendMail({
      to,
      subject: `New Inquiry: ${data.name} — ${data.service} (${data.city})`,
      html,
      replyTo: data.email,
    });
    return { ok: true };
  });

export const sendConsultationRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const to = getRecipient();
    const html = formatInquiryHtml(data as Record<string, string>, "consultation");
    await sendMail({
      to,
      subject: `Consultation: ${data.name} — ${data.packageName} / ${data.service} (${data.city})`,
      html,
      replyTo: data.email,
    });
    return { ok: true };
  });

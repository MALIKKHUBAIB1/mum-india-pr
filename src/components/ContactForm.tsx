import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { interestedServices } from "@/data/site";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, "Please enter a valid mobile number"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  city: z.string().trim().min(2, "Please enter your city").max(120),
  service: z.string().trim().min(1, "Please select a service"),
  message: z.string().trim().min(5, "Please add a short message").max(1000),
});

type Fields = z.infer<typeof contactSchema>;
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", mobile: "", email: "", city: "", service: "", message: "" };

const fieldClass =
  "h-11 rounded-md border-input bg-background focus-visible:ring-accent focus-visible:ring-2";

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [values, setValues] = useState<Fields>({ ...empty, service: defaultService ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Fields, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Fields] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setValues({ ...empty, service: defaultService ?? "" });
      toast.success("Inquiry sent. Our team will get back to you soon.");
    }, 600);
  };

  const Error = ({ name }: { name: keyof Fields }) =>
    errors[name] ? <p className="mt-1 text-xs font-medium text-destructive">{errors[name]}</p> : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Full Name</Label>
          <Input id="c-name" className={fieldClass} value={values.name} maxLength={100} onChange={(e) => set("name", e.target.value)} />
          <Error name="name" />
        </div>
        <div>
          <Label htmlFor="c-mobile">Mobile</Label>
          <Input id="c-mobile" type="tel" className={fieldClass} value={values.mobile} maxLength={15} onChange={(e) => set("mobile", e.target.value)} />
          <Error name="mobile" />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" className={fieldClass} value={values.email} maxLength={255} onChange={(e) => set("email", e.target.value)} />
          <Error name="email" />
        </div>
        <div>
          <Label htmlFor="c-city">City</Label>
          <Input id="c-city" className={fieldClass} value={values.city} maxLength={120} onChange={(e) => set("city", e.target.value)} />
          <Error name="city" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="c-service">Service</Label>
          <select
            id="c-service"
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            value={values.service}
            onChange={(e) => set("service", e.target.value)}
          >
            <option value="">Select a service</option>
            {interestedServices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Error name="service" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="c-message">Message</Label>
          <Textarea
            id="c-message"
            rows={5}
            className="rounded-md focus-visible:ring-2 focus-visible:ring-accent"
            value={values.message}
            maxLength={1000}
            onChange={(e) => set("message", e.target.value)}
          />
          <Error name="message" />
        </div>
      </div>

      <Button type="submit" variant="accent" size="lg" className="mt-7 w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Sending…" : "Send Inquiry"}
      </Button>
    </form>
  );
}

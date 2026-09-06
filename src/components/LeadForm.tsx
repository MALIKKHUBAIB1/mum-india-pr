import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { interestedServices, packageOptions } from "@/data/site";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, "Please enter a valid mobile number"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  city: z.string().trim().min(2, "Please enter your city or constituency").max(120),
  position: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().trim().min(1, "Please select a service"),
  packageName: z.string().trim().min(1, "Please select a package"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type LeadFields = z.infer<typeof leadSchema>;
type Errors = Partial<Record<keyof LeadFields, string>>;

const empty: LeadFields = {
  name: "",
  mobile: "",
  email: "",
  city: "",
  position: "",
  service: "",
  packageName: "",
  message: "",
};

const fieldClass =
  "h-11 rounded-md border-input bg-background focus-visible:ring-accent focus-visible:ring-2";

const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function LeadForm({ defaultPackage }: { defaultPackage?: string }) {
  const [values, setValues] = useState<LeadFields>({
    ...empty,
    packageName: defaultPackage ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof LeadFields, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof LeadFields] = issue.message;
      }
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    // Submission endpoint can be connected later.
    window.setTimeout(() => {
      setSubmitting(false);
      setValues({ ...empty, packageName: defaultPackage ?? "" });
      toast.success("Thank you. Our team will contact you shortly.");
    }, 600);
  };

  const Error = ({ name }: { name: keyof LeadFields }) =>
    errors[name] ? <p className="mt-1 text-xs font-medium text-destructive">{errors[name]}</p> : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="lead-name">Full Name</Label>
          <Input
            id="lead-name"
            className={fieldClass}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={100}
          />
          <Error name="name" />
        </div>
        <div>
          <Label htmlFor="lead-mobile">Mobile Number</Label>
          <Input
            id="lead-mobile"
            type="tel"
            className={fieldClass}
            value={values.mobile}
            onChange={(e) => set("mobile", e.target.value)}
            maxLength={15}
          />
          <Error name="mobile" />
        </div>
        <div>
          <Label htmlFor="lead-email">Email</Label>
          <Input
            id="lead-email"
            type="email"
            className={fieldClass}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            maxLength={255}
          />
          <Error name="email" />
        </div>
        <div>
          <Label htmlFor="lead-city">City / Constituency</Label>
          <Input
            id="lead-city"
            className={fieldClass}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            maxLength={120}
          />
          <Error name="city" />
        </div>
        <div>
          <Label htmlFor="lead-position">Political Position</Label>
          <Input
            id="lead-position"
            className={fieldClass}
            placeholder="e.g. Candidate, Representative, Party Worker"
            value={values.position}
            onChange={(e) => set("position", e.target.value)}
            maxLength={120}
          />
          <Error name="position" />
        </div>
        <div>
          <Label htmlFor="lead-service">Interested Service</Label>
          <select
            id="lead-service"
            className={selectClass}
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
          <Label htmlFor="lead-package">Interested Package</Label>
          <select
            id="lead-package"
            className={selectClass}
            value={values.packageName}
            onChange={(e) => set("packageName", e.target.value)}
          >
            <option value="">Select a package</option>
            {packageOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Error name="packageName" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="lead-message">Message</Label>
          <Textarea
            id="lead-message"
            rows={4}
            className="rounded-md focus-visible:ring-2 focus-visible:ring-accent"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            maxLength={1000}
          />
          <Error name="message" />
        </div>
      </div>

      <Button type="submit" variant="accent" size="lg" className="mt-7 w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Sending…" : "Request Consultation"}
      </Button>
    </form>
  );
}

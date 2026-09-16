import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "@/data/services";

type Message = { from: "bot" | "user"; text: string; hindi?: boolean };

const quickActions = [
  "Explore Services",
  "Promotion Plans",
  "Pricing",
  "Talk to Our Team",
  "Contact Us",
] as const;

/**
 * UI-only assistant. Replace `replyFor` with an API call to connect a real backend.
 */
function replyFor(action: string): Message {
  switch (action) {
    case "Explore Services":
      return {
        from: "bot",
        hindi: true,
        text: `हमारी क्षेत्रीय सेवाएं: ${services
          .slice(0, 4)
          .map((s) => s.title)
          .join(" • ")} — और भी उपलब्ध हैं।`,
      };
    case "Promotion Plans":
      return {
        from: "bot",
        text: "We offer Starter, Growth and Authority promotion plans. Open the Promotion page for details or contact us for pricing.",
      };
    case "Pricing":
      return {
        from: "bot",
        text: "Contact us for detailed pricing — it depends on region, scope and campaign duration.",
      };
    case "Talk to Our Team":
      return {
        from: "bot",
        text: "Sure — share your name, region and requirement on the contact page and our team will reach out.",
      };
    default:
      return {
        from: "bot",
        text: "You can reach us through the contact page, WhatsApp or phone. We usually respond the same working day.",
      };
  }
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! How can we help you?" },
  ]);

  const send = (text: string) => {
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "user", text: trimmed }, replyFor(trimmed)]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between bg-navy-deep px-4 py-3">
            <div>
              <p className="text-sm font-bold text-primary-foreground">Mum India Strategy Research Pvt Ltd</p>
              <p className="text-xs text-primary-foreground/60">Typically replies during work hours</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
            {messages.map((m, i) => (
              <div
                key={`${m.text}-${i}`}
                className={
                  m.from === "bot"
                    ? "max-w-[85%] rounded-lg rounded-tl-none border border-border bg-card px-3.5 py-2.5 text-sm text-foreground"
                    : "ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-navy px-3.5 py-2.5 text-sm text-primary-foreground"
                }
              >
                <span className={m.hindi ? "hindi" : undefined}>{m.text}</span>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {quickActions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => send(a)}
                  className="cursor-pointer rounded-full border border-accent/40 bg-saffron-soft px-3 py-1.5 text-xs font-semibold text-saffron-deep transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Type your message…"
              aria-label="Message"
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <Button type="submit" variant="accent" size="icon" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>

          <div className="border-t border-border bg-card px-3 pb-3">
            <Button asChild variant="green" size="sm" className="w-full">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Request Consultation
              </Link>
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-accent)] transition-transform hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>
    </div>
  );
}

import { useState } from "react";
import { Send, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { api, HttpError } from "../lib/api";
import { useUIStore } from "../stores/uiStore";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I create a group?",
    a: "Open your dashboard and click the “New Group” button in the sidebar. Name it after a person, project, or category — for example “Priya” or “Kitchen renovation” — and start adding tasks.",
  },
  {
    q: "Can I use templates for subtasks?",
    a: "Yes. When you apply a template to a group, it creates one main task and populates its subtasks exactly from the template. You can then edit or add to the subtasks freely afterward.",
  },
  {
    q: "How does undo work?",
    a: "Most content actions on the dashboard (editing, reordering, completing) push a snapshot onto your history stack. Use the Undo/Redo toolbar buttons to walk backward and forward without losing work.",
  },
  {
    q: "Is my data saved automatically?",
    a: "SimplLife talks to the server on every meaningful change — edits, adds, completes. The in-memory backend demo doesn't persist across restarts, while the Postgres-backed production setup stores everything durably.",
  },
  {
    q: "Can I have multiple groups?",
    a: "Absolutely. Create as many groups as you need and rename them whenever. Each group keeps its own active tasks and completed section, so nothing bleeds across.",
  },
];

export function ContactPage() {
  const toast = useUIStore((s) => s.toast);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setSuccess(null);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Please enter a valid email.";
    if (form.subject.trim().length < 2) e.subject = "Please add a subject.";
    if (form.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api.contact(form);
      setSuccess(res.message);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ kind: "success", message: res.message });
    } catch (err) {
      const h = err as HttpError;
      const msg =
        (h.issues && h.issues[0]) ||
        h.message ||
        "Something went wrong sending your message. Try again.";
      toast({ kind: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="container pt-14 lg:pt-20 pb-12">
        <div className="chip">Support & Contact</div>
        <h1 className="mt-5 text-4xl md:text-5xl text-balance max-w-3xl">
          Get in touch.
        </h1>
        <p className="mt-5 text-lg text-text-muted max-w-2xl">
          Have a feature request, a bug to report, or a question about how SimplLife
          fits your workflow? Send a message — we answer every one.
        </p>
      </section>

      <section className="container pb-20 grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <form
            onSubmit={onSubmit}
            className="card space-y-5"
            noValidate
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field
                label="Name"
                htmlFor="name"
                error={errors.name}
                input={
                  <input
                    id="name"
                    className="input"
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                }
              />
              <Field
                label="Email"
                htmlFor="email"
                error={errors.email}
                input={
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                }
              />
            </div>
            <Field
              label="Subject"
              htmlFor="subject"
              error={errors.subject}
              input={
                <input
                  id="subject"
                  className="input"
                  type="text"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="How can we help?"
                />
              }
            />
            <Field
              label="Message"
              htmlFor="message"
              error={errors.message}
              input={
                <textarea
                  id="message"
                  className="textarea min-h-[140px] resize-y"
                  rows={5}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us what you need in a little detail…"
                />
              }
            />
            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border p-4"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 16%, transparent)",
                  borderColor: "var(--color-border-subtle)",
                }}
              >
                <CheckCircle2 size={20} style={{ color: "var(--color-primary)" }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--color-text-strong)" }}>
                    Message received
                  </div>
                  <div className="text-sm text-text-muted mt-0.5">{success}</div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs text-text-muted">
                We'll never share your email. Replies within 1-2 business days.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-3"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Send message
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div
            className="rounded-3xl border p-6 sticky top-24"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border-subtle)",
            }}
          >
            <h3 className="text-2xl" style={{ color: "var(--color-text-strong)" }}>
              Frequently asked
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Quick answers to the most common questions.
            </p>
            <div className="mt-6 divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
              {FAQS.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 py-4 text-left"
                      aria-expanded={open}
                    >
                      <span
                        className="text-sm md:text-base font-semibold"
                        style={{ color: "var(--color-text-strong)" }}
                      >
                        {f.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={
                          "shrink-0 transition-transform duration-200 text-text-muted " +
                          (open ? "rotate-180" : "")
                        }
                      />
                    </button>
                    <div
                      className={
                        "grid overflow-hidden transition-[grid-template-rows] duration-200 " +
                        (open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                      }
                    >
                      <div className="min-h-0">
                        <p className="pb-5 text-sm text-text-muted leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  input,
  error,
}: {
  label: string;
  htmlFor: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="text-sm font-medium mb-1.5" style={{ color: "var(--color-text-strong)" }}>
        {label}
      </div>
      {input}
      {error && (
        <div className="text-xs mt-1.5" style={{ color: "#c9472e" }}>
          {error}
        </div>
      )}
    </label>
  );
}

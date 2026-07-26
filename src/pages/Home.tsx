import { Link } from "react-router-dom";
import { Users, GitBranch, LayoutGrid, ArrowRight, CheckCircle2 } from "lucide-react";

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="container pt-14 lg:pt-20 pb-16 lg:pb-24 relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-32 h-80 w-80 rounded-full blur-3xl opacity-50"
          style={{ background: "color-mix(in srgb, var(--color-primary) 38%, transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 -right-20 h-72 w-72 rounded-full blur-3xl opacity-40"
          style={{ background: "color-mix(in srgb, var(--color-secondary) 28%, transparent)" }}
        />
        <div className="grid lg:grid-cols-12 gap-10 items-center relative">
          <div className="lg:col-span-7 stagger">
            <div className="chip fade-in-up inline-flex">
              <CheckCircle2 size={14} />
              Organise by people, not just projects
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-balance fade-in-up">
              Your tasks. Your people.{" "}
              <span style={{ color: "var(--color-primary)" }}>One place.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-text-muted max-w-xl fade-in-up">
              Organise work by person, track progress cleanly, and never lose a
              completed task — with subtasks, templates, and undo, all wrapped in
              a calm, themable interface.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 fade-in-up">
              <Link to="/dashboard" className="btn-primary px-6 py-3 text-base">
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link to="/templates" className="btn-secondary px-6 py-3 text-base">
                See Templates
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md fade-in-up">
              <Stat value="10+" label="Built-in templates" />
              <Stat value="∞" label="Groups & tasks" />
              <Stat value="24/7" label="Light & dark" />
            </div>
          </div>
          <div className="lg:col-span-5 fade-in-up">
            <HeroMockup />
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-20">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to stay on top of it"
          description="SimplLife combines a people-first structure with the tiny details that make task tracking stick."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          <FeatureCard
            icon={<Users size={22} />}
            title="Group by people"
            desc="Create groups for every person or category you track — Harsha, Shopping, Client X — and see progress at a glance."
          />
          <FeatureCard
            icon={<GitBranch size={22} />}
            title="Tasks with subtasks"
            desc="Every main task can have nested subtasks, optional descriptions, and inline editing for ultra-fast updates."
          />
          <FeatureCard
            icon={<LayoutGrid size={22} />}
            title="Templates for any workflow"
            desc="From Study Sessions to Bug Fixes — 10 pre-built templates inject a ready-made structure in one click."
          />
        </div>
      </section>

      <section className="container py-16 lg:py-20">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps from chaos → clarity"
          description="No onboarding wizard, no configuration. Just start grouping."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6 relative stagger">
          <ConnectorLine />
          <StepCard n={1} title="Create a group with a name." body="Name a group after a person, project, or category. Create as many as you like." />
          <StepCard n={2} title="Add tasks and subtasks." body="Add main tasks, then fill in with optional descriptions and nested subtasks. Or apply a template." />
          <StepCard n={3} title="Check off and see what's done." body="Completed tasks move to a dedicated section — always restorable, never lost." />
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-14 md:py-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 72%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 88%, transparent) 100%)",
            color: "#FFFFFF",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white text-balance">
              Ready to get organised?
            </h2>
            <p className="mt-4 md:text-lg text-white/80 max-w-xl mx-auto">
              Sign in to your dashboard, create a group, and see how much cleaner
              your week looks when it's nested under real names.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 btn-white inline-flex rounded-xl px-7 py-3 text-base font-semibold items-center gap-2 shadow-lg"
              style={{ background: "var(--color-white, #FFFFFF)", color: "var(--color-venice-blue, #16587B)" }}
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div
        className="font-display text-2xl md:text-3xl font-bold"
        style={{ color: "var(--color-text-strong)" }}
      >
        {value}
      </div>
      <div className="text-xs md:text-sm text-text-muted mt-1">{label}</div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div
        className="chip text-xs uppercase tracking-wider"
        style={{ letterSpacing: "0.1em" }}
      >
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl md:text-4xl text-balance" style={{ color: "var(--color-text-strong)" }}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-text-muted">{description}</p>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card card-hover fade-in-up">
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          color: "var(--color-text-strong)",
        }}
      >
        {icon}
      </div>
      <h3 className="text-xl mb-2" style={{ color: "var(--color-text-strong)" }}>
        {title}
      </h3>
      <p className="text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function ConnectorLine() {
  return (
    <div
      aria-hidden
      className="hidden md:block absolute left-0 right-0 top-10 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--color-border-subtle) 12%, var(--color-border-subtle) 88%, transparent)",
      }}
    />
  );
}

function StepCard({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="card fade-in-up relative">
      <div
        className="absolute -top-7 left-6 h-14 w-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold shadow-md"
        style={{
          background: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        {n}
      </div>
      <div className="pt-6">
        <h3 className="text-lg md:text-xl mb-2" style={{ color: "var(--color-text-strong)" }}>
          {title}
        </h3>
        <p className="text-text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div
      className="rounded-3xl border p-4 md:p-5 shadow-2xl rotate-1"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div
          className="ml-2 text-xs text-text-muted font-medium tracking-wide"
        >
          simpllife.app / dashboard
        </div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "var(--color-page)" }}>
        <div className="flex items-center justify-between">
          <div
            className="font-display font-bold text-base"
            style={{ color: "var(--color-text-strong)" }}
          >
            Priya — Onboarding
          </div>
          <span className="chip">4 tasks</span>
        </div>
        <div className="mt-3 space-y-2.5">
          <MockTask title="Send welcome pack" subs={["PDF", "Welcome video"]} />
          <MockTask title="Schedule 1:1 check-in" completed subs={["Calendar link"]} />
          <MockTask title="Share team docs" subs={["Notion", "Handbook"]} />
          <MockTask title="Pair up with buddy" />
        </div>
      </div>
    </div>
  );
}

function MockTask({
  title,
  subs,
  completed,
}: {
  title: string;
  subs?: string[];
  completed?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={
            "mt-0.5 h-4 w-4 rounded shrink-0 border " +
            (completed ? "" : "")
          }
          style={{
            background: completed ? "var(--color-primary)" : "transparent",
            borderColor: completed ? "var(--color-primary)" : "var(--color-border)",
          }}
        >
          {completed && (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path
                d="M3.5 8.5l3 3 6-6"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={
              "text-sm font-medium " +
              (completed ? "line-through opacity-60" : "")
            }
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </div>
          {subs && subs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subs.map((s) => (
                <span key={s} className="chip-subtle">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

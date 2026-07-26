import { Heart, Zap, Eye } from "lucide-react";

export function AboutPage() {
  return (
    <div>
      <section className="container pt-14 lg:pt-20 pb-12">
        <div className="chip">About SimplLife</div>
        <h1 className="mt-5 text-4xl md:text-5xl text-balance max-w-3xl">
          Built for people who think in lists.
        </h1>
        <p className="mt-5 text-lg text-text-muted max-w-2xl">
          We built SimplLife for students juggling modules, teams juggling clients,
          and individuals juggling life. A calm, structured place where every task
          lives under a name — not just a board — so you always know what each
          person (or category) is carrying.
        </p>
      </section>

      <section className="container py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="chip uppercase tracking-wider text-[11px]">Mission</div>
            <h2 className="mt-4 text-3xl md:text-4xl">
              Make structured tracking feel effortless.
            </h2>
            <p className="mt-4 text-text-muted leading-relaxed">
              Most to-do apps force you into one way of thinking. SimplLife keeps
              the structure light: you can group by person, by project, by room
              in your house — whatever works. Subtasks and templates give you
              power without the friction of enterprise tools, and the calm
              warm/navy theming works from sunny mornings to late-night sessions.
            </p>
            <p className="mt-4 text-text-muted leading-relaxed">
              Undo/redo, inline editing, and a restorable completed section keep
              your actions non-destructive. If you check something off by mistake,
              bringing it back is one click — no guilt, no lost context.
            </p>
          </div>
          <div className="fade-in-up">
            <IllustratedMockup />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="chip uppercase tracking-wider text-[11px]">Values</div>
        <h2 className="mt-4 text-3xl md:text-4xl max-w-2xl">
          Three ideas that shape every detail.
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5 stagger">
          <ValueCard
            icon={<Zap size={22} />}
            accent="translate-x-3 -translate-y-3"
            title="Simplicity"
            lines={[
              "Fewer clicks, clearer outcomes. Every feature is shaped by a simple question — does this help someone finish their day with fewer unresolved tabs open?",
              "If a task takes more than a few seconds to add, we failed. That's why editing is inline and templates are a single tap away.",
            ]}
          />
          <ValueCard
            icon={<Heart size={22} />}
            accent="translate-x-5 -translate-y-4"
            title="Flexibility"
            lines={[
              "Groups can be people, places, priorities, or vibes. We don't dictate the one true way to organise — we just make nesting, sorting, and completion feel clean.",
              "Change your mind? Undo it. Rename your group later. Move tasks around. SimplLife should grow with the way your week actually moves.",
            ]}
          />
          <ValueCard
            icon={<Eye size={22} />}
            accent="translate-x-4 -translate-y-3"
            title="Clarity"
            lines={[
              "Completed tasks move out, not away. A single restorable section keeps what's done visible but quiet, so your active list stays honest.",
              "Color and typography are warm and precise — never loud. The interface should feel like a well-made notebook, not an alert console.",
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  lines,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  lines: [string, string];
  accent: string;
}) {
  return (
    <div className="card card-hover fade-in-up relative overflow-hidden">
      <div
        aria-hidden
        className={"absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-30 " + accent}
        style={{
          background:
            "radial-gradient(closest-side, var(--color-primary), transparent 70%)",
        }}
      />
      <div
        className="relative h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          color: "var(--color-text-strong)",
        }}
      >
        {icon}
      </div>
      <h3 className="relative text-xl mb-3" style={{ color: "var(--color-text-strong)" }}>
        {title}
      </h3>
      <div className="relative space-y-3 text-text-muted leading-relaxed">
        <p>{lines[0]}</p>
        <p>{lines[1]}</p>
      </div>
    </div>
  );
}

function IllustratedMockup() {
  return (
    <div
      className="rounded-3xl border p-5 shadow-xl"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center font-display font-bold"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            H
          </div>
          <div>
            <div
              className="font-display font-bold text-base"
              style={{ color: "var(--color-text-strong)" }}
            >
              Harsha — Home renovation
            </div>
            <div className="text-xs text-text-muted">Updated just now</div>
          </div>
        </div>
        <span className="chip">5 tasks</span>
      </div>

      <div
        className="rounded-2xl p-4 mb-3"
        style={{ background: "var(--color-page)" }}
      >
        <GroupedLine check title="Choose paint swatches" sub="Living • Bedroom • Kitchen" />
        <GroupedLine title="Contact electrician" sub="Quote + availability" />
        <GroupedLine title="Order light fixtures" sub="3 links saved" />
        <GroupedLine check title="Finalise budget" sub="Shared sheet" />
      </div>

      <div
        className="rounded-2xl p-4 border"
        style={{
          background: "color-mix(in srgb, var(--color-page) 70%, transparent)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            Completed
          </div>
          <div className="chip-subtle">1 restored yesterday</div>
        </div>
        <GroupedLine muted title="Sample tile flooring" sub="Showroom visit" />
      </div>
    </div>
  );
}

function GroupedLine({
  title,
  sub,
  check,
  muted,
}: {
  title: string;
  sub?: string;
  check?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={
        "flex items-start gap-3 py-2 " +
        (muted ? "opacity-70" : "")
      }
    >
      <div
        className="mt-1 h-4 w-4 rounded shrink-0 border flex items-center justify-center"
        style={{
          background: check ? "var(--color-primary)" : "transparent",
          borderColor: check ? "var(--color-primary)" : "var(--color-border)",
        }}
      >
        {check && (
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
      <div className="min-w-0">
        <div
          className={
            "text-sm font-medium " +
            (check ? "line-through opacity-70" : "")
          }
          style={{ color: "var(--color-text-strong)" }}
        >
          {title}
        </div>
        {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

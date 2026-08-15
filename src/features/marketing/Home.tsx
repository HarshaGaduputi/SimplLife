import { Link } from "react-router-dom";
import { Users, GitBranch, LayoutGrid, ArrowRight, CheckCircle2, Zap, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="container pt-20 lg:pt-32 pb-24 lg:pb-32 relative flex flex-col items-center justify-center min-h-[90vh]">
        {/* Glowing Background Orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--color-primary)" }}
        />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          <ScrollReveal delay={0}>
            <div className="chip bg-primary/10 border border-primary/20 text-primary mb-8 px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-sm">
              <Zap size={14} className="animate-pulse" />
              <span>SimplLife 2.0 is now live</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-balance tracking-tight leading-none mb-8">
              The modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">operating system</span> for your life.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12">
              Organise your work, track habits, and achieve goals in a stunning, minimalist workspace built for speed and clarity.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary h-14 px-8 text-lg shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_-15px_rgba(225,29,72,0.6)]">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link to="/templates" className="btn-secondary h-14 px-8 text-lg border-border/50 hover:bg-surface hover:border-border">
                Explore Templates
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={500} className="w-full mt-24">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/20 to-transparent blur-xl opacity-50" />
            <div className="relative rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=2560" 
                alt="SimplLife Dashboard Preview" 
                className="rounded-xl w-full object-cover border border-border/30 opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 h-[400px] md:h-[600px]"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features Section */}
      <section className="container py-24 relative">
        <div className="absolute top-1/2 left-0 w-full h-[300px] bg-primary/5 blur-[100px] -translate-y-1/2 pointer-events-none" />
        
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Built for deep focus.</h2>
            <p className="text-text-muted text-lg">Everything you need to manage your personal and professional life, without the clutter of traditional task managers.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          <ScrollReveal delay={100}>
            <FeatureCard
              icon={<LayoutGrid size={24} />}
              title="Workspaces & Groups"
              desc="Organise everything into clean, separate groups. Keep personal habits away from work tasks."
            />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <FeatureCard
              icon={<GitBranch size={24} />}
              title="Infinite Nesting"
              desc="Break down massive goals into actionable subtasks. Never feel overwhelmed by a project again."
            />
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <FeatureCard
              icon={<Users size={24} />}
              title="AI Assistant"
              desc="Chat with your productivity data. Let AI prioritize your week and generate summaries instantly."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="container py-32">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-16 text-center">Simplicity by design.</h2>
        </ScrollReveal>

        <div className="space-y-24 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Capture everything', desc: 'Quick-add tasks, notes, and habits before you forget them. Hit Cmd+K from anywhere.', align: 'left' },
            { step: '02', title: 'Organise effortlessly', desc: 'Drag and drop into groups. Add tags, due dates, and priorities with natural language.', align: 'right' },
            { step: '03', title: 'Execute with focus', desc: 'Use the built-in Pomodoro timer to enter deep work. Track your daily streaks.', align: 'left' }
          ].map((item, i) => (
            <ScrollReveal key={item.step} delay={100}>
              <div className={`flex flex-col md:flex-row items-center gap-12 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-6">
                  <div className="text-primary font-mono text-xl font-bold">{item.step}</div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold">{item.title}</h3>
                  <p className="text-text-muted text-lg">{item.desc}</p>
                </div>
                <div className="flex-1 w-full aspect-video rounded-2xl bg-surface border border-border flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-24 h-24 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle2 size={32} className="text-primary/40 group-hover:text-primary transition-colors duration-500" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 mb-12">
        <ScrollReveal>
          <div className="relative rounded-[2rem] overflow-hidden border border-border/50 bg-surface/30 p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Stop managing tasks. <br/>Start living.</h2>
              <p className="text-lg text-text-muted mb-10">Join thousands of professionals who have reclaimed their time and focus with SimplLife.</p>
              
              <Link
                to="/dashboard"
                className="btn-primary h-14 px-8 text-lg inline-flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_-5px_rgba(225,29,72,0.6)]"
              >
                Enter the Dashboard
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-surface/30 p-8 hover:bg-surface/60 transition-colors duration-500 hover:border-primary/30 h-full flex flex-col">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-muted leading-relaxed flex-1">{desc}</p>
    </div>
  );
}

import { Badge, Card } from "@/components/ui";

export function TermsPage() {
  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-4xl mx-auto space-y-8">
      <header className="space-y-3">
        <Badge variant="primary" size="md">Legal Documents</Badge>
        <h1 className="text-h1 font-bold text-text-strong tracking-tight">Terms of Service</h1>
        <p className="text-text-muted text-sm">Last updated: August 3, 2026</p>
      </header>

      <Card className="p-8 space-y-6 leading-relaxed text-sm text-text">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">1. Terms</h2>
          <p>By accessing the SimplLife application, you agree to be bound by these terms of service and comply with all applicable laws and regulations.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on SimplLife's website for personal, non-commercial transitory viewing only.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">3. Disclaimer</h2>
          <p>The materials on SimplLife's website are provided on an 'as is' basis. SimplLife makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
        </section>
      </Card>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-4xl mx-auto space-y-8">
      <header className="space-y-3">
        <Badge variant="primary" size="md">Legal Documents</Badge>
        <h1 className="text-h1 font-bold text-text-strong tracking-tight">Privacy Policy</h1>
        <p className="text-text-muted text-sm">Last updated: August 3, 2026</p>
      </header>

      <Card className="p-8 space-y-6 leading-relaxed text-sm text-text">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when creating an account, compiling task descriptions, updating milestones, or communicating with us.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and improve the features and functionality of the SimplLife AI-first productivity workspace application.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-strong">3. Security</h2>
          <p>We use standard security measures to protect the confidentiality of your personal data, access tokens, and task logs.</p>
        </section>
      </Card>
    </div>
  );
}

import { Badge, Card, CardHeader } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";

/**
 * Pricing page. Everything in the registry is "free" today
 * (source/licenses.json) and there is no checkout yet, so this page only
 * shows the free tier. Pro / Team cards land once:
 *   - source/licenses.json flips items to "pro" / "team" (content decision)
 *   - the entitlement store + checkout + webhook land (tasks #33–#36)
 */
export function PricingPage() {
  return (
    <article className="page">
      <PageMeta
        title="Pricing"
        description="HeiGin UI is free during beta — every component, pattern and token is MIT-licensed-feel and installable via the shadcn CLI, npm or copy-source."
        ogType="website"
      />
      <header className="page__header">
        <p className="eyebrow">Pricing</p>
        <h1>Pricing</h1>
        <p className="lede">Free during beta. Paid tiers for premium templates and sections ship with the template catalog.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--hg-space-4)", marginTop: "var(--hg-space-6)" }}>
        <Card padding="lg">
          <CardHeader title="Free" description="Everything in @heigin/ui" />
          <p style={{ fontSize: 32, fontWeight: 600, margin: "var(--hg-space-3) 0" }}>$0</p>
          <ul className="prose-list small">
            <li>All 30 primitives + 18 CRM patterns</li>
            <li>All 128 design tokens</li>
            <li>Install via npm, shadcn CLI, or copy-source</li>
            <li>MCP server for coding agents</li>
            <li>Community support on GitHub Issues</li>
          </ul>
          <Badge tone="success" style={{ marginTop: "var(--hg-space-3)" }}>Current plan</Badge>
        </Card>

        <Card padding="lg" style={{ opacity: 0.7 }}>
          <CardHeader title="Pro" description="Premium templates + sections" />
          <p style={{ fontSize: 32, fontWeight: 600, margin: "var(--hg-space-3) 0" }}>Coming soon</p>
          <ul className="prose-list small">
            <li>Premium landing-page templates</li>
            <li>Individual section templates</li>
            <li>12 months of updates</li>
            <li>Email support (2 business days)</li>
          </ul>
          <Badge tone="outline" style={{ marginTop: "var(--hg-space-3)" }}>Not yet</Badge>
        </Card>

        <Card padding="lg" style={{ opacity: 0.7 }}>
          <CardHeader title="Team" description="Up to 10 developers" />
          <p style={{ fontSize: 32, fontWeight: 600, margin: "var(--hg-space-3) 0" }}>Coming soon</p>
          <ul className="prose-list small">
            <li>Everything in Pro</li>
            <li>Unlimited end-client projects</li>
            <li>Priority support (1 business day)</li>
            <li>1 onboarding call</li>
          </ul>
          <Badge tone="outline" style={{ marginTop: "var(--hg-space-3)" }}>Not yet</Badge>
        </Card>
      </div>

      <p className="muted small" style={{ marginTop: "var(--hg-space-6)" }}>
        Final pricing and plan details land with the template catalog. Email <a href="mailto:sales@heigin.com">sales@heigin.com</a> for early access.
      </p>
    </article>
  );
}

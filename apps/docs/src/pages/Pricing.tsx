import { Badge, Card, CardHeader } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import { counts } from "../generated/catalog";

/**
 * Pricing page. Components, patterns and tokens are "free" in
 * source/licenses.json; template sections are "pro" but there is no checkout
 * or license store yet, so Pro / Team stay "coming soon" with no prices and
 * no buy buttons until those exist.
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
        <p className="lede">
          Components, patterns and tokens are free. The <a href="/templates">template catalog</a> is listed and previewable, but its paid items are
          not on sale yet.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--hg-space-4)", marginTop: "var(--hg-space-6)" }}>
        <Card padding="lg">
          <CardHeader title="Free" description="Everything in @heigin/ui" />
          <p style={{ fontSize: 32, fontWeight: 600, margin: "var(--hg-space-3) 0" }}>$0</p>
          <ul className="prose-list small">
            <li>
              All {counts.primitives} primitives + {counts.patterns} CRM patterns
            </li>
            <li>All {counts.tokens} design tokens</li>
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
        Prices, license terms and checkout for the paid tiers have not been set. Until they are, paid templates cannot be bought or installed. Email <a href="mailto:sales@heigin.com">sales@heigin.com</a> for early access.
      </p>
    </article>
  );
}

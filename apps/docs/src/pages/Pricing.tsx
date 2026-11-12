import * as React from "react";
import { Badge, Button, Card, CardHeader, Tab, Tabs, TabsList, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import { counts } from "../generated/catalog";
import { href, navigate as routerNavigate } from "../lib/router";

type BillingCycle = "annual" | "monthly";

const EXPLAINER_ITEMS = [
  {
    id: "whats-free",
    title: "What's free",
    body: `All ${counts.primitives} UI primitives, ${counts.patterns} CRM patterns, ${counts.tokens} design tokens, and the @heigin/mcp server (${counts.mcpTools} tools) are free to install via npm, the shadcn CLI, or copyable source.`,
  },
  {
    id: "whats-paid",
    title: "What's paid",
    body: `Production-ready full-page templates, section bundles (${counts.templates} landing items today), and upcoming multi-component interface blocks require a Pro or Team license once checkout opens.`,
  },
  {
    id: "commercial-rights",
    title: "Commercial rights",
    body: "Use free primitives and patterns in unlimited personal and commercial products. Pro covers a single developer building commercial projects; Team covers up to 10 developers and unlimited client projects.",
  },
  {
    id: "updates",
    title: "Updates",
    body: "Core library updates (@heigin/ui and @heigin/mcp) are always free. Pro and Team licenses include 12 months of new template releases, section additions, and priority support.",
  },
] as const;

export function PricingPage() {
  const [cycle, setCycle] = React.useState<BillingCycle>("annual");

  return (
    <TooltipProvider>
      <article className="page" data-testid="pricing-page">
        <PageMeta
          title="Pricing"
          description="HeiGin UI primitives, CRM patterns, and design tokens are free. Pro and Team tiers unlock full-page templates and commercial bundles."
          ogType="website"
        />

        <header className="page__header">
          <p className="eyebrow">Pricing</p>
          <h1>Pricing</h1>
          <p className="lede">
            Components, patterns, and tokens are free. The{" "}
            <a href={href("/templates")}>template catalog</a> is listed and previewable; paid tiers and checkout are being finalized.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--hg-space-4)",
            marginTop: "var(--hg-space-6)",
            alignItems: "stretch",
          }}
        >
          {/* Free Card */}
          <Card padding="lg">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "var(--hg-space-4)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--hg-space-2)" }}>
                <CardHeader title="Free" description="Everything in @heigin/ui & @heigin/mcp" />
                <Badge tone="success">Current plan</Badge>
              </div>

              <div>
                <p style={{ fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>$0</p>
                <p className="muted small" style={{ margin: "4px 0 0" }}>
                  Free forever for individuals &amp; teams
                </p>
              </div>

              <ul className="prose-list small" style={{ margin: 0, flex: 1 }}>
                <li>
                  All {counts.primitives} primitives + {counts.patterns} CRM patterns
                </li>
                <li>All {counts.tokens} design tokens (light &amp; dark mode)</li>
                <li>Install via npm, shadcn CLI, or copy-source</li>
                <li>MCP server ({counts.mcpTools} tools) for coding agents</li>
                <li>Community support on GitHub Issues</li>
              </ul>

              <div style={{ marginTop: "auto", paddingTop: "var(--hg-space-2)" }}>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => routerNavigate("/docs/getting-started")}
                >
                  Get started
                </Button>
              </div>
            </div>
          </Card>

          {/* Pro Card (Annual + Monthly tabs) */}
          <Card padding="lg">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "var(--hg-space-4)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--hg-space-2)" }}>
                <CardHeader title="Pro" description="Premium templates, sections & blocks" />
                <Tabs
                  value={cycle}
                  onValueChange={(v) => setCycle(v === "monthly" ? "monthly" : "annual")}
                >
                  <TabsList variant="pill" aria-label="Pro billing cycle">
                    <Tab value="annual">Annual</Tab>
                    <Tab value="monthly">Monthly</Tab>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <p
                  style={{ fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1.2 }}
                  data-pending-decision={`pro-${cycle}-price`}
                >
                  —
                </p>
                <p
                  className="muted small"
                  style={{ margin: "4px 0 0" }}
                  data-pending-decision={`pro-${cycle}-cadence`}
                >
                  {cycle === "annual"
                    ? "Billed annually · price TBD"
                    : "Billed monthly · price TBD"}
                </p>
              </div>

              <ul className="prose-list small" style={{ margin: 0, flex: 1 }}>
                <li>Everything in Free</li>
                <li>All {counts.templates} landing template sections &amp; bundles</li>
                <li>Upcoming multi-component interface blocks</li>
                <li>12 months of template &amp; block updates</li>
                <li>Email support (2 business days)</li>
              </ul>

              <div style={{ marginTop: "auto", paddingTop: "var(--hg-space-2)" }}>
                <Tooltip content="Coming soon" side="bottom">
                  <span
                    tabIndex={0}
                    title="Coming soon"
                    style={{ display: "flex", width: "100%", cursor: "not-allowed" }}
                  >
                    <Button
                      variant="primary"
                      fullWidth
                      disabled
                      aria-disabled="true"
                      title="Coming soon"
                      style={{ pointerEvents: "none" }}
                    >
                      Coming soon
                    </Button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Team Card (Contact sales) */}
          <Card padding="lg">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "var(--hg-space-4)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--hg-space-2)" }}>
                <CardHeader title="Team" description="Up to 10 developers & client work" />
                <Badge tone="outline">Enterprise-ready</Badge>
              </div>

              <div>
                <p
                  style={{ fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1.2 }}
                  data-pending-decision="team-price"
                >
                  —
                </p>
                <p
                  className="muted small"
                  style={{ margin: "4px 0 0" }}
                  data-pending-decision="team-cadence"
                >
                  Team license · price TBD
                </p>
              </div>

              <ul className="prose-list small" style={{ margin: 0, flex: 1 }}>
                <li>Everything in Pro for up to 10 developers</li>
                <li>Unlimited commercial &amp; end-client projects</li>
                <li>Shared team library &amp; registry seat management</li>
                <li>Priority support (1 business day)</li>
                <li>1 onboarding &amp; architecture call</li>
              </ul>

              <div style={{ marginTop: "auto", paddingTop: "var(--hg-space-2)" }}>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    window.location.href = "mailto:sales@heigin.com?subject=HeiGin%20UI%20Team%20License";
                  }}
                >
                  Contact sales
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Explainer section: What's free / What's paid / Commercial rights / Updates */}
        <section
          aria-labelledby="pricing-explainer-heading"
          style={{ marginTop: "var(--hg-space-10, 40px)" }}
        >
          <h2 id="pricing-explainer-heading" style={{ marginBottom: "var(--hg-space-4)" }}>
            Licensing &amp; access details
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--hg-space-4)",
            }}
          >
            {EXPLAINER_ITEMS.map((item) => (
              <Card key={item.id} padding="lg" data-testid={`pricing-explainer-${item.id}`}>
                <CardHeader title={item.title} />
                <p className="muted small" style={{ margin: "var(--hg-space-2) 0 0" }}>
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <p className="muted small" style={{ marginTop: "var(--hg-space-6)" }}>
          Prices, license terms, and checkout for paid tiers are pending final decision. Email{" "}
          <a href="mailto:sales@heigin.com">sales@heigin.com</a> for early access or team inquiries.
        </p>
      </article>
    </TooltipProvider>
  );
}

export default PricingPage;

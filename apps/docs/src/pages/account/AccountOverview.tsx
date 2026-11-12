import { Lock, User } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";

const PLANNED_SECTIONS = [
  {
    title: "Plan & license status",
    description: "Displays your active tier (Free, Pro, or Team) and seat allocation once authentication is connected.",
  },
  {
    title: "Recent installs & library activity",
    description: "Quick access to recently installed templates, saved components, and registry tokens.",
  },
  {
    title: "MCP & CLI readiness",
    description: "Status indicator for your local @heigin/mcp configuration and shadcn registry authentication.",
  },
] as const;

export function AccountOverview() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-overview-page" data-integration-point="account-overview">
        <PageMeta
          title="Account Overview"
          description="Manage your HeiGin UI license tier, saved components, and MCP configuration."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>Overview</h1>
          <p className="lede">
            Your workspace summary, license status, and quick links to library entitlements.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Authentication is not enabled yet. Once connected, this overview will show your active tier, library access, and MCP setup."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<User size={15} strokeWidth={1.7} aria-hidden="true" />}
                    style={{ pointerEvents: "none" }}
                  >
                    Sign in
                  </Button>
                </span>
              </Tooltip>
            }
          />
        </Card>

        <section
          aria-labelledby="account-overview-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="account-overview-preview" className="h4" style={{ margin: 0 }}>
              Planned layout
            </h2>
            <Badge tone="outline">Shell preview</Badge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--hg-space-4)",
            }}
          >
            {PLANNED_SECTIONS.map((section) => (
              <Card key={section.title} padding="lg">
                <CardHeader title={section.title} description={section.description} />
                <div
                  aria-hidden="true"
                  style={{
                    marginTop: "var(--hg-space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--hg-space-2)",
                  }}
                >
                  <Skeleton style={{ height: 12, width: "65%" }} />
                  <Skeleton style={{ height: 12, width: "45%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default AccountOverview;

import { Lock, Plug } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";
import { counts } from "../../generated/catalog";
import { href } from "../../lib/router";

const MCP_SLOTS = [
  {
    title: "Agent configuration snippet",
    description: `Ready-to-paste MCP server config exposing all ${counts.mcpTools} @heigin/mcp tools to your coding agent.`,
  },
  {
    title: "Registry access scope",
    description: "When authenticated, binds your Pro/Team license to local shadcn registry fetches.",
  },
] as const;

export function McpConfig() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-mcp-config-page" data-integration-point="account-mcp-config">
        <PageMeta
          title="MCP Config · Account"
          description="Configure @heigin/mcp and authenticated registry access for your coding agents."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>MCP Config</h1>
          <p className="lede">
            Configure <a href={href("/mcp")}>@heigin/mcp</a> ({counts.mcpTools} tools) and registry access for your local coding agents.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Public MCP tools work without an account (see the MCP Server docs). Sign in once accounts launch to generate authenticated registry configurations."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<Plug size={15} strokeWidth={1.7} aria-hidden="true" />}
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
          aria-labelledby="mcp-config-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="mcp-config-preview" className="h4" style={{ margin: 0 }}>
              Planned layout
            </h2>
            <Badge tone="outline">Shell preview</Badge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--hg-space-4)",
            }}
          >
            {MCP_SLOTS.map((slot) => (
              <Card key={slot.title} padding="lg">
                <CardHeader title={slot.title} description={slot.description} />
                <div
                  aria-hidden="true"
                  style={{
                    marginTop: "var(--hg-space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--hg-space-2)",
                  }}
                >
                  <Skeleton style={{ height: 36, width: "100%" }} />
                  <Skeleton style={{ height: 12, width: "50%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default McpConfig;

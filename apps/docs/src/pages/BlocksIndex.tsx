import { Bell, Blocks } from "lucide-react";
import { Button, Card, EmptyState, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import blocksData from "../../../../source/blocks.json";
import { counts } from "../generated/catalog";
import { href } from "../lib/router";

export interface BlockManifestItem {
  name: string;
  title: string;
  description: string;
}

const BLOCKS: readonly BlockManifestItem[] = blocksData as BlockManifestItem[];

const PLANNED_BLOCK_CATEGORIES = [
  "Application shells — collapsible dashboard sidebars, multi-column CRM layouts, and command bars",
  "Authentication & onboarding — sign-in screens, workspace creation flows, and invite modals",
  "Marketing & conversion sections — pricing tables, feature grids, and hero sections",
  "Data & record views — filterable table views, record detail split panes, and activity feeds",
  "Settings & billing — account preference panels, API/MCP configuration, and plan management",
] as const;

export function BlocksIndex() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="blocks-index-page">
        <PageMeta
          title="Blocks"
          description="Larger reusable interface sections composed from HeiGin UI primitives and CRM patterns."
          ogType="website"
        />

        <header className="page__header">
          <p className="eyebrow">Interface sections</p>
          <h1>Blocks</h1>
          <p className="lede">
            Larger, drop-in interface sections — dashboard sidebars, pricing sections, and authentication layouts — built on top of our{" "}
            <a href={href("/components")}>{counts.primitives} primitives</a> and{" "}
            <a href={href("/patterns")}>{counts.patterns} CRM patterns</a>.
          </p>
        </header>

        {BLOCKS.length === 0 && (
          <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
            <EmptyState
              size="page"
              icon={<Blocks size={24} strokeWidth={1.6} />}
              title="Blocks are coming soon"
              description="We are extracting multi-component layout blocks from production so you can install complete page sections with a single command."
              action={
                <Tooltip content="Coming soon" side="bottom">
                  <span
                    tabIndex={0}
                    title="Coming soon"
                    style={{ display: "inline-flex", cursor: "not-allowed" }}
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      aria-disabled="true"
                      title="Coming soon"
                      leadingIcon={<Bell size={15} strokeWidth={1.7} aria-hidden="true" />}
                      style={{ pointerEvents: "none" }}
                    >
                      Notify me
                    </Button>
                  </span>
                </Tooltip>
              }
            />

            <div
              style={{
                marginTop: "var(--hg-space-6)",
                paddingTop: "var(--hg-space-6)",
                borderTop: "1px solid var(--docs-border, var(--hg-color-border))",
              }}
            >
              <h2 className="h4" style={{ marginTop: 0, marginBottom: "var(--hg-space-3)" }}>
                What Blocks will cover
              </h2>
              <ul className="prose-list small" style={{ margin: 0 }}>
                {PLANNED_BLOCK_CATEGORIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>
        )}
      </article>
    </TooltipProvider>
  );
}

export default BlocksIndex;

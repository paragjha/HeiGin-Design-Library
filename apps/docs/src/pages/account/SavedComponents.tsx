import { Bookmark, Lock } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";

const SAVED_SLOTS = [
  {
    title: "Bookmarked primitives & patterns",
    description: "Pin frequently used components for quick access across projects.",
  },
  {
    title: "Saved collections",
    description: "Group components and blocks into custom lists for your team.",
  },
] as const;

export function SavedComponents() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-saved-page" data-integration-point="account-saved-components">
        <PageMeta
          title="Saved Components · Account"
          description="View and organize your bookmarked HeiGin UI primitives, patterns, and blocks."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>Saved Components</h1>
          <p className="lede">
            Bookmarked primitives, CRM patterns, and blocks for quick reference.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Sign in to bookmark components and sync your saved lists across devices."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<Bookmark size={15} strokeWidth={1.7} aria-hidden="true" />}
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
          aria-labelledby="saved-components-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="saved-components-preview" className="h4" style={{ margin: 0 }}>
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
            {SAVED_SLOTS.map((slot) => (
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
                  <Skeleton style={{ height: 14, width: "70%" }} />
                  <Skeleton style={{ height: 14, width: "50%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default SavedComponents;

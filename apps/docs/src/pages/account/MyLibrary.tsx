import { Library, Lock } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";

const LIBRARY_SLOTS = [
  {
    title: "Unlocked templates",
    description: "Full-page templates and section bundles associated with your license.",
  },
  {
    title: "Install commands",
    description: "One-click shadcn CLI and copy-source commands scoped to your account.",
  },
] as const;

export function MyLibrary() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-library-page" data-integration-point="account-my-library">
        <PageMeta
          title="My Library · Account"
          description="Access your unlocked HeiGin UI templates, bundles, and install commands."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>My Library</h1>
          <p className="lede">
            Templates, section bundles, and component packages unlocked for your account.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Sign in to view your unlocked templates and copy authenticated install commands."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<Library size={15} strokeWidth={1.7} aria-hidden="true" />}
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
          aria-labelledby="my-library-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="my-library-preview" className="h4" style={{ margin: 0 }}>
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
            {LIBRARY_SLOTS.map((slot) => (
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
                  <Skeleton style={{ height: 32, width: "100%" }} />
                  <Skeleton style={{ height: 12, width: "55%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default MyLibrary;

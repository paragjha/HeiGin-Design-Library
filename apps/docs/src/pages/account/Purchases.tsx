import { Lock, ShoppingBag } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";

const PURCHASE_SLOTS = [
  {
    title: "Order history",
    description: "Chronological list of purchased templates, bundles, and license upgrades.",
  },
  {
    title: "License entitlements",
    description: "Downloadable license terms and update window status for each purchase.",
  },
] as const;

export function Purchases() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-purchases-page" data-integration-point="account-purchases">
        <PageMeta
          title="Purchases · Account"
          description="View your HeiGin UI template purchases and license entitlements."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>Purchases</h1>
          <p className="lede">
            One-time template purchases, bundle orders, and license coverage windows.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Sign in to view your purchase history and license entitlements."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<ShoppingBag size={15} strokeWidth={1.7} aria-hidden="true" />}
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
          aria-labelledby="purchases-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="purchases-preview" className="h4" style={{ margin: 0 }}>
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
            {PURCHASE_SLOTS.map((slot) => (
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
                  <Skeleton style={{ height: 14, width: "75%" }} />
                  <Skeleton style={{ height: 14, width: "45%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default Purchases;

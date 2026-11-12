import { CreditCard, Lock } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Tooltip, TooltipProvider } from "@heigin/ui";
import { PageMeta } from "../../components/PageMeta";

const BILLING_SLOTS = [
  {
    title: "Payment methods & billing details",
    description: "Manage billing email, company tax details, and saved payment methods.",
  },
  {
    title: "Invoices & receipts",
    description: "Download PDF invoices and GST/tax receipts for accounting.",
  },
] as const;

export function Billing() {
  return (
    <TooltipProvider>
      <article className="page" data-testid="account-billing-page" data-integration-point="account-billing">
        <PageMeta
          title="Billing · Account"
          description="Manage billing details, payment methods, and invoices for HeiGin UI."
        />

        <header className="page__header">
          <p className="eyebrow">Account</p>
          <h1>Billing</h1>
          <p className="lede">
            Payment methods, tax details, and downloadable invoices.
          </p>
        </header>

        <Card padding="lg" style={{ marginTop: "var(--hg-space-6)" }}>
          <EmptyState
            size="page"
            icon={<Lock size={22} strokeWidth={1.6} />}
            title="Sign in required"
            description="Checkout and billing management are not enabled yet. Sign in once billing is connected to manage invoices and payment details."
            action={
              <Tooltip content="Coming soon" side="bottom">
                <span tabIndex={0} title="Coming soon" style={{ display: "inline-flex", cursor: "not-allowed" }}>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    leadingIcon={<CreditCard size={15} strokeWidth={1.7} aria-hidden="true" />}
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
          aria-labelledby="billing-preview"
          style={{ marginTop: "var(--hg-space-8)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)", marginBottom: "var(--hg-space-4)" }}>
            <h2 id="billing-preview" className="h4" style={{ margin: 0 }}>
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
            {BILLING_SLOTS.map((slot) => (
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
                  <Skeleton style={{ height: 14, width: "68%" }} />
                  <Skeleton style={{ height: 14, width: "42%" }} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </TooltipProvider>
  );
}

export default Billing;

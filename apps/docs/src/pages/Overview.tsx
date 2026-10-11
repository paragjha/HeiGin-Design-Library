import { ArrowRight, Blocks, Copy, Palette, ShieldCheck } from "lucide-react";
import { Badge, Card, MetricCard } from "@heigin/ui";
import { componentDocs } from "../content/components";
import { patternDocs } from "../content/patterns";
import { href } from "../lib/router";
import { listManifests } from "../lib/source";
import { tokenMeta } from "@heigin/ui/tokens";

export function OverviewPage() {
  const all = [...componentDocs, ...patternDocs];
  const observedTokens = Object.values(tokenMeta).filter((t) => t.evidence === "observed").length;
  const tokenCount = Object.keys(tokenMeta).length;
  return (
    <article className="page">
      <header className="page__header">
        <p className="eyebrow">HeiGin UI · v0.1.0</p>
        <h1>The HeiGin CRM design system</h1>
        <p className="lede">
          Tokens, React components and CRM patterns taken from the live HeiGin CRM. Install them as <code className="inline-code">@heigin/ui</code>, or
          copy individual components into a Next.js app.
        </p>
        <div className="meta-row">
          <a className="button-link primary" href={href("/getting-started")}>
            Get started <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
          </a>
          <a className="button-link" href={href("/components")}>
            Browse components
          </a>
        </div>
      </header>

      <section aria-label="At a glance" className="metric-grid">
        <MetricCard label="Primitives" value={componentDocs.length} hint="Buttons, forms, overlays, tables" />
        <MetricCard label="CRM patterns" value={patternDocs.length} hint="Composed from the primitives" />
        <MetricCard label="Design tokens" value={tokenCount} hint={`${observedTokens} observed in production`} />
        <MetricCard label="Copyable manifests" value={listManifests().length} hint="Files + dependencies per component" />
      </section>

      <section aria-labelledby="principles-h">
        <h2 id="principles-h">How it is built</h2>
        <ul className="card-grid">
          <li>
            <Card>
              <Palette size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h4">Taken from production</h3>
              <p className="muted small">
                Colours, radii, shadows, motion and control sizes come from the production stylesheet. Every token is labelled observed, derived or
                proposed.
              </p>
            </Card>
          </li>
          <li>
            <Card>
              <Blocks size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h4">Primitives first</h3>
              <p className="muted small">
                CRM patterns are built from Button, Badge, Card and the other primitives, so their styles are never duplicated. Complex widgets use Base
                UI.
              </p>
            </Card>
          </li>
          <li>
            <Card>
              <Copy size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h4">Package or copy</h3>
              <p className="muted small">
                Install the npm package, or copy one component together with exactly the files it needs. Generated manifests list every dependency.
              </p>
            </Card>
          </li>
          <li>
            <Card>
              <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h4">Accessible by default</h3>
              <p className="muted small">
                Built to WCAG 2.2 AA, with keyboard and axe tests on every component. Places where we fix production contrast are documented.
              </p>
            </Card>
          </li>
        </ul>
      </section>

      <section aria-labelledby="status-h">
        <h2 id="status-h">Evidence status</h2>
        <p>
          Every component says how sure we are that it matches production. The live CRM's signed-in screens have not been inspected yet, so most CRM
          patterns are <Badge tone="warning">proposed</Badge> from the product spec until they are checked.
        </p>
        <ul className="chip-list">
          {(["observed", "inferred", "proposed"] as const).map((e) => (
            <li key={e}>
              <Badge tone="outline">
                {e}: {all.filter((d) => d.evidence === e).length}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

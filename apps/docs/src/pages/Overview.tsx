import { ArrowRight, Blocks, Copy, Palette, ShieldCheck, Layers, BookOpen, Wrench } from "lucide-react";
import { Badge, MetricCard, MetricGroup, MoneyValue } from "@heigin/ui";
import { componentDocs } from "../content/components";
import { patternDocs } from "../content/patterns";
import { href } from "../lib/router";
import { listManifests } from "../lib/source";
import { tokenMeta } from "@heigin/ui/tokens";
import uiPackage from "../../../../packages/ui/package.json";

function HeroBg() {
  return (
    <>
      <img
        src="./hero-light.webp"
        alt=""
        className="hero__bg hero__bg--light"
        loading="eager"
      />
      <img
        src="./hero-dark.webp"
        alt=""
        className="hero__bg hero__bg--dark"
        loading="eager"
      />
    </>
  );
}

/* ---------- Category card data ---------- */
const categories = [
  {
    icon: Layers,
    title: "Components",
    desc: `${componentDocs.length} primitives — buttons, forms, overlays, tables and more.`,
    path: "/components",
    arrow: "Browse components",
  },
  {
    icon: Blocks,
    title: "CRM Patterns",
    desc: `${patternDocs.length} real-world patterns composed from the primitives.`,
    path: "/patterns",
    arrow: "View patterns",
  },
  {
    icon: Palette,
    title: "Design Tokens",
    desc: "Colours, typography, spacing, shadows, and motion — all from production.",
    path: "/tokens",
    arrow: "Explore tokens",
  },
  {
    icon: Wrench,
    title: "Builder",
    desc: "Compose layouts visually and export clean, dependency-aware code.",
    path: "/builder",
    arrow: "Open builder",
  },
  {
    icon: BookOpen,
    title: "Getting Started",
    desc: "Install the package, copy individual components, or integrate with Next.js.",
    path: "/getting-started",
    arrow: "Read the guide",
  },
  {
    icon: Copy,
    title: "Copyable Source",
    desc: "Copy any component with its full dependency tree into your project.",
    path: "/copy-source",
    arrow: "Learn how",
  },
];

/* ---------- CRM pattern previews ---------- */
const patternPreviews = [
  {
    slug: "metric-card",
    title: "Metric Cards",
    desc: "KPI dashboard strip with real-time metrics.",
    preview: (
      <MetricGroup label="Pipeline" columns={3}>
        <MetricCard label="Open pipeline" value={<MoneyValue amount={2310000} format="compact" />} hint="18 deals" />
        <MetricCard label="Win rate" value="64%" hint="16 won" />
        <MetricCard label="New leads" value="342" hint="This quarter" />
      </MetricGroup>
    ),
  },
  {
    slug: "status-badge",
    title: "Status Badges",
    desc: "CRM entity status indicators with semantic tones.",
    preview: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Badge tone="success" dot>Active</Badge>
        <Badge tone="info" dot>Qualified</Badge>
        <Badge tone="warning" dot>Proposal</Badge>
        <Badge tone="danger" dot>Closed</Badge>
      </div>
    ),
  },
];

/* ---------- Main page ---------- */
export function OverviewPage() {
  const observedTokens = Object.values(tokenMeta).filter((t) => t.evidence === "observed").length;
  const tokenCount = Object.keys(tokenMeta).length;
  const manifestCount = listManifests().length;

  return (
    <article className="home-page">
      {/* Hero */}
      <section className="hero">
        <HeroBg />
        <div className="hero__content">
          <p className="section-label">
            {uiPackage.version} · React · TypeScript · Production ready
          </p>
          <h1 className="hero__title">
            The design system for modern CRMs.
          </h1>
          <p className="hero__subtitle">
            Production-derived components, thoughtful CRM patterns, and copyable code. Build consistent, high-quality interfaces faster with HeiGin UI.
          </p>
          <div className="hero__actions">
            <a className="button-link primary" href={href("/components")}>
              Explore components <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
            <a className="button-link" href={href("/getting-started")}>
              Get started
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section aria-label="At a glance" className="stats-strip">
        <div className="stats-strip__item">
          <span className="stats-strip__value">{componentDocs.length}</span>
          <span className="stats-strip__label">Primitives</span>
          <span className="stats-strip__hint">Buttons, forms, overlays, tables and more.</span>
        </div>
        <div className="stats-strip__item">
          <span className="stats-strip__value">{patternDocs.length}</span>
          <span className="stats-strip__label">CRM patterns</span>
          <span className="stats-strip__hint">Real-world patterns from the HeiGin CRM.</span>
        </div>
        <div className="stats-strip__item">
          <span className="stats-strip__value">{tokenCount}</span>
          <span className="stats-strip__label">Design tokens</span>
          <span className="stats-strip__hint">Colours, typography, spacing, shadows and more.</span>
        </div>
        <div className="stats-strip__item">
          <span className="stats-strip__value">{manifestCount}</span>
          <span className="stats-strip__label">Copyable manifests</span>
          <span className="stats-strip__hint">Files + dependencies per component.</span>
        </div>
      </section>

      {/* How it's built */}
      <section>
        <div className="category-header">
          <div>
            <p className="section-label">Built from a live product</p>
            <h2>Everything you need to build beautiful, consistent CRM interfaces.</h2>
          </div>
          <a href={href("/components")} className="category-link">
            Browse all components <ArrowRight size={14} strokeWidth={1.6} />
          </a>
        </div>
        <div className="principles-grid">
          <div className="principle-card">
            <Palette size={18} strokeWidth={1.6} className="principle-card__icon" />
            <span className="principle-card__title">Taken from production</span>
            <p className="principle-card__desc">
              Colours, radii, shadows, motion and control sizes come from the production stylesheet. Every token is labelled observed, derived or proposed.
            </p>
          </div>
          <div className="principle-card">
            <Blocks size={18} strokeWidth={1.6} className="principle-card__icon" />
            <span className="principle-card__title">Primitives first</span>
            <p className="principle-card__desc">
              CRM patterns are built from Button, Badge, Card and the other primitives, so their styles are never duplicated. Complex widgets use Base UI.
            </p>
          </div>
          <div className="principle-card">
            <Copy size={18} strokeWidth={1.6} className="principle-card__icon" />
            <span className="principle-card__title">Package or copy</span>
            <p className="principle-card__desc">
              Install the npm package, or copy one component together with exactly the files it needs. Generated manifests list every dependency.
            </p>
          </div>
          <div className="principle-card">
            <ShieldCheck size={18} strokeWidth={1.6} className="principle-card__icon" />
            <span className="principle-card__title">Accessible by default</span>
            <p className="principle-card__desc">
              Built to WCAG 2.2 AA, with keyboard and axe tests on every component. Places where we fix production contrast are documented.
            </p>
          </div>
        </div>
      </section>

      {/* Explore by category */}
      <section>
        <p className="section-label">Explore by category</p>
        <h2 style={{ marginBottom: 16 }}>Find what you need</h2>
        <div className="feature-grid">
          {categories.map((cat) => (
            <a key={cat.path} href={href(cat.path)} className="feature-card">
              <div className="feature-card__icon">
                <cat.icon size={18} strokeWidth={1.6} />
              </div>
              <span className="feature-card__title">{cat.title}</span>
              <p className="feature-card__desc">{cat.desc}</p>
              <span className="feature-card__arrow">
                {cat.arrow} <ArrowRight size={13} strokeWidth={1.6} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* CRM patterns showcase */}
      <section>
        <div className="category-header">
          <div>
            <p className="section-label">CRM specific patterns</p>
            <h2>Tables, workflows, dashboards and more.</h2>
          </div>
          <a href={href("/patterns")} className="category-link">
            View all patterns <ArrowRight size={14} strokeWidth={1.6} />
          </a>
        </div>
        <div className="crm-preview-grid">
          {patternPreviews.map((p) => (
            <a key={p.slug} href={href(`/patterns/${p.slug}`)} className="crm-preview-card">
              <div className="crm-preview-card__stage">{p.preview}</div>
              <div className="crm-preview-card__info">
                <p className="crm-preview-card__title">{p.title}</p>
                <p className="crm-preview-card__desc">{p.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}

import * as React from "react";
import { ArrowRight, Check, Copy, Package, Terminal, Zap } from "lucide-react";
import { Badge, Card } from "@heigin/ui";
import { href } from "../lib/router";
import { counts, primitives, patterns } from "../generated/catalog";
import { PageMeta } from "../components/PageMeta";
import { CodeBlock } from "../components/CodeBlock";
import { MarketingNav } from "../components/MarketingNav";
import { Footer } from "../components/Footer";

const FEATURED_SLUGS = ["button", "metric-card", "dialog", "approval-card", "switch", "page-header"];

export function Landing({ withChrome = false }: { withChrome?: boolean }) {
  return (
    <div className="landing" data-testid="landing">
      <PageMeta title="HeiGin UI — The design system for modern interfaces" description="Production-ready React components, patterns and templates with copyable source, npm distribution, and native MCP integration." ogType="website" />
      {withChrome && <MarketingNav />}
      <div>
        <Hero />
        <Showcase />
        <Workflow />
        <Philosophy />
        <PricingPreview />
        <FinalCta />
      </div>
      {withChrome && <Footer />}
    </div>
  );
}

function Hero() {
  const manifestCount = counts.primitives + counts.patterns;
  return (
    <section className="landing-hero" aria-labelledby="hero-h">
      <img
        src="/heigin-ui-hero-background.png"
        alt=""
        aria-hidden="true"
        width={1024}
        height={576}
        className="landing-hero__bg"
      />
      <div className="landing-hero__inner">
        <div className="landing-hero__copy">
          <p className="landing-hero__pill">React · TypeScript · Production ready</p>
          <h1 id="hero-h" className="landing-hero__title">
            Production-ready UI, ready to build with.
          </h1>
          <p className="landing-hero__lede">
            React components and CRM patterns, built from a live product. Preview components, inspect the API, then
            install the package or copy source.
          </p>
          <div className="landing-hero__actions">
            <a href={href("/components")} className="landing-btn landing-btn--primary">
              Browse components
            </a>
            <a href={href("/docs/getting-started")} className="landing-btn landing-btn--ghost">
              Get started
            </a>
          </div>
          <dl className="landing-hero__stats">
            <div className="landing-hero__stat">
              <dd>{counts.primitives}</dd>
              <dt>primitives</dt>
            </div>
            <div className="landing-hero__stat">
              <dd>{counts.patterns}</dd>
              <dt>CRM patterns</dt>
            </div>
            <div className="landing-hero__stat">
              <dd>{counts.tokens}</dd>
              <dt>design tokens</dt>
            </div>
            <div className="landing-hero__stat">
              <dd>{manifestCount}</dd>
              <dt>copyable manifests</dt>
            </div>
          </dl>
        </div>

        <div className="landing-hero__visual">
          <img
            src="/heigin-ui-hero-mockups.png"
            alt="Layered HeiGin UI windows showing the Components catalog, CRM patterns, and the Button Playground preview"
            width={1024}
            height={576}
            className="landing-hero__mockups"
          />
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const all = [...primitives, ...patterns];
  const featured = FEATURED_SLUGS.map((slug) => all.find((c) => c.name === slug)).filter(Boolean) as typeof all;
  return (
    <section className="landing-section" aria-labelledby="showcase-h">
      <header className="landing-section__head">
        <p className="eyebrow">Components</p>
        <h2 id="showcase-h">Primitives that behave the same way in every surface.</h2>
        <p className="muted">Every component is server-safe by default where it can be, client-rendered where it has to be, and token-driven throughout. Built on Base UI.</p>
      </header>
      <ul className="landing-grid landing-grid--cards">
        {featured.map((c) => {
          const base = c.category === "crm" ? "/patterns" : "/components";
          return (
            <li key={c.name}>
              <Card interactive padding="md" className="landing-card">
                <div className="landing-card__meta">
                  <Badge tone={c.license === "free" ? "success" : "warning"} dot>{c.license === "free" ? "Free" : c.license}</Badge>
                  <Badge tone="outline">{c.category === "crm" ? "Pattern" : "Primitive"}</Badge>
                </div>
                <h3 className="h4"><a href={href(`${base}/${c.name}`)} className="stretched-link">{c.title}</a></h3>
                <p className="muted small">{c.description}</p>
              </Card>
            </li>
          );
        })}
      </ul>
      <div className="landing-section__footer">
        <a href={href("/components")}>See all {counts.primitives + counts.patterns} components <ArrowRight size={14} aria-hidden /></a>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="landing-section landing-section--split" aria-labelledby="workflow-h">
      <header className="landing-section__head">
        <p className="eyebrow">Developer workflow</p>
        <h2 id="workflow-h">Install the way that fits your project.</h2>
        <p className="muted">Package install, copyable source with transitive dependencies, or MCP catalog lookup.</p>
      </header>
      <ul className="landing-workflow">
        <li>
          <Package size={20} aria-hidden />
          <h3 className="h4">Install the package</h3>
          <p className="muted small">
            Install from npm and import the token stylesheet once. Optional Tailwind v4 theme mapping is included.
          </p>
          <CodeBlock
            code={`npm install @heigin/ui\n\n// In your app entry:\nimport "@heigin/ui/styles.css";\n// Optional Tailwind v4:\n// @import "@heigin/ui/tailwind.css";`}
            label="Install"
          />
        </li>
        <li>
          <Copy size={20} aria-hidden />
          <h3 className="h4">Copy source</h3>
          <p className="muted small">
            Copy a component, its CSS module, and its transitive HeiGin dependencies directly into your project.
          </p>
          <CodeBlock
            code="node scripts/copy-component.mjs button --dest ./components/heigin"
            label="Copy source"
          />
        </li>
        <li>
          <Terminal size={20} aria-hidden />
          <h3 className="h4">MCP server</h3>
          <p className="muted small">
            Let your coding agent list components, search props and tokens, and generate copy-component commands.
          </p>
          <CodeBlock code="npx -y @heigin/mcp" label="Run MCP server" />
        </li>
      </ul>
    </section>
  );
}

function Philosophy() {
  const items: Array<{ title: string; body: string }> = [
    { title: "Built from production experience.", body: "Every primitive earns its place by surviving the HeiGin CRM. Tokens come from the live production stylesheet, with evidence tags per value." },
    { title: "Consistent design tokens.", body: `${counts.tokens} tokens for color, type, space, radius, shadow, focus, motion — ship as JSON, CSS variables, TypeScript, or Tailwind v4 theme.` },
    { title: "Accessible by default.", body: "Base UI underneath, focus-ring tokens that pass contrast, dialog focus trapped to Cancel on destructive actions, every surface keyboard-navigable." },
    { title: "Customisable architecture.", body: "Composition over configuration. Every primitive is a few files you can read; copyable-source if you'd rather own it." },
  ];
  return (
    <section className="landing-section" aria-labelledby="philosophy-h">
      <header className="landing-section__head">
        <p className="eyebrow">Design philosophy</p>
        <h2 id="philosophy-h">Mature developer tooling, not a marketing template.</h2>
      </header>
      <ul className="landing-grid landing-grid--two">
        {items.map((it) => (
          <li key={it.title}>
            <Check size={18} aria-hidden />
            <h3 className="h4">{it.title}</h3>
            <p className="muted small">{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PricingPreview() {
  const tiers: Array<{
    name: string;
    status: string;
    statusTone: "success" | "warning" | "outline";
    blurb: string;
    items: string[];
    cta: string;
    path: string;
    tone: "default" | "primary";
  }> = [
    {
      name: "Free · MIT",
      status: "Available now",
      statusTone: "success",
      blurb: "All public primitives, CRM patterns, tokens, and MCP tools.",
      items: [
        `${counts.primitives} UI primitives`,
        `${counts.patterns} CRM patterns`,
        `${counts.tokens} design tokens`,
        "npm install + copyable source + @heigin/mcp",
      ],
      cta: "Get started",
      path: "/docs/getting-started",
      tone: "primary",
    },
    {
      name: "Pro",
      status: "Proposed · Price TBD",
      statusTone: "warning",
      blurb: "Gated full-page templates and section bundles (checkout not yet enabled).",
      items: [
        "Everything in Free",
        `${counts.templates} landing template sections & bundles`,
        "Proposed multi-component blocks",
        "Price & checkout pending decision",
      ],
      cta: "View pricing details",
      path: "/pricing",
      tone: "default",
    },
    {
      name: "Team",
      status: "Proposed · Price TBD",
      statusTone: "outline",
      blurb: "Multi-developer commercial licensing for teams.",
      items: [
        "Everything in Pro",
        "Multi-developer team access (proposed)",
        "Commercial & client project rights",
        "Price & terms pending decision",
      ],
      cta: "View pricing details",
      path: "/pricing",
      tone: "default",
    },
  ];
  return (
    <section className="landing-section" aria-labelledby="pricing-h">
      <header className="landing-section__head">
        <p className="eyebrow">Pricing &amp; licensing</p>
        <h2 id="pricing-h">All components, patterns, and tokens are free.</h2>
        <p className="muted">
          Every primitive and CRM pattern is MIT-licensed in <code>source/licenses.json</code>. Paid tiers for the{" "}
          {counts.templates} template items are proposed and pending pricing configuration.
        </p>
      </header>
      <ul className="landing-grid landing-grid--three">
        {tiers.map((t) => (
          <li key={t.name}>
            <Card padding="lg" className={t.tone === "primary" ? "landing-tier landing-tier--primary" : "landing-tier"}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <h3 className="h4" style={{ margin: 0 }}>{t.name}</h3>
                <Badge tone={t.statusTone}>{t.status}</Badge>
              </div>
              <p className="muted small">{t.blurb}</p>
              <ul className="landing-tier__items">
                {t.items.map((i) => (<li key={i}><Check size={14} aria-hidden /> {i}</li>))}
              </ul>
              <a href={href(t.path)} className={t.tone === "primary" ? "landing-btn landing-btn--primary" : "landing-btn landing-btn--ghost"}>
                {t.cta}
              </a>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="landing-cta" aria-labelledby="cta-h">
      <Zap size={24} aria-hidden />
      <h2 id="cta-h">Open a component page and start copying.</h2>
      <p className="muted">No signup. No lock-in. The free tier is the actual library.</p>
      <div className="landing-hero__actions">
        <a href={href("/components")} className="landing-btn landing-btn--primary">
          Explore components <ArrowRight size={16} aria-hidden />
        </a>
        <a href={href("/docs/getting-started")} className="landing-btn landing-btn--ghost">
          Read the quickstart
        </a>
      </div>
    </section>
  );
}

import * as React from "react";
import { ArrowRight, Check, Copy, Package, Terminal, Zap } from "lucide-react";
import { Badge, Card } from "@heigin/ui";
import { href } from "../lib/router";
import { counts, primitives, patterns } from "../generated/catalog";
import { PageMeta } from "../components/PageMeta";
import { CodeBlock } from "../components/CodeBlock";

const FEATURED_SLUGS = ["button", "metric-card", "dialog", "approval-card", "switch", "page-header"];

export function Landing() {
  return (
    <div className="landing" data-testid="landing">
      <PageMeta title="HeiGin UI — The design system for modern interfaces" description="Production-ready React components, patterns and templates with copyable source, npm distribution, and native MCP integration." ogType="website" />
      <MarketingNavPlaceholder />
      <main>
        <Hero />
        <Showcase />
        <Workflow />
        <Philosophy />
        <PricingPreview />
        <FinalCta />
      </main>
      <FooterPlaceholder />
    </div>
  );
}

/* GEMINI: replace with MarketingNav from G2 when it lands. */
function MarketingNavPlaceholder() {
  const links: Array<[string, string]> = [
    ["/components", "Components"],
    ["/patterns", "Patterns"],
    ["/blocks", "Blocks"],
    ["/templates", "Templates"],
    ["/pricing", "Pricing"],
    ["/docs", "Docs"],
  ];
  return (
    <header className="landing__nav">
      <a href={href("/")} className="landing__brand" aria-label="HeiGin UI home">HeiGin UI</a>
      <nav aria-label="Primary">
        <ul>
          {links.map(([path, label]) => (
            <li key={path}><a href={href(path)}>{label}</a></li>
          ))}
        </ul>
      </nav>
      <div className="landing__nav-end">
        <a href="https://github.com/paragjha/HeiGin-Design-Library" rel="noreferrer noopener" target="_blank">GitHub</a>
      </div>
    </header>
  );
}

/* GEMINI: replace with Footer from G6 when it lands. */
function FooterPlaceholder() {
  return (
    <footer className="landing__footer">
      <p className="muted small">© {new Date().getFullYear()} HeiGin UI · MIT-licensed components · <a href={href("/docs")}>Documentation</a></p>
    </footer>
  );
}

function Hero() {
  return (
    <section className="landing-hero" aria-labelledby="hero-h">
      <p className="eyebrow">A design system extracted from production</p>
      <h1 id="hero-h" className="landing-hero__title">The design system for modern interfaces.</h1>
      <p className="landing-hero__lede">
        {counts.primitives} production-ready React primitives, {counts.patterns} CRM patterns, and a template catalog —
        with copyable source, npm distribution, and native MCP integration for coding agents.
      </p>
      <div className="landing-hero__actions">
        <a href={href("/components")} className="landing-btn landing-btn--primary">
          Explore components <ArrowRight size={16} aria-hidden />
        </a>
        <a href={href("/templates")} className="landing-btn landing-btn--ghost">
          Browse templates
        </a>
      </div>
      <dl className="landing-hero__stats">
        <div><dt>Primitives</dt><dd>{counts.primitives}</dd></div>
        <div><dt>CRM patterns</dt><dd>{counts.patterns}</dd></div>
        <div><dt>Design tokens</dt><dd>{counts.tokens}</dd></div>
        <div><dt>MCP tools</dt><dd>{counts.mcpTools}</dd></div>
      </dl>
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
        <p className="muted">One library, three distribution paths. Pick one — or mix.</p>
      </header>
      <ul className="landing-workflow">
        <li>
          <Package size={20} aria-hidden />
          <h3 className="h4">npm</h3>
          <p className="muted small">Install the full library as a dependency. Tree-shakeable; dark-mode-first.</p>
          <CodeBlock code="npm install @heigin/ui" label="Install" />
        </li>
        <li>
          <Copy size={20} aria-hidden />
          <h3 className="h4">Copyable source</h3>
          <p className="muted small">Copy a component and its dependency tree into your project. shadcn-compatible.</p>
          <CodeBlock code="npx shadcn@latest add https://ui.heigin.com/r/button.json" label="Copy source" />
        </li>
        <li>
          <Terminal size={20} aria-hidden />
          <h3 className="h4">MCP server</h3>
          <p className="muted small">Let your coding agent read the catalog, props, and tokens directly.</p>
          <CodeBlock code="npx @heigin/mcp" label="Run MCP server" />
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
  const tiers: Array<{ name: string; blurb: string; items: string[]; cta: string; path: string; tone: "default" | "primary" }> = [
    { name: "Free", blurb: "Everything public. Forever.", items: [`${counts.primitives} primitives`, `${counts.patterns} CRM patterns`, "Copyable source", "npm + MCP"], cta: "Get started", path: "/getting-started", tone: "default" },
    { name: "Pro", blurb: "Premium patterns, blocks, and templates.", items: ["Everything in Free", "Pro patterns & blocks", "All templates", "Priority updates"], cta: "See Pro", path: "/pricing", tone: "primary" },
    { name: "Team", blurb: "For teams building on top.", items: ["Everything in Pro", "Seats & SSO", "Private npm scope", "Support SLA"], cta: "Contact sales", path: "/pricing", tone: "default" },
  ];
  return (
    <section className="landing-section" aria-labelledby="pricing-h">
      <header className="landing-section__head">
        <p className="eyebrow">Pricing</p>
        <h2 id="pricing-h">Public components stay free. Paid work funds the premium catalog.</h2>
      </header>
      <ul className="landing-grid landing-grid--three">
        {tiers.map((t) => (
          <li key={t.name}>
            <Card padding="lg" className={t.tone === "primary" ? "landing-tier landing-tier--primary" : "landing-tier"}>
              <h3 className="h4">{t.name}</h3>
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

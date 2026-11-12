import { ArrowRight, Blocks, BookOpen, Copy, Layers, Palette, Plug } from "lucide-react";
import { Card } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import { counts } from "../generated/catalog";
import { href } from "../lib/router";

const QUICK_LINKS = [
  {
    icon: BookOpen,
    title: "Getting Started",
    desc: "Install @heigin/ui via npm, configure the shadcn registry, or set up Next.js integration.",
    path: "/docs/getting-started",
    cta: "Read the guide",
  },
  {
    icon: Layers,
    title: "Components",
    desc: `Browse all ${counts.primitives} UI primitives and ${counts.patterns} CRM patterns organized by category.`,
    path: "/components",
    cta: "Browse components",
  },
  {
    icon: Plug,
    title: "MCP Server",
    desc: `Connect your coding agent to @heigin/mcp (${counts.mcpTools} tools) to inspect tokens, manifests, and source.`,
    path: "/docs/mcp",
    cta: "Configure MCP",
  },
] as const;

const DOCS_SECTIONS = [
  {
    icon: Palette,
    title: "Design Tokens",
    desc: `${counts.tokens} tokens for colors, typography, spacing, shadows, and motion extracted from production.`,
    path: "/docs/tokens",
    arrow: "Explore tokens",
  },
  {
    icon: Copy,
    title: "Copyable Source",
    desc: "Copy any component with its full dependency tree into your project.",
    path: "/docs/copy-source",
    arrow: "Learn how",
  },
  {
    icon: Blocks,
    title: "CRM Patterns",
    desc: `${counts.patterns} domain-specific patterns composed from our primitives.`,
    path: "/patterns",
    arrow: "View patterns",
  },
] as const;

export function DocsOverviewPage() {
  return (
    <article className="page" data-testid="docs-overview-page">
      <PageMeta
        title="Documentation"
        description={`HeiGin UI documentation — guides, ${counts.tokens} design tokens, ${counts.primitives} primitives, ${counts.patterns} CRM patterns, and MCP integration.`}
        path="/docs"
      />

      <header className="page__header">
        <p className="eyebrow">Documentation</p>
        <h1>HeiGin UI Documentation</h1>
        <p className="lede">
          Guides, design tokens, accessibility architecture, and agent tooling for building consistent interfaces with{" "}
          <code>@heigin/ui</code>.
        </p>
      </header>

      <section aria-labelledby="docs-quick-links" style={{ marginTop: "var(--hg-space-6)" }}>
        <h2 id="docs-quick-links" className="h4" style={{ marginBottom: "var(--hg-space-4)" }}>
          Start here
        </h2>
        <div className="feature-grid">
          {QUICK_LINKS.map((item) => (
            <a key={item.path} href={href(item.path)} className="feature-card">
              <div className="feature-card__icon">
                <item.icon size={18} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <span className="feature-card__title">{item.title}</span>
              <p className="feature-card__desc">{item.desc}</p>
              <span className="feature-card__arrow">
                {item.cta} <ArrowRight size={13} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="docs-foundations" style={{ marginTop: "var(--hg-space-8)" }}>
        <h2 id="docs-foundations" className="h4" style={{ marginBottom: "var(--hg-space-4)" }}>
          Foundations &amp; Architecture
        </h2>
        <div className="feature-grid">
          {DOCS_SECTIONS.map((sec) => (
            <a key={sec.path} href={href(sec.path)} className="feature-card">
              <div className="feature-card__icon">
                <sec.icon size={18} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <span className="feature-card__title">{sec.title}</span>
              <p className="feature-card__desc">{sec.desc}</p>
              <span className="feature-card__arrow">
                {sec.arrow} <ArrowRight size={13} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="docs-guides" style={{ marginTop: "var(--hg-space-8)" }}>
        <h2 id="docs-guides" className="h4" style={{ marginBottom: "var(--hg-space-4)" }}>
          Guides &amp; Reference
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--hg-space-3)",
          }}
        >
          {[
            { label: "Colors", path: "/docs/tokens/colors", desc: "Semantic ink, surface, border, and status palettes." },
            { label: "Typography", path: "/docs/tokens/typography", desc: "Font families, scale, weights, and tabular numerals." },
            { label: "Spacing & layout", path: "/docs/tokens/spacing", desc: "Spacing scale, radii, control heights, and z-index layers." },
            { label: "Accessibility", path: "/docs/accessibility", desc: "WCAG 2.2 AA compliance, keyboard patterns, and contrast fixes." },
            { label: "Next.js integration", path: "/docs/nextjs", desc: "App Router setup, server/client boundaries, and CSS imports." },
            { label: "Changelog", path: "/docs/changelog", desc: "Release history and migration notes for @heigin/ui." },
          ].map((guide) => (
            <Card key={guide.path} interactive padding="md">
              <a
                href={href(guide.path)}
                className="stretched-link"
                style={{ fontWeight: 600, fontSize: "var(--hg-font-size-sm)" }}
              >
                {guide.label}
              </a>
              <p className="muted small" style={{ margin: "4px 0 0" }}>
                {guide.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </article>
  );
}

export default DocsOverviewPage;

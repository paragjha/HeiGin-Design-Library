import { Badge } from "@heigin/ui";
import { Callout } from "../components/Callout";
import { Snippet } from "../components/Snippet";
import { href } from "../lib/router";
import { listManifests } from "../lib/source";

export function AccessibilityPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>Accessibility</h1>
        <p className="lede">The target is WCAG 2.2 AA. Every component has keyboard and axe-core tests, and complex widgets are built on Base UI.</p>
      </header>
      <section aria-labelledby="rules-h">
        <h2 id="rules-h">Rules every component follows</h2>
        <ul className="prose-list">
          <li>Semantic HTML first: native buttons, labels, tables, lists, nav and time elements.</li>
          <li>
            Visible keyboard focus everywhere: a 2px <code className="inline-code">#3b82f6</code> outline at 1px offset (the same as production). Focus is
            never removed without a replacement.
          </li>
          <li>Dialogs and drawers trap focus and restore it to the trigger. Escape closes every overlay.</li>
          <li>Status is never colour alone: badges carry words, the SLA clock and trends carry words, and charts and stages describe themselves.</li>
          <li>Touch targets are 44px below 768px, matching production.</li>
          <li>All motion stops under prefers-reduced-motion.</li>
          <li>Icon-only controls require a label (IconButton makes it a required prop).</li>
        </ul>
      </section>
      <section aria-labelledby="deviations-h">
        <h2 id="deviations-h">Where we fix production on purpose</h2>
        <p>These are deliberate changes from the live CRM, each recorded as a proposed token so it can be reviewed:</p>
        <div className="table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Issue in production</th>
                <th scope="col">Measured</th>
                <th scope="col">HeiGin UI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Success text #16a34a on #f0fdf4</td>
                <td>3.15:1 (fails AA)</td>
                <td>
                  <code>success-ink #15803d</code> 4.79:1 <Badge tone="warning" size="sm">proposed</Badge>
                </td>
              </tr>
              <tr>
                <td>Danger text #dc2626 on #fef2f2</td>
                <td>4.41:1 (fails AA for small text)</td>
                <td>
                  <code>danger-ink #b91c1c</code> 5.91:1 <Badge tone="warning" size="sm">proposed</Badge>
                </td>
              </tr>
              <tr>
                <td>Focused input border #dcdcdc</td>
                <td>1.37:1 against white</td>
                <td>
                  <code>input-focus-border #737373</code> 4.62:1, keeping the soft 3px ring <Badge tone="warning" size="sm">proposed</Badge>
                </td>
              </tr>
              <tr>
                <td>Faint text #a3a3a3</td>
                <td>2.52:1</td>
                <td>Used only for placeholders and decoration, never for meaningful text.</td>
              </tr>
              <tr>
                <td>Muted text #737373 on sidebar #f7f7f7</td>
                <td>4.43:1</td>
                <td>Kept as observed. Sidebar labels are 13px/500; flagged for review in the design audit.</td>
              </tr>
              <tr>
                <td>Resting input border #ebebeb</td>
                <td>1.19:1 (below the 3:1 non-text target)</td>
                <td>Kept as observed for fidelity. Fields still have labels and a card shadow; flagged in the design audit.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="notes-h">
        <h2 id="notes-h">Notes on primitives</h2>
        <ul className="prose-list">
          <li>
            Toast: Base UI hides the close button from screen readers until the toast region is focused. Press F6 to reach notifications. Danger toasts are
            announced assertively.
          </li>
          <li>Table: <code className="inline-code">onRowClick</code> is a mouse shortcut. Always keep a real link or button in the row.</li>
          <li>Tooltip: never the only accessible name. IconButton still sets aria-label.</li>
        </ul>
      </section>
    </article>
  );
}

export function NextjsPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>Next.js integration</h1>
        <p className="lede">
          HeiGin UI works with the App Router. Interactive components ship with <code className="inline-code">"use client"</code>; display components
          stay server-safe.
        </p>
      </header>
      <Snippet
        label="app/layout.tsx (Server Component)"
        code={`import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "@heigin/ui/styles.css";
import "@heigin/ui/base.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}`}
      />
      <Snippet
        label="app/leads/page.tsx (Server Component using server-safe pieces)"
        code={`import { Badge, Card, MetricCard, MoneyValue, PageHeader } from "@heigin/ui";
import { LeadActions } from "./lead-actions"; // a Client Component

export default async function LeadsPage() {
  const pipeline = 23100000; // fetched on the server
  return (
    <>
      <PageHeader title="Leads" actions={<LeadActions />} />
      <MetricCard label="Open pipeline" value={<MoneyValue amount={pipeline} format="compact" />} />
      <Card><Badge tone="success">Qualified</Badge></Card>
    </>
  );
}`}
      />
      <h2>Which components need the client?</h2>
      <div className="table-scroll">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Rendering</th>
            </tr>
          </thead>
          <tbody>
            {listManifests().map((m) => (
              <tr key={m.name}>
                <td>
                  <code>{m.name}</code>
                </td>
                <td>{m.client ? <Badge tone="info">Client ("use client")</Badge> : <Badge tone="success">Server-safe</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        You can render a client component from a Server Component, but you cannot pass it functions (such as <code>onClick</code>) from there. Put
        interactive wiring in your own <code>"use client"</code> file. A full example app lives in <code>apps/nextjs-example</code>.
      </p>
    </article>
  );
}

export function CopySourcePage() {
  const manifests = listManifests();
  return (
    <article className="page">
      <header className="page__header">
        <h1>Copyable source</h1>
        <p className="lede">
          Every component can be copied into your repo with exactly the files it needs. A script builds the manifests from the import graph, so a missing
          dependency fails the build.
        </p>
      </header>
      <Snippet label="Copy components" lang="bash" code="node scripts/copy-component.mjs approval-card --dest ../my-app/components/heigin" />
      <Snippet label="See what would be copied" lang="bash" code="node scripts/copy-component.mjs table --dest ./x --dry-run" />
      <Callout tone="info" title="What you get">
        Files keep the same layout as <code>packages/ui/src</code>, so their relative imports keep working. Existing files are never overwritten without{" "}
        <code>--force</code>. Afterwards, import <code>styles/tokens.css</code> once and install the npm packages the script prints. Next.js and Vite
        support CSS Modules out of the box.
      </Callout>
      <h2>Manifests</h2>
      <div className="table-scroll">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Files</th>
              <th scope="col">HeiGin dependencies</th>
              <th scope="col">npm</th>
            </tr>
          </thead>
          <tbody>
            {manifests.map((m) => (
              <tr key={m.name}>
                <td>
                  <code>{m.name}</code>
                </td>
                <td>{m.files.length + 1}</td>
                <td className="small">{m.internalDependencies.join(", ") || "—"}</td>
                <td className="small">{m.install.join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Manifest JSON lives in <code>source/manifests/</code>. Each component page has an Install tab with its file list and copy command. See also{" "}
        <a href={href("/getting-started")}>Getting started</a>.
      </p>
    </article>
  );
}

type BannerColor = "blue" | "teal" | "green" | "gold" | "purple" | "grey";

interface ChangelogEntry {
  pkg: "@heigin/ui" | "@heigin/mcp";
  version: string;
  name: string;
  date: string;
  color: BannerColor;
  improvements?: string[];
  fixes?: string[];
  breaking?: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    pkg: "@heigin/ui",
    version: "0.2.0",
    name: "trust-me-its-better",
    date: "Oct 26, 2026",
    color: "gold",
    improvements: [
      "Showcase gallery (18 components): avatar circles, border beam, rainbow button, animated terminal, file tree, audio bar visualizer, shimmering text, integration beam, cursor-reactive particles, dot-matrix orb, agent orbs, dotted globe, rotating icon cloud, flicker grid with shapes, rotating glyph matrix, image-stream hero, live waveform and agent conversation bar. Every entry is a standalone React/TypeScript file you can copy, with light and dark themes and prefers-reduced-motion handling.",
      "Components tab layout: the gallery lives under Components with HeiGin Tabs for filtering (All, Marketing, Dev UI, Agent UI, Uploads) and renders only the active tab's items so canvas-heavy demos don't mount more than once.",
      "Builder UX pass: tabbed left panel (Blocks + Outline each own their scroll), viewport presets above the canvas (Desktop / Tablet 768px / Mobile 390px), one-click Grid column-layout presets (Sidebar+content, Content+sidebar, Equal halves, Thirds, Content+rail), and draggable column dividers that rebalance a Grid and write the pixel widths back to the generated code.",
    ],
    fixes: [
      "Rainbow button stays dark in dark mode (the background was flipping to a light grey when --hg-color-ink inverted) and the beam variant now paints a visible multi-colour arc instead of a thin sliver.",
      "Shimmering text is visible in both themes — the slot's color:transparent was making the gradient's currentColor stops transparent too, so only the single highlight stop painted; the base and highlight are now explicit variables.",
      "Rotating glyph matrix actually draws — the rAF callback's first timestamp could precede the start it was captured against, so idxA went negative and the frame returned before any paint. Elapsed is now clamped to zero.",
    ],
  },
  {
    pkg: "@heigin/mcp",
    version: "0.1.3",
    name: "search-stopped-exploding",
    date: "Oct 25, 2026",
    color: "purple",
    fixes: ["search tool no longer crashes when a token has no description."],
  },
  {
    pkg: "@heigin/mcp",
    version: "0.1.2",
    name: "npm-said-no-so-we-tried-again",
    date: "Oct 25, 2026",
    color: "purple",
    improvements: [
      "Added repository metadata so npm can verify provenance from GitHub Actions.",
      "Published through trusted publishing (OIDC) with provenance — no long-lived npm token in the repo.",
    ],
  },
  {
    pkg: "@heigin/mcp",
    version: "0.1.0",
    name: "it-works-on-my-machine",
    date: "Oct 25, 2026",
    color: "purple",
    improvements: [
      "First release of the MCP server for coding agents.",
      "Six tools: list_components, get_component, get_tokens, search, get_setup_guide, copy_component_command.",
      "Works with Claude Code, Cursor, VS Code Copilot and Claude Desktop over stdio.",
      "Bundles the component manifests, props and tokens so the published package is self-contained.",
    ],
  },
  {
    pkg: "@heigin/ui",
    version: "0.1.1",
    name: "we-fixed-some-stuff",
    date: "Oct 23, 2026",
    color: "blue",
    improvements: [
      "Full dark-mode support across all components and documentation.",
      "Command palette search with keyboard navigation (Ctrl+K / ⌘K).",
      "Live component previews on the component index cards.",
      "Hero showcase image on the overview page.",
      "Redesigned changelog with timeline layout.",
    ],
    fixes: [
      "Fixed text visibility in dark mode across playground controls and code blocks.",
      "Code blocks now use theme-aware syntax highlighting (github-light / github-dark).",
      "Fixed search shortcut display — shows Ctrl+K on Windows, ⌘K on Mac.",
    ],
  },
  {
    pkg: "@heigin/ui",
    version: "0.1.0",
    name: "stolen-from-production",
    date: "Sep 27, 2026",
    color: "teal",
    improvements: [
      "First token set, taken from the production stylesheet of the live CRM.",
      `${listManifests().filter((m) => m.category === "ui").length} primitives built on Base UI.`,
      `${listManifests().filter((m) => m.category === "crm").length} CRM patterns composed from the primitives.`,
      "Copy-source manifests and the copy script.",
      "Documentation site with live previews, props tables, and accessibility notes.",
      "Next.js example app with server and client components.",
    ],
  },
];

export function ChangelogPage() {
  return (
    <article className="page changelog-page">
      <div className="changelog-hero">
        <img src="./changelog-light.webp" alt="" className="changelog-hero__bg changelog-hero__bg--light" />
        <img src="./changelog-dark.webp" alt="" className="changelog-hero__bg changelog-hero__bg--dark" />
        <div className="changelog-hero__content">
          <p className="changelog-hero__label">Changelog</p>
          <h1 className="changelog-hero__title">What's new?</h1>
        </div>
      </div>
      <p className="changelog-intro">
        A changelog of the latest <strong>HeiGin UI</strong> and <strong>@heigin/mcp</strong> feature releases, component updates, and important fixes.
      </p>
      <div className="changelog-timeline">
        {CHANGELOG.map((entry) => (
          <div key={`${entry.pkg}-${entry.version}`} className="changelog-entry">
            <div className="changelog-entry__date">
              <span className="changelog-entry__dot" />
              <span>{entry.date}</span>
            </div>
            <div className="changelog-entry__card">
              <div className={`changelog-entry__header changelog-entry__header--${entry.color}`}>
                <img src="./changelog-light.webp" alt="" className="changelog-entry__header-bg changelog-entry__header-bg--light" />
                <img src="./changelog-dark.webp" alt="" className="changelog-entry__header-bg changelog-entry__header-bg--dark" />
                <div className="changelog-entry__header-tint" />
                <div className="changelog-entry__header-content">
                  <div className="changelog-entry__meta">
                    <span className="changelog-entry__pkg">{entry.pkg}</span>
                    <h2 className="changelog-entry__version">
                      v{entry.version} — <em>{entry.name}</em>
                    </h2>
                  </div>
                  <span className="changelog-entry__version-badge">{entry.version}</span>
                </div>
              </div>
              {entry.improvements && (
                <div className="changelog-entry__section">
                  <h3>Improvements &amp; Changes</h3>
                  <ul>
                    {entry.improvements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.fixes && (
                <div className="changelog-entry__section">
                  <h3>Bugfixes</h3>
                  <ul>
                    {entry.fixes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.breaking && (
                <div className="changelog-entry__section">
                  <h3>Breaking Changes</h3>
                  <ul>
                    {entry.breaking.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function NotFoundPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>Page not found</h1>
        <p className="lede">
          That page does not exist. Go to the <a href={href("/")}>overview</a> or <a href={href("/components")}>all components</a>.
        </p>
      </header>
    </article>
  );
}

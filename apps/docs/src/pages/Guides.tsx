import type { CSSProperties } from "react";
import { Badge, SectionIndex } from "@heigin/ui";
import { Callout } from "../components/Callout";
import { CopyButton } from "../components/CopyButton";
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

/** Backdrop photos for release figures, in apps/docs/public/changelog-art/. */
type ChangelogImage = "hills" | "desk-field" | "ribbed-ember" | "coupe" | "ribbed-magenta" | "wave-grain";

interface ChangelogEntry {
  pkg: "@heigin/ui" | "@heigin/mcp" | "ui.heigin.com";
  version: string;
  name: string;
  date: string;
  /** ISO date for the <time> element. */
  dateTime: string;
  /** Recent releases get a figure: a screenshot of the release's flagship piece in a glass frame over this photo. */
  image?: ChangelogImage;
  /** The flagship screenshot (in apps/docs/public/changelog-art/previews/) and the page it links to. */
  preview?: { src: string; alt: string; href: string };
  improvements?: string[];
  fixes?: string[];
  breaking?: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    pkg: "ui.heigin.com",
    version: "2026.11.28",
    name: "five-more-motions",
    date: "Nov 28, 2026",
    dateTime: "2026-11-28",
    image: "ribbed-ember",
    preview: { src: "motion-orbit-gallery", alt: "The orbit gallery motion section: ten photos in soft rounded shapes circling the headline Every channel, one inbox", href: "/templates/motion-orbit-gallery" },
    improvements: [
      "Five more motion sections, for sixteen in all. A horizon gradient, where a dark section rises over the page like the night side of a planet with sunrise on its edge, then lifts away as a glow. A pixel wipe, where a dark hero breaks into square cells that flip to the light section underneath. An orbit gallery, a ring of photos in hand-cut shapes that turns as you scroll and can be thrown round. A gradient footer whose brand name always fills the width. And a morphing island, a capsule that names the section you're in and grows into a section list and a detail card.",
      "Still no animation library: the horizon and the pixel wipe each draw on one canvas, the orbit's stretch runs through a small spring, and the island's grows overshoot by the same few pixels however far they go.",
      "Two full landing pages join the launch templates. A dark agents page, where a product window rises as it scrolls in and a new agent run arrives every few seconds, with four small live demos and feature rows that float a HeiGin panel over a photo. And a light platform page on hairline grid lines, with a product tour whose tabs advance on their own, a grid of agents that show their job on hover, a feature slider and a testimonial switcher.",
      "Every product shot on both pages is a live HeiGin component with sample data, not a screenshot. The testimonials are placeholders to replace with quotes your customers have approved.",
      "Image slots ship empty and draw soft gradients; the photos in the previews are not part of the download. Paid, not on sale yet, like the other templates.",
    ],
  },
  {
    pkg: "@heigin/ui",
    version: "0.4.0",
    name: "dashboard",
    date: "Nov 28, 2026",
    dateTime: "2026-11-28",
    image: "wave-grain",
    improvements: [
      "New component, App sidebar: a two-level sidebar with an icon rail for top-level areas and a collapsible panel for the current area's pages. The rail links have tooltips and the panel has tree-structured groups with optional counts and add buttons. It collapses to leave the rail visible and uses inert on the hidden panel to block focus. Renders as two navs with aria-labels and aria-current on the active link.",
      "Workspace switcher now accepts a stacked variant that shows the workspace name over the caption, borderless, without the mark.",
      "New dashboard template: an app frame (DashboardShell) with the two-level sidebar, a workspace switcher, an upgrade card and a drawer on phones, plus an assistant home page (DashboardHome) with a greeting, recently viewed files, a meeting to summarize, suggested tasks, a searchable and sortable task list, and an ask bar.",
    ],
  },
  {
    pkg: "@heigin/ui",
    version: "0.3.0",
    name: "make-some-room",
    date: "Nov 26, 2026",
    dateTime: "2026-11-26",
    image: "desk-field",
    preview: { src: "storage-scanner", alt: "Storage scanner: 357.8 GB of 512 GB used, a bar of coloured dot segments with Calls lit up, and a suggestion to delete old exports", href: "/components/storage-scanner" },
    improvements: [
      "New component, Storage scanner: the space used, a bar of colourful dot-matrix segments (one per category) and a footer that suggests what to clear. While it scans, the bar grows behind a glowing edge and the path being read ticks past; while it clears, sparks fly off the shrinking segment. Hover, focus or tap a category to light up its segment and read what's in it. It follows the light or dark theme.",
      "Section index, the tick-per-section navigation this changelog uses, is now in the package too.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.24.2",
    name: "pricing-and-careers",
    date: "Nov 24, 2026",
    dateTime: "2026-11-24",
    image: "ribbed-magenta",
    preview: { src: "launch-careers", alt: "The careers page template: a banner of flickering grey pixels showing a car in a field, above the People intro", href: "/templates/launch-careers" },
    improvements: [
      "Add-on pricing page: one plan card with the list price struck through beside the discounted price and a switch per add-on. Each switch raises both prices, and every digit scrolls to its new value like an odometer. The add-on's own 3D icons slide out from behind the card while the rest of the pile swells. A question list follows.",
      "Careers page: it opens on a full-bleed banner that redraws a photo as a grid of flickering grey pixels, then a People intro, values that stack as you scroll, and the crew as a list beside a portrait grid where hovering a name lights that person and dims the rest. Open roles follow, with closed roles dimmed and a fine hatch behind the row under the pointer, then a contact band.",
      "Prices, the crew and the roles are sample content. The preview's photos and 3D icons (Microsoft Fluent Emoji, MIT) are not part of the download. Paid, not on sale yet, like the other templates.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.24",
    name: "launch-pages",
    date: "Nov 24, 2026",
    dateTime: "2026-11-24",
    image: "hills",
    preview: { src: "launch-waitlist", alt: "The waitlist page template: photo tiles around a sketched tile, a headline with highlighted words and an email form", href: "/templates/launch-waitlist" },
    improvements: [
      "Launch page templates: a waitlist page whose highlighted words swap when tapped, a changelog page with each release's date pinned beside it, a blue closing call to action with pixel hearts rising from a photo, and a hero whose prompt types itself over a landscape. Each installs on its own and reads its copy from one config file.",
      "The changelog template's figures are live HeiGin components (an approval card, the shared inbox, pipeline metrics, an activity timeline), not screenshots. The photos in the previews are not part of the download. Paid, not on sale yet, like the other templates.",
      "This changelog page uses the same design: each release keeps its date pinned at the left while its notes scroll past.",
      "New component, Section index: a tick per section at the left edge that opens into a list of them on hover or focus. It marks the release you're reading on this page and ships in the next @heigin/ui release.",
      "The waitlist page's header has a Join the waitlist button where the language switch was. It puts the cursor in the email field.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.21",
    name: "motion-sections",
    date: "Nov 21, 2026",
    dateTime: "2026-11-21",
    image: "wave-grain",
    preview: { src: "motion-hover-index", alt: "The hover index motion section: a list of HeiGin areas with one highlighted beside its photo", href: "/templates/motion-hover-index" },
    improvements: [
      "Motion section templates: eleven sections built around one motion idea each, in HeiGin's own style. Rolling pricing, stacking cards, a fly-in hero, a floating navbar, a process rail, a two-panel drawer menu, a hover index, a diagonal gallery, a feature dialog, a scaling photo slider and a line-by-line text reveal.",
      "No animation library: everything runs on CSS transitions, the Web Animations API and the browser's frame loop. Each section installs on its own and reads its copy and images from one config file.",
      "Every section has its own preview. Image slots ship empty and draw soft gradients; the photos and HeiGin screenshots in the previews are not part of the download. Paid, not on sale yet, like the other templates.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.18",
    name: "agents-and-heroes",
    date: "Nov 18, 2026",
    dateTime: "2026-11-18",
    image: "coupe",
    preview: { src: "hero-archive", alt: "The archive hero template: a HeiGin product window with a live agent panel", href: "/templates/hero-archive" },
    improvements: [
      "Pages for the new agent components — Agent task trail, Agent decision tree, Agent thinking — plus Type motion, Loader and HeiGin mark, each with a playground and a live example. The examples show real service logos (Iconify logos set, CC0).",
      "Hero section templates: a studio portfolio wall of case-study covers, a product window over a drifting archive with a live agent panel, and a dark dashboard that settles into place. They carry the HeiGin brand; the wall's case studies and client logos are sample content to replace. Paid, not on sale yet, like the landing template.",
      "The Templates page groups templates by family.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.15",
    name: "community-components",
    date: "Nov 15, 2026",
    dateTime: "2026-11-15",
    image: "ribbed-magenta",
    preview: { src: "ai-tool-approval", alt: "The AI Tool Approval community component: a request to run a test command, with Deny and Allow buttons", href: "/components/ai-tool-approval" },
    improvements: [
      "22 community components from Kokonut UI (MIT) now have their own pages under Components: 14 AI components, 4 cards, 3 navigation components and a synced transcript. Each page has a live preview, the shadcn install command, usage, the props tables and the full source. They are separate from the @heigin/ui package and do not change the library counts.",
      "Previews render in an isolated frame with its own Tailwind CSS v4 build and Geist, the environment the components were written for, so they look the way their authors built them. The frame follows the docs light and dark theme.",
      "AI State Loading, AI Tool Approval and AI Tool Calls show ThinkingOrb where the originals show a spinner. Every other file is unchanged from Kokonut's registry, and all keep their license headers.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.12",
    name: "trailing-cleanups",
    date: "Nov 12, 2026",
    dateTime: "2026-11-12",
    fixes: [
      "MCP page said 30 primitives and 17 CRM patterns in prose. It now reads from the generated catalog, so it matches the rest of the site (31 primitives, 18 patterns today).",
      "CI typecheck failed because apps/docs/src/generated/catalog.ts is gitignored and no step built it before tsc ran. The docs package now runs the catalog builder in a pretypecheck hook.",
      "Browser tests still used /#/ hash routes and the old \"Foundations\" sidebar name; they now use path routes and \"Docs\". The Playground tests are skipped while the builder is hidden.",
      "Next.js 16.4.0 in the example app stopped the build with a SecurityFatalError. Bumped to 16.4.6 (inside the existing ^16.4.0 range), which covers three critical advisories (two unauthenticated RCEs, one DoS) — lockfile-only change.",
    ],
  },
  {
    pkg: "ui.heigin.com",
    version: "2026.11.10",
    name: "we-audited-ourselves",
    date: "Nov 10, 2026",
    dateTime: "2026-11-10",
    improvements: [
      "Template catalog: the heigin.com landing page is now listed under Templates as one full page, 11 sections (header, hero with product demo, logo strip, workflow grid, integrations, deep dives, newsroom, testimonials, FAQ, closing banner, footer) and 3 bundles. Each has a live preview, its files and dependencies, setup steps, responsive notes and the content you replace. All template code is paid and not on sale yet; the registry answers those items with 402 and no source.",
      "Registry: every component, pattern and the tokens are installable with the shadcn CLI from ui.heigin.com/r, alongside npm and copy-source. Component pages show all three install options.",
      "New component, Thinking orb: a dotted orb for agent activity with nine states (working, searching, solving, listening, connecting, weaving, composing, breathing, shaping) at 64, 32 and 20px. It wraps the MIT-licensed thinking-orbs package by Jakub Antalik and ships in the next @heigin/ui release.",
      "Real page URLs: /components/button instead of /#/components/button, with a title, description and canonical link per page, a sitemap and robots.txt.",
      "Sidebar regrouped into Components, Patterns, Templates, Pricing, MCP and Docs, each with an icon. New Templates and Pricing pages.",
      "Every count on the site (primitives, patterns, tokens, MCP tools) is generated from the manifests at build time, and a release check fails the build if the site, the package and the registry disagree.",
    ],
    fixes: [
      "The site said 27 primitives and 13 patterns; the library has 31 and 18. The numbers now come from the source.",
      "MCP get_tokens skipped nested font tokens and returned 97 of 128. It now returns all of them.",
      "NativeSelect was documented but not exported from @heigin/ui. It is exported in the next release.",
      "Getting started no longer says the package is unpublished.",
      "The Playground is switched off while it is being finished, and the Star on GitHub button is gone from the sidebar.",
    ],
  },
  {
    pkg: "@heigin/ui",
    version: "0.2.0",
    name: "trust-me-its-better",
    date: "Nov 18, 2026",
    dateTime: "2026-11-18",
    image: "ribbed-ember",
    preview: { src: "agent-task-trail", alt: "Agent task trail: an agent's steps for fixing a checkout crash, waiting for approval to open a pull request", href: "/patterns/agent-task-trail" },
    improvements: [
      "Agent patterns: AgentTaskTrail (a live step timeline with sub-steps and an approval gate), AgentDecisionTree (a queue of decisions drawn as a tree, with number keys scoped to the tree) and AgentThinking (a thinking timer, steps and a dithered dot visual, then the answer).",
      "Loader: one indicator with a choice of style, the thinking orb (default) or a spinner. The agent patterns take the same choice through a loader prop.",
      "TypeMotion: a headline whose letters turn into artwork under the pointer, with eight effects and HeiGin orbs, symbols and the mark as default artwork.",
      "HeiGinMark: the HeiGin mark on its tile or bare, used as the default agent icon.",
      "New CRM pattern — Workspace switcher: a sidebar tenant picker so a user with access to more than one HeiGin workspace (their own org + any shared in from outside) can switch without signing out and re-entering a subdomain. Compact trigger shows the active workspace; the popover groups the rest into Your workspaces and External, with a search input, optional New workspace row and View all footer.",
      "Avatar now takes a shape prop (circle for people, square for company logos / tenant marks) and an optional tinted prop that colours the initials disc from a soft 10-tint palette keyed off the name hash, so the same person or company always picks the same colour across tables and lists.",
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
    version: "0.1.4",
    name: "agents-learned-to-wait",
    date: "Nov 18, 2026",
    dateTime: "2026-11-18",
    image: "desk-field",
    preview: { src: "mcp", alt: "The MCP server docs page with the quick-start config for Claude Code", href: "/mcp" },
    improvements: ["Knows the new components: list_components, get_component, search and copy_component_command cover AgentTaskTrail, AgentDecisionTree, AgentThinking, TypeMotion, Loader and HeiGinMark."],
  },
  {
    pkg: "@heigin/mcp",
    version: "0.1.3",
    name: "search-stopped-exploding",
    date: "Oct 25, 2026",
    dateTime: "2026-10-25",
    fixes: ["search tool no longer crashes when a token has no description."],
  },
  {
    pkg: "@heigin/mcp",
    version: "0.1.2",
    name: "npm-said-no-so-we-tried-again",
    date: "Oct 25, 2026",
    dateTime: "2026-10-25",
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
    dateTime: "2026-10-25",
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
    dateTime: "2026-10-23",
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
    dateTime: "2026-09-27",
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

const SECTIONS = [
  ["improvements", "Improvements & changes"],
  ["fixes", "Fixes"],
  ["breaking", "Breaking changes"],
] as const;

const releaseId = (e: ChangelogEntry) => `release-${e.pkg.replace(/\W+/g, "-")}-${e.version}`;

export function ChangelogPage() {
  return (
    <article className="page changelog-page">
      <header className="changelog-page__header">
        <h1 className="changelog-page__eyebrow">Changelog</h1>
        <p className="changelog-page__intro">
          The latest <strong>HeiGin UI</strong> and <strong>@heigin/mcp</strong> releases, site updates, component changes and fixes.
        </p>
      </header>
      <SectionIndex
        label="Releases"
        items={CHANGELOG.map((e) => ({ id: releaseId(e), label: `${e.pkg === "ui.heigin.com" ? "" : "v"}${e.version} ${e.name}` }))}
        style={{ "--section-index-left": "calc(var(--hg-layout-sidebar-width) + 10px)" } as CSSProperties}
      />
      {CHANGELOG.map((entry) => {
        const id = releaseId(entry);
        const npm = entry.pkg !== "ui.heigin.com";
        const version = npm ? `v${entry.version}` : entry.version;
        const install = `npm i ${entry.pkg}@${entry.version}`;
        return (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className="changelog-entry">
            <div>
              <time dateTime={entry.dateTime} className="changelog-entry__date">
                {entry.date}
              </time>
            </div>
            <div>
              <p className="changelog-entry__pkg">{entry.pkg}</p>
              <h2 id={`${id}-title`} className="changelog-entry__title">
                {version} <em>{entry.name}</em>
              </h2>
              {npm && (
                <div className="changelog-entry__install">
                  <code>{install}</code>
                  <CopyButton text={install} label="Copy" variant="ghost" />
                </div>
              )}
              {entry.image && entry.preview && (
                <figure className="changelog-figure">
                  <img src={`/changelog-art/${entry.image}.webp`} alt="" loading="lazy" />
                  <a href={href(entry.preview.href)} className="changelog-figure__glass">
                    <img src={`/changelog-art/previews/${entry.preview.src}.webp`} alt={entry.preview.alt} loading="lazy" />
                  </a>
                </figure>
              )}
              {SECTIONS.map(([key, title]) => {
                const items = entry[key];
                if (!items?.length) return null;
                return (
                  <div key={key}>
                    <h3 className="changelog-entry__heading">{title}</h3>
                    <ul className="changelog-entry__list">
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
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

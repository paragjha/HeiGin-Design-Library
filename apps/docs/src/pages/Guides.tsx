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

export function ChangelogPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>Changelog</h1>
      </header>
      <section>
        <h2>0.1.0 — unreleased</h2>
        <ul className="prose-list">
          <li>First token set, taken from the production stylesheet of the live CRM (northwind.heigin.com).</li>
          <li>{listManifests().filter((m) => m.category === "ui").length} primitives built on Base UI.</li>
          <li>{listManifests().filter((m) => m.category === "crm").length} CRM patterns, proposed from the product spec until the signed-in screens are inspected.</li>
          <li>Copy-source manifests and the copy script; docs site; Next.js example.</li>
        </ul>
      </section>
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

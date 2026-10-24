import * as React from "react";
import { Badge, Card } from "@heigin/ui";
import { CodeBlock } from "../components/CodeBlock";
import { CodePanel } from "../components/CodePanel";
import { CopyButton } from "../components/CopyButton";
import { Playground } from "../components/Playground";
import { PropsTable } from "../components/PropsTable";
import type { ComponentDocEntry, Evidence } from "../content/types";
import { href } from "../lib/router";
import { getManifest } from "../lib/source";

const exampleModules = import.meta.glob("../examples/*/*.tsx", { eager: true, import: "default" }) as Record<string, React.ComponentType>;
const exampleSources = import.meta.glob("../examples/*/*.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

const evidenceTone: Record<Evidence, "success" | "info" | "warning"> = { observed: "success", inferred: "info", proposed: "warning" };
const evidenceLabel: Record<Evidence, string> = {
  observed: "Observed in production",
  inferred: "Inferred from production tokens",
  proposed: "Proposed extension",
};

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  return (
    <Badge tone={evidenceTone[evidence]} dot>
      {evidenceLabel[evidence]}
    </Badge>
  );
}

/** Error boundary so one broken demo never takes down the page. */
class DemoBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    return this.state.error ? <p role="alert">Demo failed: {this.state.error.message}</p> : this.props.children;
  }
}

function Example({ slug, file, title, description }: { slug: string; file: string; title: string; description?: string }) {
  const key = `../examples/${slug}/${file}.tsx`;
  const Demo = exampleModules[key];
  const code = exampleSources[key] ?? "";
  const [showCode, setShowCode] = React.useState(false);
  if (!Demo) return <p role="alert">Missing example {key}</p>;
  return (
    <section className="example" aria-labelledby={`ex-${slug}-${file}`}>
      <div className="example__head">
        <div>
          <h3 id={`ex-${slug}-${file}`} className="h4">
            {title}
          </h3>
          {description && <p className="muted small">{description}</p>}
        </div>
        <div className="example__actions">
          <button type="button" className="link-button" aria-expanded={showCode} onClick={() => setShowCode((s) => !s)}>
            {showCode ? "Hide code" : "Show code"}
          </button>
          <CopyButton text={code} label="Copy example" testId="copy-example" variant="ghost" />
        </div>
      </div>
      <div className="example__stage" data-testid="example-stage">
        <DemoBoundary>
          <Demo />
        </DemoBoundary>
      </div>
      {showCode && <CodeBlock code={code} label={`${title} code`} />}
    </section>
  );
}

export function ComponentPage({ doc }: { doc: ComponentDocEntry }) {
  const firstExample = doc.examples[0];
  const usage = firstExample ? (exampleSources[`../examples/${doc.slug}/${firstExample.file}.tsx`] ?? "") : "";
  const manifest = getManifest(doc.manifest);

  return (
    <article className="page" data-testid={`component-page-${doc.slug}`}>
      <header className="page__header">
        <p className="eyebrow">{doc.group}</p>
        <h1>{doc.title}</h1>
        <p className="lede">{doc.description}</p>
        <div className="meta-row">
          <EvidenceBadge evidence={doc.evidence} />
          {manifest && (manifest.client ? <Badge tone="outline">Client Component</Badge> : <Badge tone="outline">Server-safe</Badge>)}
          {manifest && manifest.internalDependencies.length > 0 && <Badge tone="outline">Depends on: {manifest.internalDependencies.join(", ")}</Badge>}
        </div>
        <p className="muted small evidence-note">
          <strong>Evidence:</strong> {doc.evidenceNote}
        </p>
      </header>

      {doc.playground && (
        <section aria-labelledby="playground-h">
          <h2 id="playground-h">Playground</h2>
          <Playground def={doc.playground} title={doc.title} />
        </section>
      )}

      <section aria-labelledby="examples-h">
        <h2 id="examples-h">Examples</h2>
        {doc.examples.map((ex) => (
          <Example key={ex.file} slug={doc.slug} {...ex} />
        ))}
      </section>

      <section aria-labelledby="code-h">
        <h2 id="code-h">Code</h2>
        <CodePanel component={doc.manifest} usage={usage} />
      </section>

      <section aria-labelledby="states-h">
        <h2 id="states-h">States</h2>
        <ul className="chip-list">
          {doc.states.map((s) => (
            <li key={s}>
              <Badge tone="outline">{s}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="api-h">
        <h2 id="api-h">API</h2>
        {doc.propsFor.map((name) => (
          <PropsTable key={name} component={name} />
        ))}
      </section>

      <section aria-labelledby="a11y-h">
        <h2 id="a11y-h">Accessibility</h2>
        <ul className="prose-list">
          {doc.a11y.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        {doc.responsive && (
          <>
            <h3 className="h4">Responsive behaviour</h3>
            <p>{doc.responsive}</p>
          </>
        )}
      </section>
    </article>
  );
}

function CardPreview({ doc }: { doc: ComponentDocEntry }) {
  if (doc.playground) {
    const defaults = Object.fromEntries(
      Object.entries(doc.playground.controls).map(([key, ctrl]) => [key, ctrl.default]),
    ) as Parameters<typeof doc.playground.render>[0];
    return (
      <DemoBoundary>
        {doc.playground.render(defaults)}
      </DemoBoundary>
    );
  }
  const firstExample = doc.examples[0];
  if (firstExample) {
    const key = `../examples/${doc.slug}/${firstExample.file}.tsx`;
    const Demo = exampleModules[key];
    if (Demo) {
      return (
        <DemoBoundary>
          <Demo />
        </DemoBoundary>
      );
    }
  }
  return null;
}

export function ComponentIndexPage({ docs, base, title, intro }: { docs: ComponentDocEntry[]; base: string; title: string; intro?: string }) {
  const groups = [...new Set(docs.map((d) => d.group))];
  return (
    <article className="page">
      <header className="page__header">
        <h1>{title}</h1>
        <p className="lede">
          {intro ??
            `${docs.length} components. Each page has a live preview built from the real library, copyable source, props generated from the types, and accessibility notes.`}
        </p>
      </header>
      {groups.map((group) => (
        <section key={group} aria-labelledby={`g-${group}`}>
          <h2 id={`g-${group}`}>{group}</h2>
          <ul className="card-grid">
            {docs
              .filter((d) => d.group === group)
              .map((d) => (
                <li key={d.slug}>
                  <Card interactive padding="none" className="index-card">
                    <div className="index-card__preview">
                      <CardPreview doc={d} />
                    </div>
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                      <a href={href(`${base}/${d.slug}`)} className="stretched-link">
                        {d.title}
                      </a>
                      <p className="muted small">{d.description}</p>
                      <EvidenceBadge evidence={d.evidence} />
                    </div>
                  </Card>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </article>
  );
}

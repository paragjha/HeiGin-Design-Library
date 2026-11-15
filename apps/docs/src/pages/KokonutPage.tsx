import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Badge, Card } from "@heigin/ui";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { CopyButton } from "../components/CopyButton";
import { PageMeta } from "../components/PageMeta";
import { href } from "../lib/router";
import { kokonutGroups, kokonutItems, kokonutPath, kokonutPreviewUrl, loadKokonutSource, type KokonutItem } from "../kokonut/registry";

type Theme = "light" | "dark";

function readTheme(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useDocsTheme(): Theme {
  const [theme, setTheme] = React.useState<Theme>(readTheme);
  React.useEffect(() => {
    const update = () => setTheme(readTheme());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return theme;
}

const MIN_HEIGHT = 400;
const MAX_HEIGHT = 1400;

/** The component in an isolated frame: its own Tailwind build, so the docs CSS cannot restyle it. */
function PreviewFrame({ item }: { item: KokonutItem }) {
  const theme = useDocsTheme();
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(MIN_HEIGHT);
  // The src keeps the theme it was mounted with; later changes are posted, so the demo does not restart.
  const [src] = React.useState(() => kokonutPreviewUrl(item.slug, theme));

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data as { type?: string; height?: number } | null;
      if (data?.type === "hg-kokonut-height" && typeof data.height === "number") {
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, data.height)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const postTheme = React.useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: "hg-kokonut-theme", theme }, window.location.origin);
  }, [theme]);
  React.useEffect(postTheme, [postTheme]);

  return (
    <div className="kokonut-stage" data-testid="example-stage">
      <iframe ref={frame} className="kokonut-stage__frame" src={src} title={`${item.title} preview`} style={{ height }} onLoad={postTheme} />
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="inline-code">
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

const cells = (row: string) =>
  row
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));

/** Renders the small markdown subset the upstream props docs use: tables, `###` headings, fenced code, paragraphs. */
function ApiDocs({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) code.push(lines[i++] ?? "");
      i++;
      out.push(<CodeBlock key={out.length} code={code.join("\n")} label="Type" />);
    } else if (line.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|")) rows.push(lines[i++] ?? "");
      const head = cells(rows[0] ?? "");
      out.push(
        <div key={out.length} className="kokonut-table">
          <table className="table">
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(2).map((row, r) => (
                <tr key={r}>
                  {cells(row).map((cell, c) => (
                    <td key={c}>{cell ? <Inline text={cell} /> : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (line.startsWith("### ")) {
      out.push(
        <h3 key={out.length} className="h4">
          {line.slice(4)}
        </h3>,
      );
      i++;
    } else {
      if (line.trim())
        out.push(
          <p key={out.length}>
            <Inline text={line} />
          </p>,
        );
      i++;
    }
  }
  return <>{out}</>;
}

function Source({ item }: { item: KokonutItem }) {
  const [source, setSource] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    let live = true;
    void loadKokonutSource(item.slug).then((text) => live && setSource(text));
    return () => {
      live = false;
    };
  }, [item.slug]);
  return (
    <>
      <div className="kokonut-source__bar">
        <p className="muted small">
          <code className="inline-code">components/kokonutui/{item.slug}.tsx</code>
        </p>
        <div className="example__actions">
          <button type="button" className="link-button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Hide source" : "Show source"}
          </button>
          {source && <CopyButton text={source} label="Copy source" testId="copy-source" variant="ghost" />}
        </div>
      </div>
      {open && source && <CodeBlock code={source} label={`${item.title} source`} maxHeight={560} />}
    </>
  );
}

export function KokonutPage({ item }: { item: KokonutItem }) {
  const group = kokonutGroups.find((g) => g.id === item.category)?.label ?? "";
  const install = `npx shadcn@latest add ${item.registryUrl}`;
  const usage = `import ${item.exportName} from "@/components/kokonutui/${item.slug}";\n\nexport function Example() {\n  return <${item.exportName} />;\n}`;
  const needs = [...item.dependencies, ...item.registryDependencies.map((d) => `shadcn ${d}`)];

  return (
    <article className="page" data-testid={`kokonut-page-${item.slug}`}>
      <PageMeta title={item.title} description={item.description} />
      <header className="page__header">
        <p className="eyebrow">Components · {group}</p>
        <h1>{item.title}</h1>
        <p className="lede">{item.description}</p>
        <div className="meta-row">
          <Badge tone="info" dot>
            Community · Kokonut UI
          </Badge>
          <Badge tone="outline">MIT</Badge>
          <Badge tone="outline">Client Component</Badge>
          <Badge tone="outline">Tailwind CSS v4</Badge>
        </div>
      </header>

      <section aria-labelledby="preview-h">
        <div className="kokonut-source__bar">
          <h2 id="preview-h">Preview</h2>
          <a className="link-button" href={kokonutPreviewUrl(item.slug, readTheme())} target="_blank" rel="noreferrer">
            Open in a new tab <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
        <PreviewFrame item={item} />
      </section>

      <section aria-labelledby="install-h">
        <h2 id="install-h">Installation</h2>
        <CodeBlock code={install} lang="bash" label="Install with the shadcn CLI" />
        <p className="muted small">
          Adds <code className="inline-code">components/kokonutui/{item.slug}.tsx</code> to a project set up for shadcn (Tailwind CSS v4 and the{" "}
          <code className="inline-code">@/</code> alias).{needs.length > 0 && ` Needs: ${needs.join(", ")}.`}
        </p>
        {item.modified && (
          <Callout title="This copy differs from the registry version">
            The CLI installs Kokonut UI's original, which shows a spinner while a step runs. The version previewed here swaps that spinner for{" "}
            <a href={href("/components/thinking-orb")}>ThinkingOrb</a> from <code className="inline-code">@heigin/ui</code>. To get it, copy the source below and
            install <code className="inline-code">@heigin/ui</code>.
          </Callout>
        )}
      </section>

      <section aria-labelledby="usage-h">
        <h2 id="usage-h">Usage</h2>
        <CodeBlock code={usage} label="Usage" />
        <p className="muted small">With no props the component plays its built-in demo, which is what the preview shows. Pass your own data to drive it.</p>
      </section>

      {item.api && (
        <section aria-labelledby="api-h">
          <h2 id="api-h">API</h2>
          <ApiDocs markdown={item.api} />
        </section>
      )}

      <section aria-labelledby="source-h">
        <h2 id="source-h">Source</h2>
        <Source item={item} />
      </section>

      <section aria-labelledby="credit-h">
        <h2 id="credit-h">Credit</h2>
        <p>
          {item.title} is by {item.author} for{" "}
          <a href={item.docsUrl} target="_blank" rel="noreferrer">
            Kokonut UI
          </a>{" "}
          (v{item.version}), published under the MIT license. The source keeps its original license header
          {item.modified ? "; the header also records the one change made here." : " and is otherwise unchanged."}
        </p>
      </section>
    </article>
  );
}

/** Listed under the library's own components on /components. */
export function KokonutIndexSection() {
  return (
    <article className="page">
      <header className="page__header">
        <h2>Community components</h2>
        <p className="lede">
          {kokonutItems.length} components from Kokonut UI (MIT), previewed exactly as their authors built them. They install with the shadcn CLI and are not part of the{" "}
          <code className="inline-code">@heigin/ui</code> package.
        </p>
      </header>
      {kokonutGroups.map((group) => (
        <section key={group.id} aria-labelledby={`kk-${group.id}`}>
          <h2 id={`kk-${group.id}`}>{group.label}</h2>
          <ul className="card-grid">
            {kokonutItems
              .filter((item) => item.category === group.id)
              .map((item) => (
                <li key={item.slug}>
                  <Card interactive padding="none" className="index-card">
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                      <a href={href(kokonutPath(item.slug))} className="stretched-link">
                        {item.title}
                      </a>
                      <p className="muted small">{item.description}</p>
                      <Badge tone="info" dot>
                        Kokonut UI
                      </Badge>
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

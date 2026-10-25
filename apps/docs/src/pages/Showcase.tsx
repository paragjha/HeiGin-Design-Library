import * as React from "react";
import { Tab, Tabs, TabsList, TabsPanel } from "@heigin/ui";
import { CodeBlock } from "../components/CodeBlock";
import { CopyButton } from "../components/CopyButton";
import { showcaseItems, type ShowcaseItem } from "../showcase/registry";
import "../showcase/showcase.css";

class DemoBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    return this.state.error ? (
      <p role="alert">Demo failed: {this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

function Item({ item }: { item: ShowcaseItem }) {
  const [showCode, setShowCode] = React.useState(false);
  const Demo = item.demo;
  return (
    <article className="showcase-item" id={item.slug} aria-labelledby={`sc-${item.slug}-h`}>
      <header className="showcase-item__header">
        <h3 id={`sc-${item.slug}-h`} className="showcase-item__title">{item.title}</h3>
        <p className="showcase-item__description">{item.description}</p>
      </header>
      <div
        className={`showcase-stage${item.flushStage ? " showcase-stage--landing" : ""}`}
        data-testid="showcase-stage"
      >
        <DemoBoundary>
          <Demo />
        </DemoBoundary>
      </div>
      <div className="showcase-item__code">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 className="h4" style={{ margin: 0 }}>API</h4>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="link-button"
              aria-expanded={showCode}
              onClick={() => setShowCode((s) => !s)}
            >
              {showCode ? "Hide source" : "Show source"}
            </button>
            <CopyButton text={item.source} label="Copy source" variant="ghost" />
          </div>
        </div>
        {item.props.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ fontSize: 13, width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {item.props.map((p) => (
                  <tr key={p.name}>
                    <td><code className="inline-code">{p.name}</code></td>
                    <td><code className="inline-code">{p.type}</code></td>
                    <td>{p.defaultValue ? <code className="inline-code">{p.defaultValue}</code> : "—"}</td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showCode && (
          <div style={{ marginTop: 14 }}>
            <CodeBlock code={item.source} label={`${item.title} source`} />
          </div>
        )}
      </div>
    </article>
  );
}

export function ShowcasePage() {
  // Preserve registry order within each group.
  const groups = React.useMemo(() => {
    const seen: string[] = [];
    for (const item of showcaseItems) if (!seen.includes(item.group)) seen.push(item.group);
    return seen;
  }, []);

  const [tab, setTab] = React.useState<string>("all");
  const tabs = ["all", ...groups];

  return (
    <article className="page showcase-page">
      <header className="page__header">
        <h1>Components</h1>
        <p className="lede">
          A growing set of marketing-site, developer-UI and voice-agent components built with HeiGin tokens and primitives. Each entry is a standalone React/TypeScript file you can copy into your project.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v)}>
        <TabsList>
          {tabs.map((group) => (
            <Tab key={group} value={group} count={group === "all" ? showcaseItems.length : showcaseItems.filter((i) => i.group === group).length}>
              {group === "all" ? "All" : group}
            </Tab>
          ))}
        </TabsList>
        {/* Render only the active panel's items so heavy canvas demos aren't
            instantiated five times (once per tab). */}
        <TabsPanel value={tab}>
          <div className="showcase-list" style={{ marginTop: 24 }}>
            {(tab === "all" ? showcaseItems : showcaseItems.filter((i) => i.group === tab)).map((item) => (
              <Item key={item.slug} item={item} />
            ))}
          </div>
        </TabsPanel>
      </Tabs>
    </article>
  );
}

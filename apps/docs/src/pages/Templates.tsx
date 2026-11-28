import { Badge, Card, EmptyState } from "@heigin/ui";
import { CopyButton } from "../components/CopyButton";
import { PageMeta } from "../components/PageMeta";
import { templates, type TemplateItem } from "../generated/catalog";
import { href } from "../lib/router";

const KIND_LABEL: Record<TemplateItem["kind"], string> = {
  page: "Full page",
  section: "Section",
  bundle: "Bundle",
  core: "Shared core",
};

const GROUPS: { kind: TemplateItem["kind"]; title: string; intro: string }[] = [
  { kind: "page", title: "Full page", intro: "The whole composition in one install." },
  { kind: "section", title: "Sections", intro: "Each section installs on its own and reads its content from the same config file." },
  { kind: "bundle", title: "Bundles", intro: "Sections that work well together, installed with one command." },
  { kind: "core", title: "Shared core", intro: "The foundation every item above depends on. It comes with any of them." },
];

const REGISTRY_SNIPPET = `{
  "registries": {
    "@heigin": {
      "url": "https://ui.heigin.com/r/{name}.json",
      "headers": { "Authorization": "Bearer \${HEIGIN_LICENSE}" }
    }
  }
}`;

function TierBadge({ item }: { item: TemplateItem }) {
  return item.license === "free" ? <Badge tone="success">Free</Badge> : <Badge tone="info">Paid · not on sale yet</Badge>;
}

function Preview({ item, height }: { item: TemplateItem; height: number }) {
  if (!item.previewUrl) return null;
  return (
    <>
      <iframe
        src={item.previewUrl}
        title={`${item.title} preview`}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height,
          border: "1px solid var(--hg-color-border)",
          borderRadius: "var(--hg-radius-lg)",
          background: "#fff",
        }}
      />
      <p className="muted small" style={{ marginTop: "var(--hg-space-2)" }}>
        {item.previewNote}{" "}
        <a href={item.previewUrl} target="_blank" rel="noopener noreferrer">
          Open the preview in a new tab
        </a>
        {item.liveDemo && (
          <>
            {" "}
            or see it in production at{" "}
            <a href={item.liveDemo} target="_blank" rel="noopener noreferrer">
              heigin.com
            </a>
          </>
        )}
        .
      </p>
    </>
  );
}

function TemplateCards({ items }: { items: TemplateItem[] }) {
  return (
    <ul className="card-grid">
      {items.map((item) => (
        <li key={item.name}>
          <Card interactive padding="none" className="index-card">
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
              <a href={href(`/templates/${item.name}`)} className="stretched-link">
                {item.title}
              </a>
              <p className="muted small">{item.description}</p>
              <TierBadge item={item} />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function TemplatesPage() {
  // The full landing page leads; other families follow in file order.
  const families = [...new Set(templates.map((t) => t.family))].sort((a, b) => Number(b === "landing") - Number(a === "landing"));
  return (
    <article className="page">
      <PageMeta
        title="Templates"
        description="Full pages and sections built on HeiGin UI: the heigin.com landing page, three hero sections, eleven motion sections, six launch pages and sections, and a dashboard template. Preview each one, see what it needs, and install it through the HeiGin registry."
        ogType="website"
      />
      <header className="page__header">
        <p className="eyebrow">Templates</p>
        <h1>Templates</h1>
        <p className="lede">Full pages and sections built on HeiGin UI. Each one installs on its own through the HeiGin registry.</p>
      </header>

      {templates.length === 0 ? (
        <EmptyState title="No templates yet" description="Full-page and section templates land here once published." />
      ) : (
        families.map((family) => {
          const inFamily = templates.filter((t) => t.family === family);
          const first = inFamily[0]!;
          const page = inFamily.find((t) => t.kind === "page");
          return (
            <section key={family} aria-labelledby={`tf-${family}`} style={{ marginBottom: "var(--hg-space-12)" }}>
              <h2 id={`tf-${family}`}>{first.familyTitle}</h2>
              {first.familyIntro && <p className="muted">{first.familyIntro}</p>}
              {page && <Preview item={page} height={640} />}
              {GROUPS.map((group) => {
                const items = inFamily.filter((t) => t.kind === group.kind);
                if (!items.length) return null;
                return (
                  <div key={group.kind}>
                    <h3 id={`tg-${family}-${group.kind}`}>{group.title}</h3>
                    <p className="muted small">{group.intro}</p>
                    <TemplateCards items={items} />
                  </div>
                );
              })}
            </section>
          );
        })
      )}
    </article>
  );
}

export function TemplateDetailPage({ item }: { item: TemplateItem }) {
  const paid = item.license !== "free";
  const command = `npx shadcn@latest add @heigin/${item.name}`;
  const previewHeight = item.kind === "page" || item.family === "heroes" || item.family === "motion" || item.family === "launch" || item.family === "dashboard" ? 720 : item.name === "landing-header" ? 420 : 560;
  const included = templates.filter((t) => item.registryDependencies.includes(t.name));

  return (
    <article className="page" data-testid={`template-page-${item.name}`}>
      <PageMeta title={`${item.title} template`} description={item.description} ogType="article" />
      <header className="page__header">
        <p className="eyebrow">
          <a href={href("/templates")}>Templates</a> / {KIND_LABEL[item.kind]}
        </p>
        <h1>{item.title}</h1>
        <p className="lede">{item.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "var(--hg-space-3)" }}>
          <TierBadge item={item} />
          <Badge tone="outline">{KIND_LABEL[item.kind]}</Badge>
          {item.client ? <Badge tone="outline">Client component</Badge> : <Badge tone="outline">Server-component safe</Badge>}
        </div>
      </header>

      {item.previewUrl && (
        <section aria-labelledby="t-preview">
          <h2 id="t-preview">Preview</h2>
          <Preview item={item} height={previewHeight} />
        </section>
      )}

      <section aria-labelledby="t-install">
        <h2 id="t-install">Install</h2>
        {paid && (
          <p className="muted">
            This is a paid item and checkout is not open yet, so it cannot be bought or installed today. Without a license the registry answers this
            item with <code className="inline-code">402</code> and no source. The steps below are how installation will work once it is on sale.
          </p>
        )}
        <p className="muted small">
          Add the HeiGin registry to <code className="inline-code">components.json</code> once
          {paid ? ", and set HEIGIN_LICENSE in your environment:" : ". The license header is only needed for paid items:"}
        </p>
        <div className="code-panel__head">
          <code className="inline-code" style={{ whiteSpace: "pre" }}>
            {REGISTRY_SNIPPET}
          </code>
          <CopyButton text={REGISTRY_SNIPPET} label="Copy components.json snippet" testId="copy-template-registry" />
        </div>
        <p className="muted small">Then install:</p>
        <div className="code-panel__head">
          <code className="inline-code">{command}</code>
          <CopyButton text={command} label="Copy install command" testId="copy-template-install" />
        </div>
      </section>

      <section aria-labelledby="t-included">
        <h2 id="t-included">What you get</h2>
        <ul className="dep-list">
          {item.files.length > 0 && (
            <li>
              <strong>Files ({item.files.length}):</strong> {item.files.join(", ")}
            </li>
          )}
          {included.length > 0 && (
            <li>
              <strong>Installs with it:</strong>{" "}
              {included.map((dep, i) => (
                <span key={dep.name}>
                  {i > 0 && ", "}
                  <a href={href(`/templates/${dep.name}`)}>{dep.title}</a>
                </span>
              ))}
            </li>
          )}
          <li>
            <strong>npm packages:</strong>{" "}
            {item.dependencies.length ? <code className="inline-code">{item.dependencies.join(" ")}</code> : "none of its own"}
          </li>
          <li>
            <strong>Requires:</strong> {item.requirements.join("; ")}
          </li>
        </ul>
      </section>

      <section aria-labelledby="t-setup">
        <h2 id="t-setup">Setup</h2>
        <ol className="prose-list">
          {item.setup.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {item.configKeys.length > 0 && (
          <p className="muted small">
            Content for this item lives under{" "}
            {item.configKeys.map((key, i) => (
              <span key={key}>
                {i > 0 && ", "}
                <code className="inline-code">
                  {item.configVar}.{key}
                </code>
              </span>
            ))}{" "}
            in <code className="inline-code">{item.configFile}</code>.
          </p>
        )}
      </section>

      <section aria-labelledby="t-responsive">
        <h2 id="t-responsive">Responsive behavior</h2>
        <p>{item.responsive}</p>
      </section>

      <section aria-labelledby="t-assets">
        <h2 id="t-assets">Content and assets you replace</h2>
        <ul className="prose-list">
          {item.replaceable.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-license">
        <h2 id="t-license">License, updates and support</h2>
        {paid ? (
          <p>
            License terms, the update period and support for paid items have not been published. They will be set together with pricing, and this item
            will not be sold before they are. See <a href={href("/pricing")}>pricing</a> for the current status.
          </p>
        ) : (
          <p>
            Free to install. It is distributed on the same terms as the rest of the HeiGin UI registry; see the LICENSE file in the repository.
            Questions and bugs go to GitHub Issues.
          </p>
        )}
      </section>
    </article>
  );
}

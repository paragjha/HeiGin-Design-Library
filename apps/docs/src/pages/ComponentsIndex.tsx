import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Badge, Card, Kbd, SearchInput } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import {
  categories,
  counts,
  mcpTools,
  patterns,
  primitives,
  templates,
  type CatalogItem,
} from "../generated/catalog";
import { href, navigate as routerNavigate } from "../lib/router";

export type SearchResultType = "Primitives" | "Patterns" | "Templates" | "MCP Tools";

export interface CatalogSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  path: string;
}

const CATALOG_BY_SLUG: ReadonlyMap<string, CatalogItem> = new Map(
  [...primitives, ...patterns].map((item) => [item.name, item]),
);

function titleForSlug(slug: string): string {
  return (
    CATALOG_BY_SLUG.get(slug)?.title ??
    slug
      .split("-")
      .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ")
  );
}

function buildSearchIndex(): CatalogSearchResult[] {
  const results: CatalogSearchResult[] = [];

  for (const p of primitives) {
    results.push({
      id: `primitive:${p.name}`,
      type: "Primitives",
      title: p.title,
      description: p.description,
      path: `/components/${p.name}`,
    });
  }

  for (const pat of patterns) {
    results.push({
      id: `pattern:${pat.name}`,
      type: "Patterns",
      title: pat.title,
      description: pat.description,
      path: `/components/${pat.name}`,
    });
  }

  for (const tpl of templates) {
    results.push({
      id: `template:${tpl.name}`,
      type: "Templates",
      title: tpl.title,
      description: tpl.description,
      path: `/templates/${tpl.name}`,
    });
  }

  for (const tool of mcpTools) {
    results.push({
      id: `mcp:${tool}`,
      type: "MCP Tools",
      title: tool,
      description: `MCP server tool: ${tool}`,
      path: `/docs/mcp#${tool}`,
    });
  }

  return results;
}

const SEARCH_INDEX: readonly CatalogSearchResult[] = buildSearchIndex();
const RESULT_GROUPS: readonly SearchResultType[] = [
  "Primitives",
  "Patterns",
  "Templates",
  "MCP Tools",
];

function scoreMatch(item: CatalogSearchResult, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (desc.includes(q)) return 30;
  // Subsequence fuzzy check on title
  let qi = 0;
  for (let i = 0; i < title.length && qi < q.length; i++) {
    if (title[i] === q[qi]) qi++;
  }
  return qi === q.length ? 15 : 0;
}

export function ComponentsIndex() {
  const [query, setQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const groupedResults = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const scored = SEARCH_INDEX.map((item) => ({
      item,
      score: scoreMatch(item, trimmed),
    }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

    const byType = new Map<SearchResultType, CatalogSearchResult[]>();
    for (const group of RESULT_GROUPS) {
      byType.set(group, []);
    }
    for (const { item } of scored) {
      byType.get(item.type)?.push(item);
    }
    return { total: scored.length, byType };
  }, [query]);

  return (
    <article className="page" data-testid="components-index-page">
      <PageMeta
        title="Components"
        description={`Browse ${counts.primitives} UI primitives and ${counts.patterns} CRM patterns organized by category.`}
        ogType="website"
      />

      <header
        className="page__header"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--hg-space-4)",
          marginBottom: "var(--hg-space-8)",
        }}
      >
        <div>
          <p className="eyebrow">Component library</p>
          <h1>Components</h1>
          <p className="lede">
            {counts.primitives} accessible primitives and {counts.patterns} production CRM patterns built on Base UI and{" "}
            <code>--hg-*</code> design tokens.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--hg-space-3)",
            maxWidth: "540px",
            width: "100%",
          }}
        >
          <div style={{ flex: 1 }}>
            <SearchInput
              ref={searchInputRef}
              value={query}
              onValueChange={setQuery}
              aria-label="Search components, patterns, templates, and MCP tools"
              placeholder="Filter components, patterns, templates, MCP tools..."
            />
          </div>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--hg-space-1)",
              color: "var(--docs-ink-faint, var(--hg-color-faint))",
              fontSize: "var(--hg-font-size-xs)",
              flexShrink: 0,
            }}
          >
            <Kbd>Ctrl+K</Kbd>
          </span>
        </div>
      </header>

      {groupedResults && (
        <section
          aria-label="Search results"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--hg-space-6)",
            marginBottom: "var(--hg-space-8)",
          }}
        >
          {groupedResults.total === 0 ? (
            <Card padding="lg">
              <p className="muted" style={{ margin: 0 }}>
                No matches for <strong>&ldquo;{query}&rdquo;</strong> across primitives, patterns, templates, or MCP tools.
              </p>
            </Card>
          ) : (
            RESULT_GROUPS.map((type) => {
              const items = groupedResults.byType.get(type) ?? [];
              if (items.length === 0) return null;
              return (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--hg-space-3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--hg-space-2)" }}>
                    <h2 className="h4" style={{ margin: 0 }}>
                      {type}
                    </h2>
                    <Badge tone="outline">{items.length}</Badge>
                  </div>
                  <ul className="card-grid" style={{ margin: 0 }}>
                    {items.map((item) => (
                      <li key={item.id}>
                        <Card interactive padding="md" className="index-card">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "var(--hg-space-2)",
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                gap: "var(--hg-space-2)",
                              }}
                            >
                              <a
                                href={href(item.path)}
                                className="stretched-link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  routerNavigate(item.path);
                                }}
                                style={{ fontWeight: 600 }}
                              >
                                {item.title}
                              </a>
                              <Badge tone="outline">{item.type}</Badge>
                            </div>
                            {item.description && (
                              <p
                                className="muted small"
                                style={{
                                  margin: 0,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </section>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--hg-space-8)" }}>
        {categories.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "var(--hg-space-4)",
              }}
            >
              <h2 id={`group-${group.id}`} style={{ margin: 0 }}>
                {group.label}
              </h2>
              <span className="muted small">
                {group.categories.reduce((sum, c) => sum + c.slugs.length, 0)} components
              </span>
            </div>

            <ul className="card-grid" style={{ margin: 0 }}>
              {group.categories.map((cat) => {
                const firstThree = cat.slugs.slice(0, 3).map(titleForSlug);
                const categoryPath = `/components/${cat.id}`;

                return (
                  <li key={cat.id}>
                    <Card interactive padding="lg" className="index-card">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--hg-space-3)",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "var(--hg-space-2)",
                          }}
                        >
                          <a
                            href={href(categoryPath)}
                            className="stretched-link"
                            onClick={(e) => {
                              e.preventDefault();
                              routerNavigate(categoryPath);
                            }}
                            style={{
                              fontSize: "var(--hg-font-size-md)",
                              fontWeight: 600,
                              color: "var(--docs-ink, var(--hg-color-ink))",
                              textDecoration: "none",
                            }}
                          >
                            {cat.label}
                          </a>
                          <Badge tone="outline">{cat.slugs.length}</Badge>
                        </div>

                        <p
                          className="muted small"
                          style={{
                            margin: 0,
                            flex: 1,
                          }}
                        >
                          {firstThree.join(", ")}
                          {cat.slugs.length > 3 ? `, +${cat.slugs.length - 3} more` : ""}
                        </p>

                        <div
                          aria-hidden="true"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "var(--hg-space-1)",
                            fontSize: "var(--hg-font-size-xs)",
                            fontWeight: 500,
                            color: "var(--docs-accent, var(--hg-color-accent))",
                          }}
                        >
                          <span>View category</span>
                          <ArrowRight size={13} strokeWidth={1.8} />
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {/* Full verified catalog: 31 UI primitives + 18 CRM patterns */}
        <section aria-labelledby="all-primitives-heading">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "var(--hg-space-4)",
            }}
          >
            <h2 id="all-primitives-heading" style={{ margin: 0 }}>
              UI Primitives
            </h2>
            <span className="muted small">{primitives.length} primitives</span>
          </div>
          <ul className="card-grid" style={{ margin: 0 }}>
            {primitives.map((item) => {
              const targetPath = `/components/${item.name}`;
              return (
                <li key={item.name}>
                  <Card interactive padding="lg" className="index-card">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--hg-space-2)",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--hg-space-2)",
                        }}
                      >
                        <a
                          href={href(targetPath)}
                          className="stretched-link"
                          onClick={(e) => {
                            e.preventDefault();
                            routerNavigate(targetPath);
                          }}
                          style={{
                            fontSize: "var(--hg-font-size-md)",
                            fontWeight: 600,
                            color: "var(--docs-ink, var(--hg-color-ink))",
                            textDecoration: "none",
                          }}
                        >
                          {item.title}
                        </a>
                        <Badge tone="outline">{item.client ? "Client" : "Server-safe"}</Badge>
                      </div>
                      <p className="muted small" style={{ margin: 0, flex: 1 }}>
                        {item.description || "Interactive HeiGin UI primitive."}
                      </p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="all-patterns-heading">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "var(--hg-space-4)",
            }}
          >
            <h2 id="all-patterns-heading" style={{ margin: 0 }}>
              CRM Patterns
            </h2>
            <span className="muted small">{patterns.length} CRM patterns</span>
          </div>
          <ul className="card-grid" style={{ margin: 0 }}>
            {patterns.map((item) => {
              const targetPath = `/patterns/${item.name}`;
              return (
                <li key={item.name}>
                  <Card interactive padding="lg" className="index-card">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--hg-space-2)",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--hg-space-2)",
                        }}
                      >
                        <a
                          href={href(targetPath)}
                          className="stretched-link"
                          onClick={(e) => {
                            e.preventDefault();
                            routerNavigate(targetPath);
                          }}
                          style={{
                            fontSize: "var(--hg-font-size-md)",
                            fontWeight: 600,
                            color: "var(--docs-ink, var(--hg-color-ink))",
                            textDecoration: "none",
                          }}
                        >
                          {item.title}
                        </a>
                        <Badge tone="outline">CRM Pattern</Badge>
                      </div>
                      <p className="muted small" style={{ margin: 0, flex: 1 }}>
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </article>
  );
}

export default ComponentsIndex;

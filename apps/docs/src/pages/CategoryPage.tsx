import { Badge, Breadcrumb, Card } from "@heigin/ui";
import { PageMeta } from "../components/PageMeta";
import {
  categories,
  patterns,
  primitives,
  type CatalogItem,
  type CategoryGroup,
  type CategoryLeaf,
} from "../generated/catalog";
import { href, navigate as routerNavigate, useRoute } from "../lib/router";
import { getManifest } from "../lib/source";
import { NotFoundPage } from "./Guides";

export interface CategoryPageProps {
  /** Category ID (e.g. `buttons-actions`). If omitted, extracted from `/components/<category>` route. */
  categoryId?: string;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

const CATALOG_BY_SLUG: ReadonlyMap<string, CatalogItem> = new Map(
  [...primitives, ...patterns].map((item) => [item.name, item]),
);

const CATEGORY_MAP: ReadonlyMap<
  string,
  { group: CategoryGroup; category: CategoryLeaf }
> = new Map(
  categories.flatMap((group) =>
    group.categories.map((category) => [category.id, { group, category }] as const),
  ),
);

/** Returns true if `id` matches one of the taxonomy category IDs in `source/categories.json`. */
export function isCategorySlug(id: string): boolean {
  return CATEGORY_MAP.has(id);
}

function isNewWithin14Days(slug: string, item?: CatalogItem): boolean {
  const manifest = getManifest(slug) as ({ date?: string } & Record<string, unknown>) | undefined;
  const rawDate = item?.date ?? manifest?.date;
  if (!rawDate) return false;
  const parsed = Date.parse(rawDate);
  if (Number.isNaN(parsed)) return false;
  const diff = Date.now() - parsed;
  return diff >= 0 && diff <= FOURTEEN_DAYS_MS;
}

export function CategoryPage({ categoryId: propCategoryId }: CategoryPageProps) {
  const route = useRoute();
  const resolvedId =
    propCategoryId ?? route.match(/^\/components\/([\w-]+)$/)?.[1] ?? "";
  const entry = CATEGORY_MAP.get(resolvedId);

  if (!entry) {
    return <NotFoundPage />;
  }

  const { group, category } = entry;

  return (
    <article className="page" data-testid={`category-page-${category.id}`}>
      <PageMeta
        title={`${category.label} · Components`}
        description={`${category.slugs.length} ${category.label.toLowerCase()} components and patterns in HeiGin UI.`}
      />

      <div style={{ marginBottom: "var(--hg-space-4)" }}>
        <Breadcrumb
          items={[
            { label: "Home", href: href("/") },
            { label: "Components", href: href("/components") },
            { label: group.label },
            { label: category.label },
          ]}
        />
      </div>

      <header className="page__header" style={{ marginBottom: "var(--hg-space-6)" }}>
        <p className="eyebrow">{group.label}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--hg-space-3)",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0 }}>{category.label}</h1>
          <Badge tone="outline">{category.slugs.length}</Badge>
        </div>
      </header>

      <ul className="card-grid" style={{ margin: 0 }}>
        {category.slugs.map((slug) => {
          const item = CATALOG_BY_SLUG.get(slug);
          const title =
            item?.title ??
            slug
              .split("-")
              .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
              .join(" ");
          const description = item?.description ?? "";
          const isNew = isNewWithin14Days(slug, item);
          const targetPath = `/components/${slug}`;

          return (
            <li key={slug}>
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
                      {title}
                    </a>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--hg-space-1)" }}>
                      {isNew && <Badge tone="info">New</Badge>}
                      {item?.category === "crm" && <Badge tone="outline">Pattern</Badge>}
                    </div>
                  </div>

                  <p
                    className="muted small"
                    style={{
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={description}
                  >
                    {description || "Interactive HeiGin UI component."}
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default CategoryPage;

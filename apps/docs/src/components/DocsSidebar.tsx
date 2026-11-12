import * as React from "react";
import { ChevronRight, Folder, Layers } from "lucide-react";
import { Button } from "@heigin/ui";
import {
  categories,
  patterns,
  primitives,
  type CatalogItem,
  type CategoryGroup,
  type CategoryLeaf,
} from "../generated/catalog";
import { href, navigate as routerNavigate, useRoute } from "../lib/router";

export interface DocsSidebarProps {
  /** Current pathname (defaults to `useRoute()`). */
  route?: string;
  /** Callback invoked after navigating to a link (e.g. to close mobile drawer). */
  onNavigate?: () => void;
  /** Optional custom path resolver for component slugs. Defaults to `/components/<slug>`. */
  resolveSlugPath?: (slug: string, item?: CatalogItem) => string;
  /** Optional extra sections rendered below the category tree (e.g. Account group when enabled). */
  extraSections?: React.ReactNode;
}

const CATALOG_BY_SLUG: ReadonlyMap<string, CatalogItem> = new Map(
  [...primitives, ...patterns].map((item) => [item.name, item]),
);

function titleForSlug(slug: string): string {
  const item = CATALOG_BY_SLUG.get(slug);
  if (item) return item.title;
  return slug
    .split("-")
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function isSlugActive(route: string, slug: string, resolvedPath: string): boolean {
  return (
    route === resolvedPath ||
    route === `/components/${slug}` ||
    route === `/patterns/${slug}`
  );
}

function categoryOwnsRoute(
  category: CategoryLeaf,
  route: string,
  resolveSlugPath: (slug: string, item?: CatalogItem) => string,
): boolean {
  if (route === `/components/${category.id}`) return true;
  return category.slugs.some((slug) =>
    isSlugActive(route, slug, resolveSlugPath(slug, CATALOG_BY_SLUG.get(slug))),
  );
}

function groupOwnsRoute(
  group: CategoryGroup,
  route: string,
  resolveSlugPath: (slug: string, item?: CatalogItem) => string,
): boolean {
  return group.categories.some((cat) => categoryOwnsRoute(cat, route, resolveSlugPath));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Collapsible documentation sidebar driven by `categories` from `generated/catalog.ts`.
 *
 * Keyboard navigation:
 * - ↑ / ↓: Move focus between visible tree controls
 * - →: Expand collapsed group/category, or move into first child
 * - ←: Collapse expanded group/category, or move to parent toggle
 * - Enter: Toggle group/category or navigate to the focused link
 */
export function DocsSidebar({
  route: routeProp,
  onNavigate,
  resolveSlugPath = (slug) => `/components/${slug}`,
  extraSections,
}: DocsSidebarProps) {
  const activeRoute = useRoute();
  const route = routeProp ?? activeRoute;
  const reducedMotion = usePrefersReducedMotion();
  const navRef = React.useRef<HTMLElement>(null);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of categories) {
      initial[group.id] = true;
    }
    return initial;
  });

  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of categories) {
      for (const cat of group.categories) {
        initial[cat.id] = categoryOwnsRoute(cat, route, resolveSlugPath);
      }
    }
    // If no category owns the current route, expand the first category by default
    const anyExpanded = Object.values(initial).some(Boolean);
    if (!anyExpanded && categories[0]?.categories[0]) {
      initial[categories[0].categories[0].id] = true;
    }
    return initial;
  });

  React.useEffect(() => {
    for (const group of categories) {
      for (const cat of group.categories) {
        if (categoryOwnsRoute(cat, route, resolveSlugPath)) {
          setExpandedGroups((prev) => (prev[group.id] ? prev : { ...prev, [group.id]: true }));
          setExpandedCategories((prev) => (prev[cat.id] ? prev : { ...prev, [cat.id]: true }));
        }
      }
    }
  }, [route, resolveSlugPath]);

  const toggleGroup = React.useCallback((groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const toggleCategory = React.useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  const getVisibleNodes = React.useCallback((): HTMLElement[] => {
    if (!navRef.current) return [];
    return Array.from(
      navRef.current.querySelectorAll<HTMLElement>('[data-sidebar-node="true"]'),
    ).filter((el) => el.closest('[aria-hidden="true"]') === null);
  }, []);

  const focusNodeById = React.useCallback((nodeId: string) => {
    requestAnimationFrame(() => {
      const target = navRef.current?.querySelector<HTMLElement>(
        `[data-node-id="${CSS.escape(nodeId)}"]`,
      );
      target?.focus();
    });
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.getAttribute("data-sidebar-node") !== "true") return;

      const nodes = getVisibleNodes();
      const idx = nodes.indexOf(target);
      if (idx === -1) return;

      const kind = target.getAttribute("data-node-kind");
      const groupId = target.getAttribute("data-group-id") ?? "";
      const categoryId = target.getAttribute("data-category-id") ?? "";
      const itemPath = target.getAttribute("data-item-path") ?? "";

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = nodes[idx + 1] ?? nodes[0];
        next?.focus();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = nodes[idx - 1] ?? nodes[nodes.length - 1];
        prev?.focus();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (kind === "group") {
          const isOpen = !!expandedGroups[groupId];
          if (!isOpen) {
            setExpandedGroups((prev) => ({ ...prev, [groupId]: true }));
          } else {
            const group = categories.find((g) => g.id === groupId);
            const firstCat = group?.categories[0];
            if (firstCat) focusNodeById(`category:${firstCat.id}`);
          }
        } else if (kind === "category") {
          const isOpen = !!expandedCategories[categoryId];
          if (!isOpen) {
            setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
          } else {
            const cat = categories
              .flatMap((g) => g.categories)
              .find((c) => c.id === categoryId);
            const firstSlug = cat?.slugs[0];
            if (firstSlug) focusNodeById(`item:${categoryId}:${firstSlug}`);
          }
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (kind === "item") {
          focusNodeById(`category:${categoryId}`);
        } else if (kind === "category") {
          const isOpen = !!expandedCategories[categoryId];
          if (isOpen) {
            setExpandedCategories((prev) => ({ ...prev, [categoryId]: false }));
          } else if (groupId) {
            focusNodeById(`group:${groupId}`);
          }
        } else if (kind === "group") {
          const isOpen = !!expandedGroups[groupId];
          if (isOpen) {
            setExpandedGroups((prev) => ({ ...prev, [groupId]: false }));
          }
        }
        return;
      }

      if (e.key === "Enter" && kind === "item" && itemPath) {
        e.preventDefault();
        routerNavigate(itemPath);
        onNavigate?.();
      }
    },
    [expandedCategories, expandedGroups, focusNodeById, getVisibleNodes, onNavigate],
  );

  const transitionStyle: React.CSSProperties = reducedMotion
    ? { transition: "none" }
    : {
        transition:
          "grid-template-rows 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease",
      };

  return (
    <nav
      ref={navRef}
      aria-label="Component documentation"
      className="sidebar__nav"
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--hg-space-3)",
        padding: "var(--hg-space-2) var(--hg-space-3) var(--hg-space-6)",
      }}
    >
      {categories.map((group) => {
        const isGroupOpen = !!expandedGroups[group.id];
        const isGroupActive = groupOwnsRoute(group, route, resolveSlugPath);

        return (
          <section
            key={group.id}
            aria-label={group.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--hg-space-1)",
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              touch={false}
              aria-expanded={isGroupOpen}
              data-sidebar-node="true"
              data-node-kind="group"
              data-node-id={`group:${group.id}`}
              data-group-id={group.id}
              onClick={() => toggleGroup(group.id)}
              leadingIcon={<Layers size={14} strokeWidth={1.7} aria-hidden="true" />}
              trailingIcon={
                <ChevronRight
                  size={14}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  style={{
                    marginLeft: "auto",
                    transform: isGroupOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: reducedMotion ? "none" : "transform 160ms ease",
                    color: "var(--docs-ink-faint, var(--hg-color-faint))",
                  }}
                />
              }
              style={{
                justifyContent: "flex-start",
                fontWeight: 600,
                fontSize: "var(--hg-font-size-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: isGroupActive
                  ? "var(--docs-ink, var(--hg-color-ink))"
                  : "var(--docs-ink-muted, var(--hg-color-muted))",
                paddingInline: "var(--hg-space-2)",
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
            </Button>

            <div
              aria-hidden={!isGroupOpen}
              style={{
                display: "grid",
                gridTemplateRows: isGroupOpen ? "1fr" : "0fr",
                opacity: isGroupOpen ? 1 : 0,
                ...transitionStyle,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    paddingLeft: "var(--hg-space-1)",
                  }}
                >
                  {group.categories.map((category) => {
                    const isCatOpen = !!expandedCategories[category.id];
                    const isCatActive = categoryOwnsRoute(category, route, resolveSlugPath);

                    return (
                      <div key={category.id} style={{ display: "flex", flexDirection: "column" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth
                          touch={false}
                          aria-expanded={isCatOpen}
                          tabIndex={isGroupOpen ? 0 : -1}
                          data-sidebar-node="true"
                          data-node-kind="category"
                          data-node-id={`category:${category.id}`}
                          data-group-id={group.id}
                          data-category-id={category.id}
                          onClick={() => toggleCategory(category.id)}
                          leadingIcon={<Folder size={14} strokeWidth={1.6} aria-hidden="true" />}
                          trailingIcon={
                            <span
                              style={{
                                marginLeft: "auto",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "var(--hg-space-1)",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "var(--docs-ink-faint, var(--hg-color-faint))",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {category.slugs.length}
                              </span>
                              <ChevronRight
                                size={13}
                                strokeWidth={1.7}
                                aria-hidden="true"
                                style={{
                                  transform: isCatOpen ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: reducedMotion ? "none" : "transform 160ms ease",
                                  color: "var(--docs-ink-faint, var(--hg-color-faint))",
                                }}
                              />
                            </span>
                          }
                          style={{
                            justifyContent: "flex-start",
                            fontWeight: isCatActive ? 600 : 500,
                            fontSize: "var(--hg-font-size-sm)",
                            color: isCatActive
                              ? "var(--docs-ink, var(--hg-color-ink))"
                              : "var(--docs-ink-muted, var(--hg-color-muted))",
                            background:
                              route === `/components/${category.id}`
                                ? "var(--docs-nav-active-bg, var(--hg-color-surface-active))"
                                : undefined,
                            paddingInline: "var(--hg-space-2)",
                          }}
                        >
                          <span style={{ flex: 1, textAlign: "left" }}>{category.label}</span>
                        </Button>

                        <div
                          aria-hidden={!isGroupOpen || !isCatOpen}
                          style={{
                            display: "grid",
                            gridTemplateRows: isCatOpen ? "1fr" : "0fr",
                            opacity: isCatOpen ? 1 : 0,
                            ...transitionStyle,
                          }}
                        >
                          <ul
                            style={{
                              overflow: "hidden",
                              listStyle: "none",
                              margin: 0,
                              padding: isCatOpen
                                ? "2px 0 var(--hg-space-1) var(--hg-space-4)"
                                : "0 0 0 var(--hg-space-4)",
                              borderLeft: "1px solid var(--docs-border, var(--hg-color-border))",
                              marginLeft: "var(--hg-space-3)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "1px",
                            }}
                          >
                            {category.slugs.map((slug) => {
                              const item = CATALOG_BY_SLUG.get(slug);
                              const itemPath = resolveSlugPath(slug, item);
                              const active = isSlugActive(route, slug, itemPath);

                              return (
                                <li key={slug}>
                                  <a
                                    href={href(itemPath)}
                                    tabIndex={isGroupOpen && isCatOpen ? 0 : -1}
                                    aria-current={active ? "page" : undefined}
                                    data-sidebar-node="true"
                                    data-node-kind="item"
                                    data-node-id={`item:${category.id}:${slug}`}
                                    data-group-id={group.id}
                                    data-category-id={category.id}
                                    data-item-path={itemPath}
                                    className="nav-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      routerNavigate(itemPath);
                                      onNavigate?.();
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "5px var(--hg-space-2)",
                                      borderRadius: "var(--hg-radius-md)",
                                      fontSize: "var(--hg-font-size-sm)",
                                      fontWeight: active ? 600 : 500,
                                      color: active
                                        ? "var(--docs-ink, var(--hg-color-ink))"
                                        : "var(--docs-ink-muted, var(--hg-color-muted))",
                                      background: active
                                        ? "var(--docs-nav-active-bg, var(--hg-color-surface-active))"
                                        : undefined,
                                      textDecoration: "none",
                                    }}
                                  >
                                    <span>{titleForSlug(slug)}</span>
                                    {active && (
                                      <span
                                        aria-hidden="true"
                                        style={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: "9999px",
                                          background: "var(--docs-accent, var(--hg-color-accent))",
                                          flexShrink: 0,
                                        }}
                                      />
                                    )}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {extraSections}
    </nav>
  );
}

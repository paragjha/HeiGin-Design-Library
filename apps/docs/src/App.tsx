import * as React from "react";
import {
  ArrowRight,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { Drawer, DrawerContent, IconButton } from "@heigin/ui";
import { href, navigate as routerNavigate, useRoute } from "./lib/router";
import { ACCOUNTS_ENABLED, PLAYGROUND_ENABLED } from "./lib/features";
import { GitHubMark, LogoMark } from "./components/Logo";
import { DocsSidebar, DOCS_GUIDE_ITEMS } from "./components/DocsSidebar";
import { MarketingNav } from "./components/MarketingNav";
import { Footer } from "./components/Footer";
import uiPackage from "../../../packages/ui/package.json";
import { BuilderPage } from "./builder/BuilderPage";
import { componentDocs } from "./content/components";
import { patternDocs } from "./content/patterns";
import { Landing } from "./pages/Landing";
import { DocsOverviewPage } from "./pages/DocsOverview";
import { GettingStartedPage } from "./pages/GettingStarted";
import { ColorsPage, SpacingPage, TokensPage, TypographyPage } from "./pages/Tokens";
import { ComponentIndexPage, ComponentPage } from "./pages/ComponentPage";
import { ComponentsIndex } from "./pages/ComponentsIndex";
import { CategoryPage, isCategorySlug } from "./pages/CategoryPage";
import { BlocksIndex } from "./pages/BlocksIndex";
import { AccessibilityPage, ChangelogPage, CopySourcePage, NextjsPage, NotFoundPage } from "./pages/Guides";
import { McpPage } from "./pages/McpPage";
import { TemplateDetailPage, TemplatesPage } from "./pages/Templates";
import { categories, mcpTools, templates } from "./generated/catalog";
import { PricingPage } from "./pages/Pricing";
import { ACCOUNT_NAV_ITEMS, renderAccountRoute } from "./pages/account";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

export const REPO_URL = "https://github.com/paragjha/HeiGin-Design-Library";
const VERSION = `v${uiPackage.version}`;

/**
 * Authoritative permanent redirect table matching REDIRECTS.md and vercel.json.
 */
export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  "/showcase": "/components",
  "/getting-started": "/docs/getting-started",
  "/tokens": "/docs/tokens",
  "/tokens/colors": "/docs/tokens/colors",
  "/tokens/typography": "/docs/tokens/typography",
  "/tokens/spacing": "/docs/tokens/spacing",
  "/accessibility": "/docs/accessibility",
  "/nextjs": "/docs/nextjs",
  "/copy-source": "/docs/copy-source",
  "/mcp": "/docs/mcp",
  "/changelog": "/docs/changelog",
};

export function resolveRedirect(route: string): string {
  if (LEGACY_REDIRECTS[route]) {
    return LEGACY_REDIRECTS[route];
  }
  if (route.startsWith("/showcase/")) {
    return "/components";
  }
  return route;
}

export function isMarketingShellRoute(route: string): boolean {
  if (
    route === "/" ||
    route === "/components" ||
    route === "/patterns" ||
    route === "/blocks" ||
    route === "/pricing" ||
    route === "/templates" ||
    route.startsWith("/templates/")
  ) {
    return true;
  }
  return false;
}

/**
 * Catalog slugs that are co-documented on a paired component's doc entry.
 */
const PAIRED_DOC_SLUGS: Readonly<Record<string, string>> = {
  "filter-chip": "filter-toolbar",
  "deal-stage": "record-header",
  "sla-clock": "status-badge",
  "spinner": "skeleton",
  "trust-rung-badge": "channel-mark",
};

function findDocBySlug(slug: string) {
  const canonical = PAIRED_DOC_SLUGS[slug] ?? slug;
  return (
    componentDocs.find((d) => d.slug === canonical) ??
    patternDocs.find((d) => d.slug === canonical)
  );
}

function Page({ route }: { route: string }) {
  if (route === "/") return <Landing />;
  if (route === "/docs") return <DocsOverviewPage />;
  if (route === "/docs/getting-started") return <GettingStartedPage />;
  if (route === "/builder" && PLAYGROUND_ENABLED) return <BuilderPage />;
  if (route === "/docs/tokens") return <TokensPage />;
  if (route === "/docs/tokens/colors") return <ColorsPage />;
  if (route === "/docs/tokens/typography") return <TypographyPage />;
  if (route === "/docs/tokens/spacing") return <SpacingPage />;
  if (route === "/docs/accessibility") return <AccessibilityPage />;
  if (route === "/docs/nextjs") return <NextjsPage />;
  if (route === "/docs/copy-source") return <CopySourcePage />;
  if (route === "/docs/changelog") return <ChangelogPage />;
  if (route === "/docs/mcp") return <McpPage />;

  if (route === "/components") return <ComponentsIndex />;
  if (route === "/patterns") {
    return (
      <ComponentIndexPage
        docs={patternDocs}
        base="/patterns"
        title="CRM patterns"
        intro="Higher-level pieces composed from the primitives. Each one is marked observed (seen in the live CRM) or proposed (an extension to review)."
      />
    );
  }
  if (route === "/blocks") return <BlocksIndex />;

  const comp = route.match(/^\/components\/([\w-]+)$/);
  if (comp?.[1]) {
    const slugOrCategory = comp[1];
    if (isCategorySlug(slugOrCategory)) {
      return <CategoryPage key={slugOrCategory} categoryId={slugOrCategory} />;
    }
    const doc = findDocBySlug(slugOrCategory);
    return doc ? <ComponentPage key={slugOrCategory} doc={doc} /> : <NotFoundPage />;
  }

  const pat = route.match(/^\/patterns\/([\w-]+)$/);
  if (pat?.[1]) {
    const doc = findDocBySlug(pat[1]);
    return doc ? <ComponentPage key={pat[1]} doc={doc} /> : <NotFoundPage />;
  }

  if (route === "/templates") return <TemplatesPage />;
  const tpl = route.match(/^\/templates\/([\w-]+)$/);
  if (tpl) {
    const item = templates.find((t) => t.name === tpl[1]);
    return item ? <TemplateDetailPage key={item.name} item={item} /> : <NotFoundPage />;
  }

  if (route === "/pricing") return <PricingPage />;

  const accountPage = renderAccountRoute(route);
  if (accountPage) return accountPage;

  return <NotFoundPage />;
}

/* ---------- Theme ---------- */
type Theme = "light" | "dark" | "system";

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const stored = localStorage.getItem("hg-docs-theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  });

  const apply = React.useCallback((t: Theme) => {
    setThemeState(t);
    if (t === "system") {
      localStorage.removeItem("hg-docs-theme");
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem("hg-docs-theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }
  }, []);

  return [theme, apply];
}

function resolvedDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const dark = resolvedDark(theme);
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun size={15} strokeWidth={1.6} /> : <Moon size={15} strokeWidth={1.6} />}
    </button>
  );
}

/* ---------- Command palette / Search ---------- */
interface SearchItem {
  label: string;
  group: string;
  path: string;
}

function buildSearchItems(): SearchItem[] {
  const items: SearchItem[] = [
    { label: "Home", group: "Pages", path: "/" },
    { label: "Components", group: "Pages", path: "/components" },
    { label: "CRM Patterns", group: "Pages", path: "/patterns" },
    { label: "Blocks", group: "Pages", path: "/blocks" },
    { label: "Templates", group: "Pages", path: "/templates" },
    { label: "Pricing", group: "Pages", path: "/pricing" },
    ...DOCS_GUIDE_ITEMS.map((g) => ({ label: g.label, group: "Documentation", path: g.path })),
  ];
  for (const group of categories) {
    for (const cat of group.categories) {
      items.push({
        label: `${cat.label} (${group.label})`,
        group: "Categories",
        path: `/components/${cat.id}`,
      });
    }
  }
  for (const d of componentDocs) {
    items.push({ label: d.title, group: "Primitives", path: `/components/${d.slug}` });
  }
  for (const d of patternDocs) {
    items.push({ label: d.title, group: "Patterns", path: `/patterns/${d.slug}` });
  }
  for (const t of templates) {
    items.push({ label: t.title, group: "Templates", path: `/templates/${t.name}` });
  }
  for (const tool of mcpTools) {
    items.push({ label: tool, group: "MCP Tools", path: `/docs/mcp#${tool}` });
  }
  if (ACCOUNTS_ENABLED) {
    for (const acc of ACCOUNT_NAV_ITEMS) {
      items.push({ label: acc.label, group: "Account", path: acc.path });
    }
  }
  return items;
}

const ALL_SEARCH_ITEMS = buildSearchItems();

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return ALL_SEARCH_ITEMS;
    const q = query.toLowerCase();
    return ALL_SEARCH_ITEMS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q),
    );
  }, [query]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = React.useCallback(
    (path: string) => {
      routerNavigate(path);
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].path);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, activeIndex, navigate, onClose],
  );

  if (!open) return null;

  const groups: Record<string, SearchItem[]> = {};
  for (const item of filtered) {
    (groups[item.group] ??= []).push(item);
  }

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search components">
        <div className="cmd-palette__input-row">
          <Search size={16} strokeWidth={1.6} className="cmd-palette__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette__input"
            placeholder="Search components, patterns, templates, MCP tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="cmd-palette__close" onClick={onClose} aria-label="Close search">
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>
        <div className="cmd-palette__results" ref={listRef}>
          {filtered.length === 0 && <p className="cmd-palette__empty">No results found.</p>}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="cmd-palette__group">
              <p className="cmd-palette__group-label">{group}</p>
              {items.map((item) => {
                const globalIdx = filtered.indexOf(item);
                return (
                  <button
                    key={item.path}
                    type="button"
                    className="cmd-palette__item"
                    data-active={globalIdx === activeIndex}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Topbar nav links for DocsShell ---------- */
const topbarLinks = [
  { path: "/components", label: "Components" },
  { path: "/patterns", label: "Patterns" },
  { path: "/blocks", label: "Blocks" },
  { path: "/templates", label: "Templates" },
  { path: "/pricing", label: "Pricing" },
  { path: "/docs", label: "Docs" },
  ...(PLAYGROUND_ENABLED ? [{ path: "/builder", label: "Playground" }] : []),
];

/* ---------- Breadcrumbs ---------- */
function Breadcrumbs({ route }: { route: string }) {
  if (route === "/" || route === "/docs") return null;
  // CategoryPage renders its own @heigin/ui Breadcrumb component
  const compMatch = route.match(/^\/components\/([\w-]+)$/);
  if (compMatch?.[1] && isCategorySlug(compMatch[1])) return null;

  const crumbs: { label: string; path: string }[] = [{ label: "Home", path: "/" }];

  if (route.startsWith("/docs/")) {
    crumbs.push({ label: "Docs", path: "/docs" });
    if (route.startsWith("/docs/tokens/")) {
      crumbs.push({ label: "Design tokens", path: "/docs/tokens" });
    }
    const guide = DOCS_GUIDE_ITEMS.find((g) => g.path === route);
    if (guide) {
      crumbs.push({ label: guide.label, path: guide.path });
    }
  } else if (route.startsWith("/components/")) {
    crumbs.push({ label: "Components", path: "/components" });
    const slug = route.slice("/components/".length);
    const cat = categories.flatMap((g) => g.categories).find((c) => c.slugs.includes(slug));
    if (cat) {
      crumbs.push({ label: cat.label, path: `/components/${cat.id}` });
    }
    const doc = findDocBySlug(slug);
    if (doc) {
      crumbs.push({ label: doc.title, path: route });
    }
  } else if (route.startsWith("/patterns/")) {
    crumbs.push({ label: "CRM patterns", path: "/patterns" });
    const slug = route.slice("/patterns/".length);
    const doc = findDocBySlug(slug);
    if (doc) {
      crumbs.push({ label: doc.title, path: route });
    }
  } else if (route.startsWith("/account")) {
    crumbs.push({ label: "Account", path: "/account" });
    const item = ACCOUNT_NAV_ITEMS.find((i) => i.path === route);
    if (item && item.path !== "/account") {
      crumbs.push({ label: item.label, path: item.path });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.path}>
              {!isLast ? (
                <>
                  <a href={href(crumb.path)} className="breadcrumbs__link">{crumb.label}</a>
                  <ChevronRight size={12} strokeWidth={2} className="breadcrumbs__sep" aria-hidden="true" />
                </>
              ) : (
                <span className="breadcrumbs__current" aria-current="page">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- App ---------- */
export function App() {
  const rawRoute = useRoute();
  const route = resolveRedirect(rawRoute);

  // One-pass URL replacement for legacy routes in REDIRECTS.md
  React.useEffect(() => {
    if (rawRoute !== route) {
      window.history.replaceState(null, "", route);
    }
  }, [rawRoute, route]);

  // Intercept clicks on same-origin anchor links so navigation doesn't
  // round-trip through the server. External links, new-tab modifiers, and
  // hash-only anchors (in-page jumps like #faq-6) are all left alone.
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#") || (/^(mailto|tel|https?):/.test(hrefAttr) && new URL(a.href).origin !== window.location.origin)) return;
      const url = new URL(a.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      routerNavigate(resolveRedirect(url.pathname) + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isMarketing = isMarketingShellRoute(route);

  if (isMarketing) {
    return (
      <div
        className="marketing-shell"
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--docs-bg, var(--hg-color-bg))",
          color: "var(--docs-ink, var(--hg-color-ink))",
        }}
      >
        <a
          href="#main"
          className="skip-link"
          onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}
        >
          Skip to content
        </a>
        <MarketingNav
          route={route}
          theme={theme}
          onThemeChange={setTheme}
          docsPath="/docs"
          repoUrl={REPO_URL}
        />
        <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        <main
          id="main"
          tabIndex={-1}
          className={route === "/" ? undefined : "main"}
          style={
            route === "/"
              ? { flex: 1 }
              : { flex: 1, maxWidth: "1180px", width: "100%", margin: "0 auto" }
          }
        >
          <Page route={route} />
        </main>
        <Footer repoUrl={REPO_URL} />
      </div>
    );
  }

  return (
    <div className="shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="sidebar__top">
          <a href={href("/")} className="brand">
            <LogoMark />
            <span>
              HeiGin UI <span className="brand__version">{VERSION}</span>
            </span>
          </a>
          <div
            className="sidebar__search"
            role="button"
            tabIndex={0}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSearchOpen(true);
              }
            }}
          >
            <Search size={14} strokeWidth={1.6} />
            <span>Search</span>
            <kbd>{MOD_KEY}+K</kbd>
          </div>
        </div>
        <DocsSidebar route={route} />
      </aside>
      <header className="mobile-header">
        <a href={href("/")} className="brand">
          <LogoMark size={20} />
          HeiGin UI
        </a>
        <div className="mobile-header__actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="github-link github-link--icon"
            aria-label="View on GitHub (opens in a new tab)"
          >
            <GitHubMark />
          </a>
          <IconButton label="Open navigation" icon={<Menu strokeWidth={1.6} />} onClick={() => setMenuOpen(true)} />
        </div>
      </header>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent side="left" title="HeiGin UI" closeLabel="Close navigation">
          <DocsSidebar route={route} onNavigate={() => setMenuOpen(false)} />
        </DrawerContent>
      </Drawer>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="content">
        <header className="topbar">
          <nav className="topbar__nav" aria-label="Primary">
            {topbarLinks.map((link) => (
              <a
                key={link.path}
                href={href(link.path)}
                className="topbar__nav-link"
                aria-current={
                  (link.path === "/docs" && route.startsWith("/docs")) ||
                  (link.path === "/components" && route.startsWith("/components")) ||
                  (link.path === "/patterns" && route.startsWith("/patterns")) ||
                  route === link.path
                    ? "page"
                    : undefined
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="topbar__actions">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="github-link" data-testid="github-link">
              <GitHubMark />
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={href("/docs/getting-started")} className="cta-link">
              Get started <ArrowRight size={14} strokeWidth={1.8} />
            </a>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="main">
          <Breadcrumbs route={route} />
          <Page route={route} />
        </main>
        <Footer repoUrl={REPO_URL} />
      </div>
    </div>
  );
}

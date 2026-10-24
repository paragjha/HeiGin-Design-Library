import * as React from "react";
import { ArrowRight, ChevronRight, Menu, Moon, Search, Star, Sun, X } from "lucide-react";
import { Drawer, DrawerContent, IconButton } from "@heigin/ui";
import { href, useHashRoute } from "./lib/router";
import { GitHubMark, LogoMark } from "./components/Logo";
import uiPackage from "../../../packages/ui/package.json";
import { BuilderPage } from "./builder/BuilderPage";
import { componentDocs } from "./content/components";
import { patternDocs } from "./content/patterns";
import { OverviewPage } from "./pages/Overview";
import { GettingStartedPage } from "./pages/GettingStarted";
import { ColorsPage, SpacingPage, TokensPage, TypographyPage } from "./pages/Tokens";
import { ComponentIndexPage, ComponentPage } from "./pages/ComponentPage";
import { AccessibilityPage, ChangelogPage, CopySourcePage, NextjsPage, NotFoundPage } from "./pages/Guides";
import { McpPage } from "./pages/McpPage";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

export const REPO_URL = "https://github.com/paragjha/HeiGin-Design-Library";
const VERSION = `v${uiPackage.version}`;
interface NavItem {
  path: string;
  label: string;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const COMPONENT_GROUPS: Record<string, string[]> = {};
for (const d of componentDocs) {
  (COMPONENT_GROUPS[d.group] ??= []).push(d.slug);
}

const nav: NavSection[] = [
  {
    title: "Start here",
    items: [
      { path: "/", label: "Overview" },
      { path: "/getting-started", label: "Getting started" },
      { path: "/builder", label: "Builder" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { path: "/tokens", label: "Design tokens" },
      { path: "/tokens/colors", label: "Colors" },
      { path: "/tokens/typography", label: "Typography" },
      { path: "/tokens/spacing", label: "Spacing and layout" },
    ],
  },
  {
    title: "Components",
    items: [
      { path: "/components", label: "All components" },
      ...componentDocs.map((d) => ({ path: `/components/${d.slug}`, label: d.title })),
    ],
  },
  {
    title: "CRM patterns",
    items: [
      { path: "/patterns", label: "All patterns" },
      ...patternDocs.map((d) => ({ path: `/patterns/${d.slug}`, label: d.title })),
    ],
  },
  {
    title: "Resources",
    items: [
      { path: "/accessibility", label: "Accessibility" },
      { path: "/nextjs", label: "Next.js integration" },
      { path: "/copy-source", label: "Copyable source" },
      { path: "/mcp", label: "MCP server" },
      { path: "/changelog", label: "Changelog" },
    ],
  },
];

function Page({ route }: { route: string }) {
  if (route === "/") return <OverviewPage />;
  if (route === "/getting-started") return <GettingStartedPage />;
  if (route === "/builder") return <BuilderPage />;
  if (route === "/tokens") return <TokensPage />;
  if (route === "/tokens/colors") return <ColorsPage />;
  if (route === "/tokens/typography") return <TypographyPage />;
  if (route === "/tokens/spacing") return <SpacingPage />;
  if (route === "/components") return <ComponentIndexPage docs={componentDocs} base="/components" title="Components" />;
  if (route === "/patterns")
    return (
      <ComponentIndexPage
        docs={patternDocs}
        base="/patterns"
        title="CRM patterns"
        intro="Higher-level pieces composed from the primitives. Each one is marked observed (seen in the live CRM) or proposed (an extension to review)."
      />
    );
  const comp = route.match(/^\/components\/([\w-]+)$/);
  if (comp) {
    const doc = componentDocs.find((d) => d.slug === comp[1]);
    return doc ? <ComponentPage key={doc.slug} doc={doc} /> : <NotFoundPage />;
  }
  const pat = route.match(/^\/patterns\/([\w-]+)$/);
  if (pat) {
    const doc = patternDocs.find((d) => d.slug === pat[1]);
    return doc ? <ComponentPage key={doc.slug} doc={doc} /> : <NotFoundPage />;
  }
  if (route === "/accessibility") return <AccessibilityPage />;
  if (route === "/nextjs") return <NextjsPage />;
  if (route === "/copy-source") return <CopySourcePage />;
  if (route === "/changelog") return <ChangelogPage />;
  if (route === "/mcp") return <McpPage />;
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
    { label: "Overview", group: "Pages", path: "/" },
    { label: "Getting started", group: "Pages", path: "/getting-started" },
    { label: "Builder", group: "Pages", path: "/builder" },
    { label: "Design tokens", group: "Foundations", path: "/tokens" },
    { label: "Colors", group: "Foundations", path: "/tokens/colors" },
    { label: "Typography", group: "Foundations", path: "/tokens/typography" },
    { label: "Spacing and layout", group: "Foundations", path: "/tokens/spacing" },
    { label: "Accessibility", group: "Resources", path: "/accessibility" },
    { label: "Next.js integration", group: "Resources", path: "/nextjs" },
    { label: "Copyable source", group: "Resources", path: "/copy-source" },
    { label: "MCP server", group: "Resources", path: "/mcp" },
    { label: "Changelog", group: "Resources", path: "/changelog" },
  ];
  for (const d of componentDocs) {
    items.push({ label: d.title, group: "Components", path: `/components/${d.slug}` });
  }
  for (const d of patternDocs) {
    items.push({ label: d.title, group: "CRM Patterns", path: `/patterns/${d.slug}` });
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
      window.location.hash = path;
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
            placeholder="Search components, patterns, pages..."
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

/* ---------- Sidebar ---------- */
function sectionOwnsRoute(section: NavSection, route: string) {
  return section.items.some((item) => item.path === route);
}

function SidebarNav({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  const [expanded, setExpanded] = React.useState<string[]>(() =>
    nav.filter((s) => sectionOwnsRoute(s, route)).map((s) => s.title)
  );

  React.useEffect(() => {
    const owning = nav.find((s) => sectionOwnsRoute(s, route));
    if (owning && !expanded.includes(owning.title)) {
      setExpanded((prev) => [...prev, owning.title]);
    }
  }, [route]);

  const toggle = (title: string) => {
    setExpanded((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  return (
    <nav aria-label="Documentation" className="sidebar__nav">
      {nav.map((section) => {
        const isOpen = expanded.includes(section.title);
        const isActive = sectionOwnsRoute(section, route);
        return (
          <div key={section.title} className={`nav-section${isOpen ? " nav-section--open" : ""}${isActive ? " nav-section--active" : ""}`}>
            <button type="button" className="nav-section__toggle" onClick={() => toggle(section.title)} aria-expanded={isOpen}>
              <span>{section.title}</span>
              <svg className="nav-section__chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
            <ul className="nav-section__list">
              {section.items.map((item) => (
                <li key={item.path}>
                  <a href={href(item.path)} aria-current={route === item.path ? "page" : undefined} className="nav-link" onClick={onNavigate}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/* ---------- Topbar nav links ---------- */
const topbarLinks = [
  { path: "/components", label: "Docs" },
  { path: "/builder", label: "Playground" },
  { path: "/changelog", label: "Changelog" },
];

/* ---------- Breadcrumbs ---------- */
function Breadcrumbs({ route }: { route: string }) {
  if (route === "/") return null;

  const crumbs: { label: string; path: string }[] = [{ label: "Home", path: "/" }];

  const allItems = nav.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })));
  const current = allItems.find((i) => i.path === route);

  if (route.startsWith("/components/")) {
    crumbs.push({ label: "Components", path: "/components" });
  } else if (route.startsWith("/patterns/")) {
    crumbs.push({ label: "CRM patterns", path: "/patterns" });
  } else if (route.startsWith("/tokens/")) {
    crumbs.push({ label: "Design tokens", path: "/tokens" });
  }

  if (current) {
    crumbs.push({ label: current.label, path: current.path });
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

function isDocRoute(route: string) {
  return route.startsWith("/components") || route.startsWith("/patterns") || route.startsWith("/tokens") || route === "/getting-started";
}

/* ---------- App ---------- */
export function App() {
  const route = useHashRoute();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    const title = nav.flatMap((s) => s.items).find((i) => i.path === route)?.label;
    document.title = title && route !== "/" ? `${title} · HeiGin UI` : "HeiGin UI";
  }, [route]);

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

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}>
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
          <div className="sidebar__search" role="button" tabIndex={0} aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={14} strokeWidth={1.6} />
            <span>Search</span>
            <kbd>{MOD_KEY}+K</kbd>
          </div>
        </div>
        <SidebarNav route={route} />
        <div className="sidebar__bottom">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="sidebar__star">
            <Star size={14} strokeWidth={1.6} />
            Star on GitHub
          </a>
        </div>
      </aside>
      <header className="mobile-header">
        <a href={href("/")} className="brand">
          <LogoMark size={20} />
          HeiGin UI
        </a>
        <div className="mobile-header__actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="github-link github-link--icon" aria-label="View on GitHub (opens in a new tab)">
            <GitHubMark />
          </a>
          <IconButton label="Open navigation" icon={<Menu strokeWidth={1.6} />} onClick={() => setMenuOpen(true)} />
        </div>
      </header>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent side="left" title="HeiGin UI" closeLabel="Close navigation">
          <SidebarNav route={route} onNavigate={() => setMenuOpen(false)} />
        </DrawerContent>
      </Drawer>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="content">
        <header className="topbar">
          <nav className="topbar__nav">
            {topbarLinks.map((link) => (
              <a
                key={link.path}
                href={href(link.path)}
                className="topbar__nav-link"
                aria-current={
                  link.path === "/components" && isDocRoute(route)
                    ? "page"
                    : route === link.path
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
            <a href={href("/getting-started")} className="cta-link">
              Get started <ArrowRight size={14} strokeWidth={1.8} />
            </a>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="main">
          <Breadcrumbs route={route} />
          <Page route={route} />
        </main>
      </div>
    </div>
  );
}

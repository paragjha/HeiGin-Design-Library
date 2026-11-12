import * as React from "react";
import { Moon, Search, Sun } from "lucide-react";
import { IconButton } from "@heigin/ui";
import { GitHubMark, LogoMark } from "./Logo";
import { href, useRoute } from "../lib/router";

export type MarketingTheme = "light" | "dark" | "system";

export interface MarketingNavProps {
  /** Current route (defaults to `useRoute()`). */
  route?: string;
  /** Controlled theme value; if omitted, manages `hg-docs-theme` internally. */
  theme?: MarketingTheme;
  /** Controlled theme setter. */
  onThemeChange?: (theme: MarketingTheme) => void;
  /** Opens the command palette / search dialog (`Ctrl+K` / `⌘K`). */
  onOpenSearch?: () => void;
  /** Target path for the Docs link (defaults to `/docs`). */
  docsPath?: string;
  /** GitHub repository URL. */
  repoUrl?: string;
}

const DEFAULT_REPO_URL = "https://github.com/paragjha/HeiGin-Design-Library";
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const SHORTCUT_LABEL = IS_MAC ? "⌘K" : "Ctrl+K";

function resolveDark(theme: MarketingTheme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return true;
}

export function MarketingNav({
  route: routeProp,
  theme: controlledTheme,
  onThemeChange,
  onOpenSearch,
  docsPath = "/docs",
  repoUrl = DEFAULT_REPO_URL,
}: MarketingNavProps) {
  const activeRoute = useRoute();
  const route = routeProp ?? activeRoute;

  const [internalTheme, setInternalTheme] = React.useState<MarketingTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("hg-docs-theme");
    return stored === "light" ? "light" : "dark";
  });

  const currentTheme = controlledTheme ?? internalTheme;
  const isDark = resolveDark(currentTheme);

  const toggleTheme = React.useCallback(() => {
    const next: MarketingTheme = isDark ? "light" : "dark";
    if (onThemeChange) {
      onThemeChange(next);
    } else {
      setInternalTheme(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hg-docs-theme", next);
        document.documentElement.setAttribute("data-theme", next);
      }
    }
  }, [isDark, onThemeChange]);

  const handleSearchClick = React.useCallback(() => {
    if (onOpenSearch) {
      onOpenSearch();
      return;
    }
    if (typeof document !== "undefined") {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    }
  }, [onOpenSearch]);

  const links = React.useMemo(
    () => [
      { path: "/components", label: "Components" },
      { path: "/patterns", label: "Patterns" },
      { path: "/templates", label: "Templates" },
      { path: "/pricing", label: "Pricing" },
      { path: "/docs/mcp", label: "MCP" },
      { path: docsPath, label: "Docs" },
    ],
    [docsPath],
  );

  return (
    <header
      aria-label="Site header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--hg-z-header)",
        height: "56px",
        maxWidth: "100%",
        overflowX: "clip",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingInline: "var(--hg-space-4)",
        background: "var(--docs-header-bg, var(--hg-color-surface))",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--docs-border, var(--hg-color-border))",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--hg-space-3)",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--hg-space-3)",
            minWidth: 0,
            flex: 1,
          }}
        >
          <a
            href={href("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--hg-space-2)",
              color: "var(--docs-ink, var(--hg-color-ink))",
              fontWeight: 600,
              fontSize: "var(--hg-font-size-md)",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            <LogoMark size={20} />
            <span>HeiGin UI</span>
          </a>

          <span
            aria-hidden="true"
            style={{
              width: "1px",
              height: "16px",
              background: "var(--docs-border, var(--hg-color-border))",
              flexShrink: 0,
            }}
          />

          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--hg-space-1)",
              overflowX: "auto",
              minWidth: 0,
              scrollbarWidth: "none",
            }}
          >
            {links.map((link) => {
              const isActive =
                route === link.path ||
                (link.path !== "/" &&
                  link.path !== "/docs" &&
                  route.startsWith(`${link.path}/`)) ||
                (link.path === "/docs" &&
                  route.startsWith("/docs") &&
                  !route.startsWith("/docs/mcp"));
              return (
                <a
                  key={link.path}
                  href={href(link.path)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px var(--hg-space-3)",
                    borderRadius: "var(--hg-radius-md)",
                    fontSize: "var(--hg-font-size-sm)",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? "var(--docs-ink, var(--hg-color-ink))"
                      : "var(--docs-ink-muted, var(--hg-color-muted))",
                    background: isActive
                      ? "var(--docs-nav-active-bg, var(--hg-color-surface-active))"
                      : "transparent",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "color 120ms ease, background-color 120ms ease",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--hg-space-2)",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="marketing-nav__search"
            aria-label="Search components"
            onClick={handleSearchClick}
          >
            <Search size={14} strokeWidth={1.6} aria-hidden="true" />
            <span className="marketing-nav__search-label">Search components...</span>
            <kbd>{SHORTCUT_LABEL}</kbd>
          </button>

          <IconButton
            size="sm"
            touch={false}
            label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            icon={
              isDark ? (
                <Sun size={15} strokeWidth={1.6} aria-hidden="true" />
              ) : (
                <Moon size={15} strokeWidth={1.6} aria-hidden="true" />
              )
            }
            onClick={toggleTheme}
          />

          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="github-link"
            aria-label="View on GitHub (opens in a new tab)"
            className="marketing-nav__github"
          >
            <GitHubMark size={16} />
            <span className="sr-only">GitHub (opens in a new tab)</span>
          </a>

          <a href={href("/docs/getting-started")} className="cta-link">
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

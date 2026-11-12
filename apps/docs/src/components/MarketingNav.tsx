import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button, IconButton, Tooltip, TooltipProvider } from "@heigin/ui";
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
  /** Target path for the Docs link (defaults to `/docs` for the root-route pivot, or `/getting-started`). */
  docsPath?: string;
  /** GitHub repository URL. */
  repoUrl?: string;
}

const DEFAULT_REPO_URL = "https://github.com/paragjha/HeiGin-Design-Library";

function resolveDark(theme: MarketingTheme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function MarketingNav({
  route: routeProp,
  theme: controlledTheme,
  onThemeChange,
  docsPath = "/docs",
  repoUrl = DEFAULT_REPO_URL,
}: MarketingNavProps) {
  const activeRoute = useRoute();
  const route = routeProp ?? activeRoute;

  const [internalTheme, setInternalTheme] = React.useState<MarketingTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("hg-docs-theme");
    return stored === "dark" || stored === "light" ? stored : "system";
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

  const links = React.useMemo(
    () => [
      { path: "/components", label: "Components" },
      { path: "/patterns", label: "Patterns" },
      { path: "/blocks", label: "Blocks" },
      { path: "/templates", label: "Templates" },
      { path: "/pricing", label: "Pricing" },
      { path: docsPath, label: "Docs" },
    ],
    [docsPath],
  );

  return (
    <TooltipProvider>
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
          justifyContent: "space-between",
          gap: "var(--hg-space-3)",
          paddingInline: "var(--hg-space-4)",
          background: "var(--docs-header-bg, var(--hg-color-surface))",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--docs-border, var(--hg-color-border))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--hg-space-4)",
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
            <LogoMark size={24} />
            <span>HeiGin UI</span>
          </a>

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
                (link.path !== "/" && route.startsWith(`${link.path}/`));
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
            display: " flex",
            alignItems: "center",
            gap: "var(--hg-space-2)",
            flexShrink: 0,
          }}
        >
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="github-link"
            aria-label="View on GitHub (opens in a new tab)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--hg-space-2)",
              padding: "6px var(--hg-space-2)",
              borderRadius: "var(--hg-radius-md)",
              color: "var(--docs-ink-muted, var(--hg-color-muted))",
              fontSize: "var(--hg-font-size-sm)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <GitHubMark size={16} />
            <span>GitHub</span>
          </a>

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

          <Tooltip content="Coming soon" side="bottom">
            <span
              tabIndex={0}
              title="Coming soon"
              style={{ display: "inline-flex", cursor: "not-allowed" }}
            >
              <Button
                variant="secondary"
                size="sm"
                touch={false}
                disabled
                aria-disabled="true"
                title="Coming soon"
                style={{ pointerEvents: "none" }}
              >
                Sign in
              </Button>
            </span>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}

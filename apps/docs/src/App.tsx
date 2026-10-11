import * as React from "react";
import { Menu } from "lucide-react";
import { Drawer, DrawerContent, IconButton } from "@heigin/ui";
import { href, useHashRoute } from "./lib/router";
import { LogoMark } from "./components/Logo";
import { componentDocs } from "./content/components";
import { patternDocs } from "./content/patterns";
import { OverviewPage } from "./pages/Overview";
import { GettingStartedPage } from "./pages/GettingStarted";
import { ColorsPage, SpacingPage, TokensPage, TypographyPage } from "./pages/Tokens";
import { ComponentIndexPage, ComponentPage } from "./pages/ComponentPage";
import { AccessibilityPage, ChangelogPage, CopySourcePage, NextjsPage, NotFoundPage } from "./pages/Guides";

interface NavItem {
  path: string;
  label: string;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const nav: NavSection[] = [
  {
    title: "Start",
    items: [
      { path: "/", label: "Overview" },
      { path: "/getting-started", label: "Getting started" },
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
    items: [{ path: "/components", label: "All components" }, ...componentDocs.map((d) => ({ path: `/components/${d.slug}`, label: d.title }))],
  },
  {
    title: "CRM patterns",
    items: [{ path: "/patterns", label: "All patterns" }, ...patternDocs.map((d) => ({ path: `/patterns/${d.slug}`, label: d.title }))],
  },
  {
    title: "Guides",
    items: [
      { path: "/accessibility", label: "Accessibility" },
      { path: "/nextjs", label: "Next.js integration" },
      { path: "/copy-source", label: "Copyable source" },
      { path: "/changelog", label: "Changelog" },
    ],
  },
];

function Page({ route }: { route: string }) {
  if (route === "/") return <OverviewPage />;
  if (route === "/getting-started") return <GettingStartedPage />;
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
  return <NotFoundPage />;
}

function SidebarNav({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="sidebar__nav">
      {nav.map((section) => (
        <div key={section.title} className="nav-section">
          <p className="nav-section__title">{section.title}</p>
          <ul>
            {section.items.map((item) => (
              <li key={item.path}>
                <a href={href(item.path)} aria-current={route === item.path ? "page" : undefined} className="nav-link" onClick={onNavigate}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function App() {
  const route = useHashRoute();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const title = nav.flatMap((s) => s.items).find((i) => i.path === route)?.label;
    document.title = title && route !== "/" ? `${title} · HeiGin UI` : "HeiGin UI";
  }, [route]);

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}>
        Skip to content
      </a>
      <aside className="sidebar">
        <a href={href("/")} className="brand">
          <LogoMark />
          <span>
            HeiGin UI <span className="brand__version">v0.1.0</span>
          </span>
        </a>
        <SidebarNav route={route} />
      </aside>
      <header className="mobile-header">
        <a href={href("/")} className="brand">
          <LogoMark />
          HeiGin UI
        </a>
        <IconButton label="Open navigation" icon={<Menu strokeWidth={1.6} />} onClick={() => setMenuOpen(true)} />
      </header>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent side="left" title="HeiGin UI" closeLabel="Close navigation">
          <SidebarNav route={route} onNavigate={() => setMenuOpen(false)} />
        </DrawerContent>
      </Drawer>
      <main id="main" tabIndex={-1} className="main">
        <Page route={route} />
      </main>
    </div>
  );
}


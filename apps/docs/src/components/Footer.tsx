import { LogoMark } from "./Logo";
import { href } from "../lib/router";

export interface FooterProps {
  /** GitHub repository URL. */
  repoUrl?: string;
}

const DEFAULT_REPO_URL = "https://github.com/paragjha/HeiGin-Design-Library";

export function Footer({ repoUrl = DEFAULT_REPO_URL }: FooterProps) {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: "Catalog",
      links: [
        { label: "Components", href: href("/components"), external: false },
        { label: "Patterns", href: href("/patterns"), external: false },
        { label: "Blocks", href: href("/blocks"), external: false },
        { label: "Templates", href: href("/templates"), external: false },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Documentation", href: href("/getting-started"), external: false },
        { label: "GitHub", href: repoUrl, external: true },
        { label: "Changelog", href: href("/changelog"), external: false },
        { label: "Pricing", href: href("/pricing"), external: false },
      ],
    },
    {
      heading: "Company & Legal",
      links: [
        { label: "Contact", href: "mailto:sales@heigin.com", external: true },
        { label: "Legal", href: href("/pricing#pricing-explainer-heading"), external: false },
        { label: "License", href: href("/pricing#pricing-explainer-heading"), external: false },
      ],
    },
  ] as const;

  return (
    <footer
      aria-label="Site footer"
      style={{
        borderTop: "1px solid var(--docs-border, var(--hg-color-border))",
        background: "var(--docs-bg-subtle, var(--hg-color-sidebar))",
        color: "var(--docs-ink-muted, var(--hg-color-muted))",
        padding: "var(--hg-space-10, 40px) var(--hg-space-6) var(--hg-space-8, 32px)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--hg-space-8, 32px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--hg-space-6)",
          }}
        >
          {columns.map((col) => (
            <div
              key={col.heading}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--hg-space-3)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--hg-font-size-xs)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--docs-ink, var(--hg-color-ink))",
                }}
              >
                {col.heading}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--hg-space-2)",
                }}
              >
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external && link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.external && link.href.startsWith("http") ? "noreferrer" : undefined}
                      style={{
                        fontSize: "var(--hg-font-size-sm)",
                        color: "var(--docs-ink-muted, var(--hg-color-muted))",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--hg-space-4)",
            paddingTop: "var(--hg-space-6)",
            borderTop: "1px solid var(--docs-border-subtle, var(--hg-color-border))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--hg-space-3)",
            }}
          >
            <LogoMark size={22} />
            <div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "var(--hg-font-size-sm)",
                  color: "var(--docs-ink, var(--hg-color-ink))",
                }}
              >
                HeiGin UI
              </span>
              <span
                style={{
                  marginLeft: "var(--hg-space-2)",
                  fontSize: "var(--hg-font-size-xs)",
                  color: "var(--docs-ink-faint, var(--hg-color-faint))",
                }}
              >
                Design tokens, accessible primitives &amp; CRM patterns.
              </span>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "var(--hg-font-size-xs)",
              color: "var(--docs-ink-faint, var(--hg-color-faint))",
            }}
          >
            &copy; {year} HeiGin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

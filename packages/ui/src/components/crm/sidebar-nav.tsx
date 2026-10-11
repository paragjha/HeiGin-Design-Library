import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** Badge count, e.g. unread conversations. */
  count?: number;
}

export interface SidebarNavGroup {
  /** Optional group heading ("Money", "Agent"). */
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps {
  groups: SidebarNavGroup[];
  /** `href` of the current page; gets aria-current="page". */
  currentHref: string;
  /** Accessible name for the <nav>. */
  label?: string;
  /**
   * Custom link renderer for client-side routing, e.g. Next.js:
   * renderLink={(props) => <Link {...props} />}
   */
  renderLink?: (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => React.ReactNode;
  className?: string;
}

/**
 * App navigation rail content (place it inside your 240px sidebar, or a left Drawer on mobile).
 * Server-component safe unless you pass a client-only renderLink.
 */
export function SidebarNav({ groups, currentHref, label = "Main", renderLink, className }: SidebarNavProps) {
  return (
    <nav aria-label={label} className={cn(styles.sidebar, className)}>
      {groups.map((group, gi) => {
        const headingId = group.label ? `hg-nav-${gi}` : undefined;
        return (
          <div key={group.label ?? gi}>
            {group.label && (
              <p id={headingId} className={styles.navGroupLabel}>
                {group.label}
              </p>
            )}
            <ul className={styles.navList} aria-labelledby={headingId}>
              {group.items.map((item) => {
                const current = item.href === currentHref;
                const content = (
                  <>
                    {item.icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{item.icon}</span>}
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && <span className={styles.navCount}>{item.count}</span>}
                  </>
                );
                const linkProps = {
                  href: item.href,
                  className: styles.navItem,
                  "aria-current": current ? ("page" as const) : undefined,
                  children: content,
                };
                return <li key={item.href}>{renderLink ? renderLink(linkProps) : <a {...linkProps} />}</li>;
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

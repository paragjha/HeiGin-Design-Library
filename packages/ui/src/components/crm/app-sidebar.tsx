"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { Tooltip } from "../ui/tooltip";
import styles from "./app-sidebar.module.css";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export interface AppSidebarRailItem {
  /** Accessible name and tooltip; the rail shows only the icon. */
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface AppSidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** Badge count, e.g. drafts waiting. Hidden when 0. */
  count?: number;
  /** Sub-pages listed under this one, indented and without icons. */
  children?: AppSidebarItem[];
  /** Shows a + button beside the item. */
  onAdd?: () => void;
  /** Accessible name for the + button. Default "New in {label}". */
  addLabel?: string;
}

export interface AppSidebarGroup {
  /** Optional heading ("Today", "Reports"). */
  label?: string;
  items: AppSidebarItem[];
}

export interface AppSidebarProps {
  /** Top of the rail: your logo tile, for example HeiGinMark. */
  brand?: React.ReactNode;
  /** The app's areas as icons, in groups the rail separates with a gap. */
  rail: AppSidebarRailItem[][];
  /** Icons pinned to the bottom of the rail, such as help and settings. */
  railFooter?: AppSidebarRailItem[];
  /** `href` of the current area; its rail icon gets aria-current="page". */
  currentRail?: string;
  /** Top of the panel, for example a WorkspaceSwitcher with variant="stacked". */
  header?: React.ReactNode;
  /** The current area's pages, shown in the panel. */
  groups: AppSidebarGroup[];
  /** `href` of the current page; gets aria-current="page". */
  currentHref: string;
  /** Bottom of the panel, such as an upgrade card or the signed-in user. */
  footer?: React.ReactNode;
  /** Hides the panel, leaving the rail. Controlled when set. */
  collapsed?: boolean;
  /** Starting state when `collapsed` isn't controlled. Default false. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible name for the panel's <nav>. Default "Main". */
  label?: string;
  /** Accessible name for the rail's <nav>. Default "Areas". */
  railLabel?: string;
  /**
   * Custom link renderer for client-side routing, e.g. Next.js:
   * renderLink={(props) => <Link {...props} />}. Rail links sit inside a tooltip, so the element
   * must take a ref (Next.js Link does).
   */
  renderLink?: (props: LinkProps) => React.ReactElement;
  className?: string;
}

/**
 * Two-level app navigation: a rail of area icons beside a panel with the current area's pages,
 * nested sub-pages, counts and + actions. The panel collapses to leave the rail. Put it in a
 * full-height column, or inside a left Drawer on phones.
 */
export function AppSidebar({
  brand,
  rail,
  railFooter = [],
  currentRail,
  header,
  groups,
  currentHref,
  footer,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  label = "Main",
  railLabel = "Areas",
  renderLink,
  className,
}: AppSidebarProps) {
  const [own, setOwn] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? own;
  const panelId = React.useId();
  const toggle = () => {
    if (collapsedProp === undefined) setOwn(!collapsed);
    onCollapsedChange?.(!collapsed);
  };
  const link = (props: LinkProps) => (renderLink ? renderLink(props) : <a {...props} />);

  const railItem = (item: AppSidebarRailItem) => (
    <li key={item.href}>
      <Tooltip content={item.label} side="right" delay={200}>
        {link({
          href: item.href,
          className: styles.railItem,
          "aria-label": item.label,
          "aria-current": item.href === currentRail ? "page" : undefined,
          children: <span aria-hidden="true">{item.icon}</span>,
        })}
      </Tooltip>
    </li>
  );

  const row = (item: AppSidebarItem, child: boolean) => (
    <li key={item.href}>
      <div className={styles.row}>
        {link({
          href: item.href,
          className: cn(styles.item, child && styles.child),
          "aria-current": item.href === currentHref ? "page" : undefined,
          children: (
            <>
              {!child && item.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className={styles.itemLabel}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && <span className={styles.count}>{item.count}</span>}
            </>
          ),
        })}
        {item.onAdd && (
          <button type="button" className={styles.add} aria-label={item.addLabel ?? `New in ${item.label}`} onClick={item.onAdd}>
            <Plus aria-hidden="true" />
          </button>
        )}
      </div>
      {item.children && item.children.length > 0 && <ul className={styles.list}>{item.children.map((c) => row(c, true))}</ul>}
    </li>
  );

  return (
    <div className={cn(styles.root, className)} data-collapsed={collapsed || undefined}>
      <nav aria-label={railLabel} className={styles.rail}>
        {brand && <div className={styles.brand}>{brand}</div>}
        {rail.map((group, gi) => (
          <ul key={gi} className={styles.railGroup}>
            {group.map(railItem)}
          </ul>
        ))}
        <ul className={cn(styles.railGroup, styles.railFooter)}>
          <li>
            <Tooltip content={collapsed ? "Show panel" : "Hide panel"} side="right" delay={200}>
              <button type="button" className={styles.railItem} aria-label="Navigation panel" aria-expanded={!collapsed} aria-controls={panelId} onClick={toggle}>
                {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
              </button>
            </Tooltip>
          </li>
          {railFooter.map(railItem)}
        </ul>
      </nav>

      {/* Collapsed, the panel is inert: hidden from Tab and screen readers while it slides shut. */}
      <div id={panelId} className={styles.panelSlot} inert={collapsed}>
        <div className={styles.panel}>
          {header && <div className={styles.header}>{header}</div>}
          <nav aria-label={label} className={styles.groups}>
            {groups.map((group, gi) => {
              const headingId = group.label ? `${panelId}-g${gi}` : undefined;
              return (
                <div key={group.label ?? gi} className={styles.group}>
                  {group.label && (
                    <p id={headingId} className={styles.groupLabel}>
                      {group.label}
                    </p>
                  )}
                  <ul className={styles.list} aria-labelledby={headingId}>
                    {group.items.map((item) => row(item, false))}
                  </ul>
                </div>
              );
            })}
          </nav>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

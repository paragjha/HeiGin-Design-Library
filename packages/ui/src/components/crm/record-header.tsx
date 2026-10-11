import * as React from "react";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/avatar";
import styles from "./crm.module.css";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface RecordHeaderProps {
  /** Record name: person, company or deal. */
  name: string;
  /** Status next to the name (StatusBadge, TrustRungBadge). */
  status?: React.ReactNode;
  /** Short facts: owner, value, location, channel. */
  meta?: React.ReactNode[];
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  showAvatar?: boolean;
  avatarSrc?: string;
  /** Heading level. Detail pages use the default h1; pass 2 when embedding. */
  level?: 1 | 2;
  className?: string;
}

/** Top of a record detail page: breadcrumbs, avatar, name, status, key facts and actions. Server-component safe. */
export function RecordHeader({ name, status, meta, breadcrumbs, actions, showAvatar = true, avatarSrc, level = 1, className }: RecordHeaderProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <header className={className}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <ol>
            {breadcrumbs.map((b, i) => (
              <li key={`${b.label}-${i}`}>{b.href ? <a href={b.href}>{b.label}</a> : <span aria-current="page">{b.label}</span>}</li>
            ))}
          </ol>
        </nav>
      )}
      <div className={cn(styles.record)}>
        {showAvatar && <Avatar name={name} src={avatarSrc} size="lg" decorative />}
        <div className={styles.recordText}>
          <div className={styles.recordTitleRow}>
            <Heading className={styles.recordTitle}>{name}</Heading>
            {status}
          </div>
          {meta && meta.length > 0 && (
            <ul className={styles.recordMeta}>
              {meta.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        {actions && <div className={styles.pageActions}>{actions}</div>}
      </div>
    </header>
  );
}

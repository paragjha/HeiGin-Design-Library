import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary and secondary page actions, right-aligned (wraps below on narrow screens). */
  actions?: React.ReactNode;
  /** Heading level. Pages use the default h1; pass 2 when embedding the header inside another page. */
  level?: 1 | 2;
}

/** Page title row: h1, one line of context, and the page's actions. Server-component safe. */
export function PageHeader({ title, description, actions, level = 1, className, ...props }: PageHeaderProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <header className={cn(styles.pageHeader, className)} {...props}>
      <div className={styles.pageHeaderText}>
        <Heading className={styles.pageTitle}>{title}</Heading>
        {description && <p className={styles.pageDescription}>{description}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}

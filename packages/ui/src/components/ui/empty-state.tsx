import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./empty-state.module.css";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary next step, e.g. a Button. */
  action?: React.ReactNode;
  /** `inline` for inside cards and tables, `page` for whole empty screens. */
  size?: "inline" | "page";
}

/** Explains why a view is empty and what to do next. Server-component safe. */
export function EmptyState({ icon, title, description, action, size = "inline", className, ...props }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, styles[size], className)} {...props}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

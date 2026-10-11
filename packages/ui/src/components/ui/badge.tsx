import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./badge.module.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Leading status dot. Status must never rely on colour alone, so keep a text label. */
  dot?: boolean;
  /** Leading icon (14px). Decorative; the label carries the meaning. */
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

/** Compact label for status, category or count. Server-component safe. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", dot = false, icon, size = "md", className, children, ...props },
  ref,
) {
  return (
    <span ref={ref} data-tone={tone} className={cn(styles.badge, styles[tone], size === "sm" && styles.sm, className)} {...props}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
});

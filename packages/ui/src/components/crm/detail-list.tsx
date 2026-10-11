import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  /** Optional 14px Lucide icon before the label. */
  icon?: React.ReactNode;
}

export interface DetailListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, "children"> {
  items: DetailItem[];
  /** Label column width. Production uses 100px. */
  labelWidth?: string;
}

/**
 * Key/value facts for a record (production "Deal details" panel): 100px muted label column,
 * 13px value, 12px row gap. A real <dl>, so pairs are announced together. Server-component safe.
 */
export function DetailList({ items, labelWidth = "100px", className, style, ...props }: DetailListProps) {
  return (
    <dl className={cn(styles.details, className)} style={{ ["--detail-label-width" as string]: labelWidth, ...style }} {...props}>
      {items.map((item) => (
        <div key={item.label} className={styles.detailRow}>
          <dt className={styles.detailLabel}>
            {item.icon && (
              <span aria-hidden="true" className={styles.detailIcon}>
                {item.icon}
              </span>
            )}
            {item.label}
          </dt>
          <dd className={styles.detailValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

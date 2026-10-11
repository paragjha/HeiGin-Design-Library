import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: string;
  value: React.ReactNode;
  /** Small context line under the value, e.g. "12 open deals". */
  hint?: React.ReactNode;
  /** 14–15px Lucide icon shown before the label. */
  icon?: React.ReactNode;
  /** Colour the value only when it needs attention (production: overdue tasks in danger). */
  tone?: "default" | "danger" | "warning" | "success";
  /** Optional change indicator. Direction is shown with an icon and words, not colour alone. */
  trend?: { direction: "up" | "down"; label: string; good?: boolean };
}

/**
 * One KPI: label, value and hint. On its own it renders as a bordered surface; inside a
 * MetricGroup it becomes a cell of the production dashboard's single KPI strip. Server-component safe.
 */
export function MetricCard({ label, value, hint, icon, tone = "default", trend, className, ...props }: MetricCardProps) {
  const toneClass = tone === "danger" ? styles.toneDanger : tone === "warning" ? styles.toneWarning : tone === "success" ? styles.toneSuccess : undefined;
  const good = trend ? (trend.good ?? trend.direction === "up") : false;
  return (
    <div className={cn(styles.metric, className)} {...props}>
      <span className={styles.metricLabel}>
        {icon && (
          <span aria-hidden="true" style={{ display: "inline-flex" }}>
            {icon}
          </span>
        )}
        {label}
      </span>
      <span className={cn(styles.metricValue, toneClass)}>{value}</span>
      {(hint || trend) && (
        <span className={styles.metricHint}>
          {trend && (
            <span className={cn(styles.inlineMark, good ? styles.trendUp : styles.trendDown)} style={{ marginRight: 6 }}>
              {trend.direction === "up" ? <TrendingUp strokeWidth={1.6} aria-hidden="true" /> : <TrendingDown strokeWidth={1.6} aria-hidden="true" />}
              {trend.label}
            </span>
          )}
          {hint}
        </span>
      )}
    </div>
  );
}

export interface MetricGroupProps extends React.HTMLAttributes<HTMLElement> {
  /** Columns from 1024px up (2 below). Production dashboard uses 5. */
  columns?: number;
  /** Accessible name for the group, e.g. "Pipeline summary". */
  label?: string;
}

/** Bordered KPI strip: MetricCards inside become divided cells. Server-component safe. */
export function MetricGroup({ columns = 4, label, className, style, children, ...props }: MetricGroupProps) {
  return (
    <section
      aria-label={label}
      className={cn(styles.metricGroup, className)}
      style={{ ["--metric-columns" as string]: columns, ...style }}
      {...props}
    >
      {children}
    </section>
  );
}

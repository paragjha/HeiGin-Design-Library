import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card } from "../ui/card";
import styles from "./crm.module.css";

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: string;
  value: React.ReactNode;
  /** Small context line under the value, e.g. "vs ₹9.2 L last month". */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Colour the value only when it needs attention. */
  tone?: "default" | "danger" | "warning" | "success";
  /** Optional change indicator. Direction is shown with an icon and words, not colour alone. */
  trend?: { direction: "up" | "down"; label: string; good?: boolean };
}

/** One headline number in a summary strip (Today, Pulse, Reports). Server-component safe. */
export function MetricCard({ label, value, hint, icon, tone = "default", trend, className, ...props }: MetricCardProps) {
  const toneClass = tone === "danger" ? styles.toneDanger : tone === "warning" ? styles.toneWarning : tone === "success" ? styles.toneSuccess : undefined;
  const good = trend ? (trend.good ?? trend.direction === "up") : false;
  return (
    <Card className={cn(styles.metric, className)} {...props}>
      <span className={styles.metricLabel}>
        {icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{icon}</span>}
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
    </Card>
  );
}

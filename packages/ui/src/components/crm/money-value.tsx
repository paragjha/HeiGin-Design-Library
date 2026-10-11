import * as React from "react";
import { cn } from "../../lib/cn";
import { VisuallyHidden } from "../ui/visually-hidden";
import { formatINR, formatINRCompact } from "../../lib/format";
import styles from "./crm.module.css";

export interface MoneyValueProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  amount: number;
  /** `full` = ₹8,49,600 · `compact` = ₹8.5L (full value exposed via title + accessible text). */
  format?: "full" | "compact";
  withPaise?: boolean;
}

/** The only sanctioned way to render money: Indian grouping and tabular numerals. Server-component safe. */
export function MoneyValue({ amount, format = "full", withPaise = false, className, ...props }: MoneyValueProps) {
  const full = formatINR(amount, withPaise);
  if (format === "compact") {
    return (
      <span className={cn(styles.money, className)} title={full} {...props}>
        <span aria-hidden="true">{formatINRCompact(amount)}</span>
        <VisuallyHidden>{full}</VisuallyHidden>
      </span>
    );
  }
  return (
    <span className={cn(styles.money, className)} {...props}>
      {full}
    </span>
  );
}

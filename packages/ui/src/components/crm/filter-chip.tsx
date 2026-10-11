"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Toggle chip: pressed state. Omit `pressed` and pass `onRemove` for an applied-filter chip. */
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Applied-filter chip: shows a remove button instead of toggling. */
  onRemove?: () => void;
  count?: number;
  /** Accessible name for the remove button. Defaults to "Remove filter: <chip text>". */
  removeLabel?: string;
}

/** Plain text of string/number children, e.g. ["Owner: ", "Meera S"] -> "Owner: Meera S". */
function textOf(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .filter((c): c is string | number => typeof c === "string" || typeof c === "number")
    .join("")
    .trim();
}

/**
 * Quick filter. Two modes: a toggle (aria-pressed) for preset filters such as "Hot" or "Unassigned",
 * or a removable chip that shows an applied filter ("Owner: Meera S ×").
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(function FilterChip(
  { pressed, onPressedChange, onRemove, count, removeLabel, className, children, ...props },
  ref,
) {
  if (onRemove) {
    return (
      <span className={cn(styles.chip, styles.chipStatic, className)}>
        {children}
        <button type="button" className={styles.chipRemove} aria-label={removeLabel ?? `Remove filter: ${textOf(children) || "filter"}`} onClick={onRemove}>
          <X strokeWidth={2} aria-hidden="true" />
        </button>
      </span>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed ?? false}
      className={cn(styles.chip, className)}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    >
      {children}
      {count !== undefined && <span className={styles.chipCount}>{count}</span>}
    </button>
  );
});

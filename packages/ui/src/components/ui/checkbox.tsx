"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";
import styles from "./choice.module.css";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>, "className" | "render" | "children"> {
  /** Visible label. Omit only when the checkbox is labelled another way (e.g. `aria-label` in a table row). */
  label?: React.ReactNode;
  /** Secondary text under the label. */
  description?: React.ReactNode;
  className?: string;
}

/** Checkbox built on Base UI. Supports `checked`, `defaultChecked`, `indeterminate` and `onCheckedChange`. */
export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(function Checkbox(
  { label, description, className, indeterminate, disabled, ...props },
  ref,
) {
  const control = (
    <BaseCheckbox.Root
      ref={ref as React.Ref<HTMLButtonElement>}
      indeterminate={indeterminate}
      disabled={disabled}
      className={cn(styles.box, !label && className)}
      {...props}
    >
      <BaseCheckbox.Indicator className={styles.indicator} keepMounted={false}>
        {indeterminate ? <Minus strokeWidth={2.5} aria-hidden="true" /> : <Check strokeWidth={2.5} aria-hidden="true" />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!label) return control;
  return (
    <label className={cn(styles.choice, className)} data-disabled={disabled ? "" : undefined}>
      {control}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  );
});

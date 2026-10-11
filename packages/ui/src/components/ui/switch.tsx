"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "../../lib/cn";
import styles from "./choice.module.css";

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>, "className" | "render" | "children"> {
  /** Visible label. Without one, pass `aria-label`. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

/** On/off toggle for settings that apply immediately. Built on Base UI (`role="switch"`). */
export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(
  { label, description, className, disabled, ...props },
  ref,
) {
  const control = (
    <BaseSwitch.Root
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      className={cn(styles.switch, !label && className)}
      {...props}
    >
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
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

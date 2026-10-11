"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cn } from "../../lib/cn";
import styles from "./choice.module.css";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseRadioGroup>, "className" | "render" | "children" | "onValueChange"> {
  /** Group label, rendered as the accessible name. */
  label: React.ReactNode;
  options: RadioOption[];
  onValueChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/** A labelled set of mutually exclusive options. Arrow keys move between options. */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { label, options, onValueChange, orientation = "vertical", className, disabled, ...props },
  ref,
) {
  const labelId = React.useId();
  return (
    <BaseRadioGroup
      ref={ref}
      aria-labelledby={labelId}
      data-orientation={orientation}
      disabled={disabled}
      onValueChange={(value) => onValueChange?.(value as string)}
      className={cn(styles.group, className)}
      {...props}
    >
      <span id={labelId} className={styles.legend}>
        {label}
      </span>
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        return (
          <label key={option.value} className={styles.choice} data-disabled={isDisabled ? "" : undefined}>
            <BaseRadio.Root value={option.value} disabled={isDisabled} className={styles.radio}>
              <BaseRadio.Indicator className={styles.radioDot} />
            </BaseRadio.Root>
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              {option.description && <span className={styles.description}>{option.description}</span>}
            </span>
          </label>
        );
      })}
    </BaseRadioGroup>
  );
});

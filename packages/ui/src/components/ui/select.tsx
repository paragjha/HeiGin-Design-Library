"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useField } from "./field";
import inputStyles from "./input.module.css";
import styles from "./popup.module.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Form field name; a hidden input is rendered for native form submission. */
  name?: string;
  size?: "sm" | "md" | "lg";
  id?: string;
  "aria-label"?: string;
  className?: string;
}

/**
 * Single-value select with a custom listbox. Works inside a `Field` (label, description, error).
 * For long, searchable lists use a combobox instead.
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options, value, defaultValue, onValueChange, placeholder = "Select…", disabled, required, invalid, name, size = "md", id, className, ...aria },
  ref,
) {
  const field = useField();
  const items = React.useMemo(() => Object.fromEntries(options.map((o) => [o.value, o.label])), [options]);
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <BaseSelect.Root
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.((next as string | null) ?? null)}
      disabled={disabled ?? field?.disabled}
      required={required ?? field?.required}
      name={name}
    >
      <BaseSelect.Trigger
        ref={ref}
        id={id ?? field?.controlId}
        aria-describedby={field?.describedBy}
        aria-invalid={isInvalid || undefined}
        aria-label={aria["aria-label"]}
        className={cn(inputStyles.control, size !== "md" && inputStyles[size], styles.trigger, className)}
      >
        <BaseSelect.Value className={styles.value} placeholder={placeholder} />
        <BaseSelect.Icon className={styles.chevron}>
          <ChevronDown strokeWidth={1.6} aria-hidden="true" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className={styles.positioner} sideOffset={4} alignItemWithTrigger={false}>
          <BaseSelect.Popup className={styles.popup}>
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item key={option.value} value={option.value} disabled={option.disabled} className={styles.item}>
                  <BaseSelect.ItemText className={styles.itemText}>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className={styles.itemIndicator}>
                    <Check strokeWidth={2} aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
});

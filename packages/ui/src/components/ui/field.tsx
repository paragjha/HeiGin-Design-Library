"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./field.module.css";

interface FieldContextValue {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Read the surrounding Field's ids and state. Returns `null` outside a Field. */
export function useField(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

/** Merge Field-provided accessibility props with props set directly on a control. */
export function useFieldControlProps<P extends { id?: string; "aria-describedby"?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"]; required?: boolean; disabled?: boolean }>(props: P): P {
  const field = useField();
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.controlId,
    "aria-describedby": cn(field.describedBy, props["aria-describedby"]) || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
  };
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  /** Helper text shown under the control. */
  description?: React.ReactNode;
  /** Validation message. When set, the control is marked `aria-invalid` and the message is announced. */
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Visually hide the label (it stays available to assistive technology). */
  hideLabel?: boolean;
  /** Override the generated control id. */
  id?: string;
  children: React.ReactNode;
}

/**
 * Labels a single form control and wires up `id`, `aria-describedby`, `aria-invalid`,
 * `required` and `disabled` for HeiGin inputs placed inside it.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, required = false, disabled = false, hideLabel = false, id, className, children, ...props },
  ref,
) {
  const autoId = React.useId();
  const controlId = id ?? `hg-field-${autoId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const value: FieldContextValue = {
    controlId,
    describedBy: cn(descriptionId, errorId) || undefined,
    invalid: Boolean(error),
    required,
    disabled,
  };

  return (
    <div ref={ref} className={cn(styles.field, className)} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined} {...props}>
      <label htmlFor={controlId} className={cn(styles.label, hideLabel && styles.srOnly)}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

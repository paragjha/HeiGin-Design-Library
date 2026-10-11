"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./field";
import styles from "./input.module.css";

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

/**
 * Native <select> with the input chrome — what production uses for filters ("All statuses")
 * and form fields (Owner). Best on mobile and for long, simple lists. Use Select for rich options.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { size = "md", invalid, className, children, ...props },
  ref,
) {
  const fieldProps = useFieldControlProps({ ...props, "aria-invalid": invalid || props["aria-invalid"] || undefined });
  return (
    <select ref={ref} className={cn(styles.control, styles.native, size !== "md" && styles[size], className)} {...fieldProps}>
      {children}
    </select>
  );
});

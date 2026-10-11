"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./field";
import styles from "./input.module.css";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  /** Marks the control invalid without a Field. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
}

/** Single-line text input. Inherits id, description and error wiring from a surrounding `Field`. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", invalid, className, type = "text", ...props },
  ref,
) {
  const fieldProps = useFieldControlProps({ ...props, "aria-invalid": invalid || props["aria-invalid"] || undefined });
  return (
    <input
      ref={ref}
      type={type}
      className={cn(styles.control, size !== "md" && styles[size], className)}
      {...fieldProps}
    />
  );
});

export { styles as inputStyles };

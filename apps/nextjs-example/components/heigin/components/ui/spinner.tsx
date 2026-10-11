import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./spinner.module.css";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** Accessible label. Pass `null` when the spinner is decorative (e.g. inside a labelled button). */
  label?: string | null;
}

/** Indeterminate loading indicator. Uses `currentColor`, so it inherits the text colour. */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      data-size={size}
      className={cn(styles.spinner, size !== "md" && styles[size], className)}
      {...props}
    />
  );
});

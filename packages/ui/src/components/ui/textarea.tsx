"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./field";
import styles from "./input.module.css";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Multi-line text input. Resizes vertically. Inherits wiring from a surrounding `Field`. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref,
) {
  const fieldProps = useFieldControlProps({ ...props, "aria-invalid": invalid || props["aria-invalid"] || undefined });
  return <textarea ref={ref} rows={rows} className={cn(styles.control, styles.textarea, className)} {...fieldProps} />;
});

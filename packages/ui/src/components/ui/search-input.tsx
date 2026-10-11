"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./field";
import styles from "./input.module.css";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Called when the user presses Enter. */
  onSearch?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  /** Accessible name for the clear button. */
  clearLabel?: string;
}

/**
 * Controlled search field with a leading icon and a clear button.
 * Escape clears the value. Needs an accessible name: wrap it in a `Field` or pass `aria-label`.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, onSearch, size = "md", clearLabel = "Clear search", className, onKeyDown, ...props },
  ref,
) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  const fieldProps = useFieldControlProps(props);
  const hasValue = value.length > 0;

  return (
    <div className={cn(styles.wrapper, className)}>
      <span className={styles.leading} aria-hidden="true">
        <Search strokeWidth={1.6} />
      </span>
      <input
        ref={innerRef}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter") onSearch?.(value);
          if (event.key === "Escape" && hasValue) {
            event.preventDefault();
            onValueChange("");
          }
        }}
        className={cn(styles.control, size !== "md" && styles[size], hasValue && styles.hasTrailing)}
        {...fieldProps}
      />
      {hasValue && !props.disabled && !props.readOnly && (
        <span className={styles.trailing}>
          <button
            type="button"
            className={styles.clear}
            aria-label={clearLabel}
            onClick={() => {
              onValueChange("");
              innerRef.current?.focus();
            }}
          >
            <X strokeWidth={1.6} aria-hidden="true" />
          </button>
        </span>
      )}
    </div>
  );
});

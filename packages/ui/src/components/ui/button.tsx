"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./spinner";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` is the HeiGin near-black accent. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy` and ignores clicks. Focus is kept so screen readers announce the change. */
  loading?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  /** Grow to the 44px touch height below 768px, matching production. Default `true`. */
  touch?: boolean;
}

/** The primary action control. Renders a native `<button type="button">` by default. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    touch = true,
    disabled,
    type = "button",
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cn(
        styles.button,
        styles[variant],
        size !== "md" && styles[size],
        touch && variant !== "link" && styles.touch,
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading ? <Spinner size="sm" label={null} /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});


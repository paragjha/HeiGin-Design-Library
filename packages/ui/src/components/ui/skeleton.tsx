import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./skeleton.module.css";

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  width?: number | string;
  height?: number | string;
  /** `circle` for avatars, `text` for a line of copy. */
  shape?: "rect" | "text" | "circle";
}

/**
 * Loading placeholder (production: surface-hover fill, pulse 1.4s). Decorative: announce loading
 * once on the container (e.g. `aria-busy` on the table) rather than on every skeleton.
 */
export function Skeleton({ width, height, shape = "rect", className, style, ...props }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, styles[shape], className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

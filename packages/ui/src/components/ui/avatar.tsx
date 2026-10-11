"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./avatar.module.css";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Full name; used for initials and as the accessible label. */
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Render as decorative (when the name is already shown next to it). */
  decorative?: boolean;
}

/** Up to two initials from a name: "Asha Rao" -> "AR", "northwind" -> "N". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Circular avatar: image when available, initials otherwise (also the fallback if the image fails). */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = "md", decorative = false, className, ...props },
  ref,
) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      ref={ref}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(styles.avatar, styles[size], className)}
      {...props}
    >
      {showImage ? (
        <img src={src} alt="" className={styles.image} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
});

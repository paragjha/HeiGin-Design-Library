"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./avatar.module.css";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Full name; used for initials and as the accessible label. */
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** `circle` for people (default), `square` for company logos / tenant marks. */
  shape?: "circle" | "square";
  /**
   * When no `src` is set, tint the initials disc with a colour derived from
   * `name` so the same person/company always lands on the same tint. Off by
   * default so existing usage keeps the single accent colour.
   */
  tinted?: boolean;
  /** Render as decorative (when the name is already shown next to it). */
  decorative?: boolean;
}

/** Up to two initials from a name: "Asha Rao" -> "AR", "northwind" -> "N". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._/-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/**
 * Soft, token-friendly tint palette. One entry per hash bucket so the same
 * `name` always picks the same tint. Light background with a readable ink.
 */
const TINTS = [
  { bg: "#e0f2fe", fg: "#075985" }, // sky
  { bg: "#ede9fe", fg: "#5b21b6" }, // violet
  { bg: "#dcfce7", fg: "#166534" }, // green
  { bg: "#fef3c7", fg: "#92400e" }, // amber
  { bg: "#ffe4e6", fg: "#9f1239" }, // rose
  { bg: "#dbeafe", fg: "#1e40af" }, // blue
  { bg: "#ccfbf1", fg: "#115e59" }, // teal
  { bg: "#fae8ff", fg: "#86198f" }, // fuchsia
  { bg: "#fde68a", fg: "#78350f" }, // yellow
  { bg: "#e5e7eb", fg: "#374151" }, // neutral
] as const;

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Avatar: image when available, initials otherwise (also the fallback if the image fails). */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = "md", shape = "circle", tinted = false, decorative = false, className, style, ...props },
  ref,
) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  const showImage = Boolean(src) && !failed;
  const tint = tinted && !showImage ? TINTS[hashName(name) % TINTS.length]! : null;

  return (
    <span
      ref={ref}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(styles.avatar, styles[size], shape === "square" && styles.square, className)}
      style={tint ? { background: tint.bg, color: tint.fg, ...style } : style}
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

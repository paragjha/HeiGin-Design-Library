"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./spinner";
import { ThinkingOrb, type ThinkingOrbState } from "./thinking-orb";

/** `orb` is HeiGin's dotted thinking orb; `spinner` is the plain ring. */
export type LoaderVariant = "orb" | "spinner";

export interface LoaderProps {
  /** Which indicator to draw. Default `orb`. */
  variant?: LoaderVariant;
  /** `sm` and `md` draw a 20px orb (14px / 16px spinner); `lg` draws a 32px orb (20px spinner). */
  size?: "sm" | "md" | "lg";
  /** What the orb animates while it waits. Ignored by the spinner. */
  orbState?: ThinkingOrbState;
  /** Accessible label. Pass `null` when nearby text already says what is loading. */
  label?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

const ORB_SIZE = { sm: 20, md: 20, lg: 32 } as const;

/**
 * One loading indicator with a choice of style: the thinking orb or a spinner. Agent components
 * take a `loader` prop and pass it here, so a product can pick one style everywhere.
 */
export function Loader({ variant = "orb", size = "md", orbState = "working", label = "Loading", className, style }: LoaderProps) {
  if (variant === "spinner") {
    return <Spinner size={size} label={label} className={className} style={style} />;
  }
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      data-variant="orb"
      className={cn(className)}
      style={{ display: "inline-flex", flexShrink: 0, lineHeight: 0, ...style }}
    >
      <ThinkingOrb state={orbState} size={ORB_SIZE[size]} label={null} />
    </span>
  );
}

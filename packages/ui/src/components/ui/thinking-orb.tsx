"use client";

import * as React from "react";
import { ThinkingOrb as Orb } from "thinking-orbs";

export type ThinkingOrbState =
  | "working"
  | "searching"
  | "solving"
  | "listening"
  | "connecting"
  | "weaving"
  | "composing"
  | "breathing"
  | "shaping";

export type ThinkingOrbSize = 20 | 32 | 64;

export interface ThinkingOrbProps {
  /** What the agent is doing. Each state is its own animation. */
  state?: ThinkingOrbState;
  /** 64 for avatar scale, 20 for inline with text, 32 in between. These are separate tunings, not one design scaled. */
  size?: ThinkingOrbSize;
  /** `auto` follows an ancestor `data-theme` or `dark`/`light` class, then the OS setting. Pin it on a surface whose colour is fixed. */
  theme?: "auto" | "light" | "dark";
  /** Multiplier on the state's own speed. */
  speed?: number;
  /** Freeze on the current frame. */
  paused?: boolean;
  /** Ink colour as `#rgb`, `#rrggbb` or `rgb()`. Leave unset for the neutral ink. */
  color?: string;
  /** Accessible label. Defaults to the state ("Searching…"). Pass `null` when nearby text already says it. */
  label?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dotted orb that shows what an agent is doing: working, searching, solving, listening,
 * connecting, weaving, composing, breathing or shaping. Draws on a 2D canvas, pauses
 * offscreen and shows a still frame under reduced motion.
 */
export function ThinkingOrb({
  state = "working",
  size = 64,
  theme = "auto",
  speed = 1,
  paused = false,
  color,
  label,
  className,
  style,
}: ThinkingOrbProps) {
  return (
    <Orb
      state={state}
      size={size}
      theme={theme}
      speed={speed}
      paused={paused}
      color={color}
      aria-label={label ?? undefined}
      aria-hidden={label === null ? true : undefined}
      className={className}
      style={style}
    />
  );
}

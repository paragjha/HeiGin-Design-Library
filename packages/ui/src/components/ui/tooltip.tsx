"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../../lib/cn";
import styles from "./popup.module.css";

export interface TooltipProps {
  /** Tooltip text. Keep it short; never put essential or interactive content in a tooltip. */
  content: React.ReactNode;
  /** The trigger. Must be a single focusable element that accepts a ref (e.g. Button, IconButton). */
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  /** Delay before showing, in ms. */
  delay?: number;
  className?: string;
}

/**
 * Supplementary label shown on hover and keyboard focus. Escape dismisses it.
 * Wrap the app (or a region) in `TooltipProvider` to share delays between adjacent tooltips.
 */
export function Tooltip({ content, children, side = "top", delay = 400, className }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner className={styles.tooltipPositioner} side={side} sideOffset={6}>
          <BaseTooltip.Popup className={cn(styles.tooltip, className)}>{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/** Optional provider that lets adjacent tooltips open instantly after the first one. */
export const TooltipProvider = BaseTooltip.Provider;

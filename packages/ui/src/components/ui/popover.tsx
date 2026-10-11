"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../../lib/cn";
import styles from "./popup.module.css";

/** Root of a popover. Accepts `open`, `defaultOpen` and `onOpenChange`. */
export const Popover = BasePopover.Root;

/** Opens the popover. Use `render={<Button />}` to render a HeiGin Button. */
export const PopoverTrigger = BasePopover.Trigger;

/** Closes the popover. Use `render={<Button />}` to render a HeiGin Button. */
export const PopoverClose = BasePopover.Close;

export interface PopoverContentProps extends Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>, "className" | "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

/** Non-modal floating panel for small amounts of interactive content. Focus moves into it on open and returns on close. */
export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { title, description, side = "bottom", align = "start", className, children, ...props },
  ref,
) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner className={styles.positioner} side={side} align={align} sideOffset={6}>
        <BasePopover.Popup ref={ref} className={cn(styles.popup, styles.popover, className)} {...props}>
          {title && <BasePopover.Title className={styles.popoverTitle}>{title}</BasePopover.Title>}
          {description && <BasePopover.Description className={styles.popoverDescription}>{description}</BasePopover.Description>}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
});

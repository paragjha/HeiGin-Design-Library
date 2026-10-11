"use client";

import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "../../lib/cn";
import styles from "./popup.module.css";

/** Root of a dropdown menu. Controls `open` / `onOpenChange` when you need it controlled. */
export const DropdownMenu = Menu.Root;

export interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<typeof Menu.Trigger> {}

/**
 * The element that opens the menu. Pass `render={<Button variant="secondary" />}` to use a HeiGin
 * Button (or IconButton) as the trigger; otherwise renders a bare `<button>`.
 */
export const DropdownMenuTrigger = Menu.Trigger;

export interface DropdownMenuContentProps extends Omit<React.ComponentPropsWithoutRef<typeof Menu.Popup>, "className"> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

/** The floating menu surface. Rendered in a portal, positioned against the trigger. */
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { side = "bottom", align = "start", sideOffset = 4, className, children, ...props },
  ref,
) {
  return (
    <Menu.Portal>
      <Menu.Positioner className={styles.positioner} side={side} align={align} sideOffset={sideOffset}>
        <Menu.Popup ref={ref} className={cn(styles.popup, className)} {...props}>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
});

export interface DropdownMenuItemProps extends Omit<React.ComponentPropsWithoutRef<typeof Menu.Item>, "className"> {
  icon?: React.ReactNode;
  /** Keyboard shortcut hint shown on the right (display only). */
  shortcut?: string;
  tone?: "default" | "danger";
  className?: string;
}

/** A menu action. Use `onClick` to handle selection; the menu closes afterwards. */
export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { icon, shortcut, tone = "default", className, children, ...props },
  ref,
) {
  return (
    <Menu.Item ref={ref} className={cn(styles.item, tone === "danger" && styles.itemDanger, className)} {...props}>
      {icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{icon}</span>}
      <span className={styles.itemText}>{children}</span>
      {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
    </Menu.Item>
  );
});

/** A thin divider between groups of items. */
export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <Menu.Separator className={cn(styles.separator, className)} />;
}

export interface DropdownMenuGroupProps {
  /** Optional visible heading for the group. */
  label?: React.ReactNode;
  children: React.ReactNode;
}

/** Groups related items, optionally under a small heading. */
export function DropdownMenuGroup({ label, children }: DropdownMenuGroupProps) {
  return (
    <Menu.Group>
      {label && <Menu.GroupLabel className={styles.groupLabel}>{label}</Menu.GroupLabel>}
      {children}
    </Menu.Group>
  );
}

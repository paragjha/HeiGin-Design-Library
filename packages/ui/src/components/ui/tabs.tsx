"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "../../lib/cn";
import styles from "./tabs.module.css";

export interface TabsProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Root>, "className" | "onValueChange"> {
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Root of a tab set. Accepts `value` / `defaultValue` / `onValueChange`. */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs({ className, onValueChange, ...props }, ref) {
  return (
    <BaseTabs.Root
      ref={ref}
      className={cn(styles.root, className)}
      onValueChange={(value) => onValueChange?.(String(value))}
      {...props}
    />
  );
});

export interface TabsListProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.List>, "className"> {
  /** `underline` sits on a divider (page sections). `pill` is a segmented control (filters, views). */
  variant?: "underline" | "pill";
  className?: string;
}

/** The row of tabs. Arrow keys move between tabs; Home/End jump to the ends. */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { variant = "underline", className, children, ...props },
  ref,
) {
  return (
    <BaseTabs.List ref={ref} data-variant={variant} className={cn(styles.list, styles[variant], className)} {...props}>
      {children}
      {variant === "underline" && <BaseTabs.Indicator className={styles.indicator} />}
    </BaseTabs.List>
  );
});

export interface TabProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>, "className"> {
  /** Optional count shown after the label (e.g. unread items). */
  count?: number;
  className?: string;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab({ count, className, children, ...props }, ref) {
  return (
    <BaseTabs.Tab ref={ref} className={cn(styles.tab, className)} {...props}>
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </BaseTabs.Tab>
  );
});

export interface TabsPanelProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>, "className"> {
  className?: string;
}

export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel({ className, ...props }, ref) {
  return <BaseTabs.Panel ref={ref} className={cn(styles.panel, className)} {...props} />;
});

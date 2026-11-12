"use client";

import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@heigin/ui";
import { cn } from "./cn";

/**
 * Re-exports and shims for Gallery block files that were authored against a
 * Radix-style dropdown surface. The Radix bits that `@heigin/ui` doesn't
 * expose (Label, RadioGroup, RadioItem, CheckboxItem) are built here on top
 * of Base UI's primitives, with class names that match the rest of the
 * surface so the menus read as one.
 */
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};

export function DropdownMenuLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Menu.GroupLabel className={cn("px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400", className)}>
      {children}
    </Menu.GroupLabel>
  );
}

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Menu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </Menu.RadioGroup>
  );
}

export function DropdownMenuRadioItem({
  value,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem
      value={value}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800",
        className,
      )}
      {...props}
    >
      {children}
    </Menu.RadioItem>
  );
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  className,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Menu.CheckboxItem>, "checked" | "onCheckedChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <Menu.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800",
        className,
      )}
      {...props}
    >
      {children}
    </Menu.CheckboxItem>
  );
}

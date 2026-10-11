"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../../lib/cn";
import { DialogHeader } from "./dialog";
import styles from "./dialog.module.css";

/** Root of a drawer (a dialog that slides in from an edge). Accepts `open` / `onOpenChange`. */
export const Drawer = BaseDialog.Root;
export const DrawerTrigger = BaseDialog.Trigger;
export const DrawerClose = BaseDialog.Close;

export interface DrawerContentProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>, "className" | "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  /** `right` for record details and forms, `left` for mobile navigation, `bottom` for mobile sheets. */
  side?: "right" | "left" | "bottom";
  /** Override the panel width (right/left), e.g. "480px". */
  width?: string;
  hideClose?: boolean;
  closeLabel?: string;
  className?: string;
}

/** Edge-anchored modal panel with the same focus management as Dialog. */
export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { title, description, footer, side = "right", width, hideClose = false, closeLabel = "Close", className, children, style, ...props },
  ref,
) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        ref={ref}
        data-side={side}
        className={cn(styles.drawer, styles[side], className)}
        style={{ ...(width ? ({ "--drawer-width": width } as React.CSSProperties) : null), ...style }}
        {...props}
      >
        <DialogHeader title={title} description={description} hideClose={hideClose} closeLabel={closeLabel} />
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
});

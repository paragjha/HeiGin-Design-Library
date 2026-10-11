"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton } from "./icon-button";
import styles from "./dialog.module.css";

/** Root of a modal dialog. Accepts `open`, `defaultOpen` and `onOpenChange`. */
export const Dialog = BaseDialog.Root;

/** Opens the dialog. Use `render={<Button />}` to render a HeiGin Button. */
export const DialogTrigger = BaseDialog.Trigger;

/** Closes the dialog. Use `render={<Button variant="secondary" />}` for a footer button. */
export const DialogClose = BaseDialog.Close;

export interface DialogContentProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>, "className" | "title"> {
  /** Required: becomes the dialog's accessible name. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action buttons, rendered right-aligned at the bottom. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Hide the top-right close button (Escape and the backdrop still close the dialog). */
  hideClose?: boolean;
  closeLabel?: string;
  className?: string;
}

/**
 * The modal surface. Traps focus, closes on Escape and outside click, restores focus to the
 * trigger on close, and locks page scroll while open.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { title, description, footer, size = "md", hideClose = false, closeLabel = "Close", className, children, ...props },
  ref,
) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup ref={ref} className={cn(styles.dialog, styles[size], className)} {...props}>
        <DialogHeader title={title} description={description} hideClose={hideClose} closeLabel={closeLabel} />
        {children !== undefined && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
});

/** @internal Shared by DialogContent and DrawerContent. */
export function DialogHeader({
  title,
  description,
  hideClose,
  closeLabel,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  hideClose: boolean;
  closeLabel: string;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headings}>
        <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
        {description && <BaseDialog.Description className={styles.description}>{description}</BaseDialog.Description>}
      </div>
      {!hideClose && (
        <BaseDialog.Close
          render={<IconButton label={closeLabel} icon={<X strokeWidth={1.6} />} size="sm" touch={false} className={styles.close} />}
        />
      )}
    </div>
  );
}

export { styles as dialogStyles };

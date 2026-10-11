"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./button";
import styles from "./dialog.module.css";

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element (e.g. `<Button variant="danger">Delete</Button>`). */
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` styles the confirm button as destructive and shows a warning icon. */
  tone?: "default" | "danger";
  /** Called when the user confirms. Return a promise to show a loading state until it settles. */
  onConfirm: () => void | Promise<void>;
  className?: string;
}

/**
 * Confirmation for consequential actions. Unlike Dialog it does not close on outside click,
 * and initial focus lands on Cancel so Enter never confirms by accident.
 */
export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  className,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const [pending, setPending] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const setOpen = (next: boolean) => {
    if (pending) return;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const confirm = async () => {
    try {
      setPending(true);
      await onConfirm();
      setPending(false);
      if (open === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    } catch {
      setPending(false);
    }
  };

  return (
    <BaseAlertDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className={styles.backdrop} />
        <BaseAlertDialog.Popup className={cn(styles.dialog, styles.sm, className)} initialFocus={cancelRef}>
          <div className={styles.header}>
            {tone === "danger" && (
              <span className={styles.alertIcon} aria-hidden="true">
                <TriangleAlert strokeWidth={1.6} />
              </span>
            )}
            <div className={styles.headings}>
              <BaseAlertDialog.Title className={styles.title}>{title}</BaseAlertDialog.Title>
              <BaseAlertDialog.Description className={styles.description}>{description}</BaseAlertDialog.Description>
            </div>
          </div>
          <div className={styles.footer} style={{ paddingTop: "var(--hg-space-5)" }}>
            <BaseAlertDialog.Close render={<Button ref={cancelRef} variant="secondary" disabled={pending} />}>{cancelLabel}</BaseAlertDialog.Close>
            <Button variant={tone === "danger" ? "danger" : "primary"} loading={pending} onClick={confirm}>
              {confirmLabel}
            </Button>
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}

"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../../lib/cn";
import styles from "./toast.module.css";

export type ToastTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneIcon: Record<ToastTone, React.ComponentType<{ strokeWidth?: number; "aria-hidden"?: boolean }> | null> = {
  neutral: null,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
};

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. Default 5000. Use 0 to keep it until dismissed. */
  timeout?: number;
  /** Optional single action, e.g. Undo. */
  action?: { label: string; onClick: () => void };
}

/**
 * Returns `toast(options)` and `dismiss(id?)`. Must be used inside `ToastProvider`.
 * Danger toasts are announced assertively; others politely.
 */
export function useToast() {
  const manager = BaseToast.useToastManager();
  const toast = React.useCallback(
    ({ title, description, tone = "neutral", timeout = 5000, action }: ToastOptions) =>
      manager.add({
        title,
        description,
        type: tone,
        timeout,
        priority: tone === "danger" ? "high" : "low",
        actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
      }),
    [manager],
  );
  return { toast, dismiss: manager.close };
}

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((t) => {
    const tone = (t.type as ToastTone | undefined) ?? "neutral";
    const Icon = toneIcon[tone] ?? null;
    return (
      <BaseToast.Root key={t.id} toast={t} className={cn(styles.toast)} data-tone={tone}>
        {Icon && (
          <span className={styles.icon} aria-hidden="true">
            <Icon strokeWidth={1.6} />
          </span>
        )}
        <div className={styles.content}>
          <BaseToast.Title className={styles.title} />
          <BaseToast.Description className={styles.description} />
        </div>
        {t.actionProps && <BaseToast.Action className={styles.action} />}
        <BaseToast.Close className={styles.close} aria-label={closeLabel}>
          <X strokeWidth={1.6} aria-hidden="true" />
        </BaseToast.Close>
      </BaseToast.Root>
    );
  });
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum visible toasts. Default 3. */
  limit?: number;
  closeLabel?: string;
}

/** Mount once near the app root. Renders the toast viewport (bottom-right; bottom-centre on mobile). */
export function ToastProvider({ children, limit = 3, closeLabel = "Dismiss notification" }: ToastProviderProps) {
  return (
    <BaseToast.Provider limit={limit}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className={styles.viewport}>
          <ToastList closeLabel={closeLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

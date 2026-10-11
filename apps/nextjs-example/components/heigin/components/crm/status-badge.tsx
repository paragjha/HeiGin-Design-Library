import * as React from "react";
import { CircleCheck, CircleDashed, CircleX, Clock, Info, TriangleAlert } from "lucide-react";
import { Badge, type BadgeTone } from "../ui/badge";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusEntry {
  label: string;
  tone: StatusTone;
  icon?: React.ComponentType<{ strokeWidth?: number }>;
}

/**
 * Shared registry of named CRM statuses. Pages pass a key, never an ad-hoc colour.
 * Extend it here (or pass `tone` + `label`) rather than styling statuses locally.
 */
export const STATUS_REGISTRY = {
  // Lead lifecycle
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "neutral" },
  qualified: { label: "Qualified", tone: "success" },
  not_interested: { label: "Not interested", tone: "neutral" },
  // SLA
  on_track: { label: "On track", tone: "success" },
  due_soon: { label: "Due soon", tone: "warning", icon: Clock },
  breached: { label: "Breached", tone: "danger" },
  // Quote / deal / approval
  draft: { label: "Draft", tone: "neutral" },
  awaiting_approval: { label: "Awaiting approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  sent: { label: "Sent", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "neutral" },
  // Money
  paid: { label: "Paid", tone: "success" },
  partially_paid: { label: "Partially paid", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
} satisfies Record<string, StatusEntry>;

export type StatusKey = keyof typeof STATUS_REGISTRY;

const toneIcon: Record<StatusTone, React.ComponentType<{ strokeWidth?: number }>> = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
  neutral: CircleDashed,
};

export interface StatusBadgeProps {
  /** Registry key. */
  status?: StatusKey;
  /** Override or ad-hoc tone (prefer adding to the registry). */
  tone?: StatusTone;
  label?: string;
  /** Hide the icon in dense tables where the column header already gives context. */
  hideIcon?: boolean;
  className?: string;
}

/** Status = tint + ink + icon + word, never colour alone. Server-component safe. */
export function StatusBadge({ status, tone, label, hideIcon = false, className }: StatusBadgeProps) {
  const entry: StatusEntry | undefined = status ? STATUS_REGISTRY[status] : undefined;
  const resolvedTone = tone ?? entry?.tone ?? "neutral";
  const Icon = entry?.icon ?? toneIcon[resolvedTone];
  return (
    <Badge tone={resolvedTone as BadgeTone} icon={hideIcon ? undefined : <Icon strokeWidth={2} />} className={className} data-status={status}>
      {label ?? entry?.label ?? status}
    </Badge>
  );
}

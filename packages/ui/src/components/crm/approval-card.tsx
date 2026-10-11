"use client";

import * as React from "react";
import { Check, TriangleAlert, Undo2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { TrustRungBadge, type TrustRung } from "./trust-rung-badge";
import styles from "./crm.module.css";
import { VisuallyHidden } from "../ui/visually-hidden";

export interface ApprovalChange {
  field: string;
  from?: string;
  to: string;
}

export interface ApprovalCardProps {
  /** What needs approving, e.g. "Send reminder to Kaveri Textiles". */
  title: string;
  /** Why it was proposed, in one sentence. */
  reason: string;
  /** Who or what proposed it, e.g. "Agent · Receivable reminders" or "Meera S". */
  requestedBy: string;
  /** When the proposer is the AI agent, its trust rung. */
  rung?: TrustRung;
  changes?: ApprovalChange[];
  /** When false, approving cannot be undone (e.g. a sent WhatsApp message) — the card warns up front. */
  undoable?: boolean;
  approveLabel?: string;
  /** The draft itself (message, quote preview). */
  children?: React.ReactNode;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  /** Shown after a decision when undoable. */
  onUndo?: () => void;
  className?: string;
}

/**
 * An approval request: what, why, the change, and Approve / Reject. Records the outcome in place
 * and offers Undo when the action is reversible.
 */
export function ApprovalCard({
  title,
  reason,
  requestedBy,
  rung,
  changes,
  undoable = true,
  approveLabel = "Approve",
  children,
  onApprove,
  onReject,
  onUndo,
  className,
}: ApprovalCardProps) {
  const [outcome, setOutcome] = React.useState<"approved" | "rejected" | null>(null);
  const [pending, setPending] = React.useState<"approve" | "reject" | null>(null);
  const headingId = React.useId();

  const decide = async (kind: "approve" | "reject") => {
    setPending(kind);
    try {
      await (kind === "approve" ? onApprove() : onReject());
      setOutcome(kind === "approve" ? "approved" : "rejected");
    } finally {
      setPending(null);
    }
  };

  return (
    <Card as="article" aria-labelledby={headingId} className={className} data-outcome={outcome ?? "pending"}>
      <div className={styles.approval}>
        <div className={styles.approvalHead}>
          <div>
            <h3 id={headingId} className={styles.approvalTitle}>
              {title}
            </h3>
            <p className={styles.approvalReason}>{reason}</p>
          </div>
          {rung !== undefined && <TrustRungBadge rung={rung} />}
        </div>
        <div className={styles.rowMeta} style={{ marginTop: -6 }}>
          Requested by {requestedBy}
        </div>

        {changes && changes.length > 0 && (
          <dl className={styles.diff} aria-label="Proposed changes">
            {changes.map((c) => (
              <React.Fragment key={c.field}>
                <dt>{c.field}</dt>
                <dd>
                  {c.from && (
                    <del>
                      <VisuallyHidden>from </VisuallyHidden>
                      {c.from}
                    </del>
                  )}
                  <ins>
                    {c.from && <VisuallyHidden>to </VisuallyHidden>}
                    {c.to}
                  </ins>
                </dd>
              </React.Fragment>
            ))}
          </dl>
        )}

        {children}

        {outcome ? (
          <div className={styles.approvalOutcome} role="status">
            <span>{outcome === "approved" ? "Approved." : "Rejected."}</span>
            {undoable && onUndo && (
              <Button
                variant="ghost"
                size="sm"
                touch={false}
                leadingIcon={<Undo2 strokeWidth={1.6} />}
                onClick={() => {
                  onUndo();
                  setOutcome(null);
                }}
              >
                Undo
              </Button>
            )}
          </div>
        ) : (
          <>
            {!undoable && (
              <p className={styles.irreversible}>
                <TriangleAlert strokeWidth={1.6} aria-hidden="true" />
                This can't be undone once approved.
              </p>
            )}
            <div className={styles.approvalActions}>
              <Button leadingIcon={<Check strokeWidth={1.6} />} loading={pending === "approve"} disabled={pending === "reject"} onClick={() => decide("approve")}>
                {approveLabel}
              </Button>
              <Button
                variant="secondary"
                leadingIcon={<X strokeWidth={1.6} />}
                loading={pending === "reject"}
                disabled={pending === "approve"}
                onClick={() => decide("reject")}
              >
                Reject
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

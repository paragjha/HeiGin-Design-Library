import { useState } from "react";
import { ApprovalCard } from "@heigin/ui";

export default function ApprovalCards() {
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((l) => [entry, ...l].slice(0, 3));

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <ApprovalCard
        title="Apply 12% discount to Q-1042"
        reason="Kaveri Textiles is a repeat buyer above ₹10L annual spend."
        requestedBy="Meera S"
        changes={[
          { field: "Discount", from: "5%", to: "12%" },
          { field: "Total", from: "₹8,94,316", to: "₹8,49,600" },
        ]}
        onApprove={() => new Promise<void>((r) => window.setTimeout(() => (record("Approved discount"), r()), 600))}
        onReject={() => record("Rejected discount")}
        onUndo={() => record("Undid decision")}
      />
      <ApprovalCard
        title="Send payment reminder on WhatsApp"
        reason="Invoice INV-2219 is 30 days overdue."
        requestedBy="Agent · Receivable reminders"
        rung={1}
        undoable={false}
        approveLabel="Approve and send"
        onApprove={() => record("Approved reminder (demo — nothing sent)")}
        onReject={() => record("Rejected reminder")}
      >
        <blockquote style={{ margin: 0, padding: "8px 12px", borderLeft: "2px solid var(--hg-color-border-strong)", fontSize: 13 }}>
          Hi Asha, a gentle reminder that INV-2219 for ₹1,84,500 was due on 11 Sep. You can pay via the UPI link below.
        </blockquote>
      </ApprovalCard>
      <p role="status" style={{ fontSize: 12, color: "var(--hg-color-muted)", margin: 0 }}>
        {log.length ? log.join(" · ") : "No decisions yet"}
      </p>
    </div>
  );
}

"use client";

import { ApprovalCard, EmptyState, useToast } from "@heigin/ui";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import type { Approval } from "@/lib/mock-data";

/** Client island: approval decisions are local state only — nothing is sent anywhere. */
export function ApprovalQueue({ approvals }: { approvals: Approval[] }) {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = approvals.filter((a) => !dismissed.includes(a.id));

  if (visible.length === 0) {
    return <EmptyState icon={<CheckCheck strokeWidth={1.6} />} title="You're all caught up" description="New approvals will appear here." />;
  }

  return (
    <>
      {visible.map((a) => (
        <ApprovalCard
          key={a.id}
          title={a.title}
          reason={a.reason}
          requestedBy={a.requestedBy}
          rung={a.rung}
          undoable={a.undoable}
          changes={a.changes}
          approveLabel={a.undoable ? "Approve" : "Approve and send"}
          onApprove={async () => {
            await new Promise((r) => setTimeout(r, 500));
            toast({ title: "Approved", description: `${a.title} (demo — nothing was sent)`, tone: "success" });
          }}
          onReject={() => {
            toast({ title: "Rejected", description: a.title, action: { label: "Undo", onClick: () => setDismissed((d) => d.filter((x) => x !== a.id)) } });
            setDismissed((d) => [...d, a.id]);
          }}
          onUndo={() => toast({ title: "Decision undone" })}
        />
      ))}
    </>
  );
}

import { useState } from "react";
import { AlertDialog, Button } from "@heigin/ui";

export default function AlertDialogBasic() {
  const [status, setStatus] = useState("Quote Q-1042 is active");
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <AlertDialog
        trigger={<Button variant="danger">Cancel quote</Button>}
        tone="danger"
        title="Cancel quote Q-1042?"
        description="The customer's link stops working immediately. This cannot be undone."
        confirmLabel="Cancel quote"
        cancelLabel="Keep quote"
        onConfirm={() => new Promise<void>((resolve) => window.setTimeout(() => {
          setStatus("Quote Q-1042 cancelled (demo — nothing was sent)");
          resolve();
        }, 800))}
      />
      <span role="status" style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>
        {status}
      </span>
    </div>
  );
}

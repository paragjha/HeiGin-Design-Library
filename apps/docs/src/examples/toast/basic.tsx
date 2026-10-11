import { Button, ToastProvider, useToast } from "@heigin/ui";

function Triggers() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="secondary" onClick={() => toast({ title: "Lead created", description: "Asha Rao was added to New.", tone: "success" })}>
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({ title: "Lead archived", tone: "neutral", action: { label: "Undo", onClick: () => toast({ title: "Restored" }) } })
        }
      >
        With undo
      </Button>
      <Button variant="secondary" onClick={() => toast({ title: "WhatsApp sync failed", description: "Reconnect in Settings.", tone: "danger", timeout: 0 })}>
        Error (persistent)
      </Button>
    </div>
  );
}

// In an app, render <ToastProvider> once near the root instead of per example.
export default function ToastBasic() {
  return (
    <ToastProvider>
      <Triggers />
    </ToastProvider>
  );
}

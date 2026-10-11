import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@heigin/ui";

export default function ButtonStates() {
  const [sending, setSending] = useState(false);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Button leadingIcon={<Plus strokeWidth={1.6} />}>New deal</Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
      <Button
        loading={sending}
        trailingIcon={<Send strokeWidth={1.6} />}
        onClick={() => {
          setSending(true);
          window.setTimeout(() => setSending(false), 1500);
        }}
      >
        {sending ? "Sending" : "Send quote"}
      </Button>
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

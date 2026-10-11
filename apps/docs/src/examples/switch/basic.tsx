import { useState } from "react";
import { Switch } from "@heigin/ui";

export default function SwitchBasic() {
  const [autoAssign, setAutoAssign] = useState(true);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Switch
        label="Auto-assign new leads"
        description={autoAssign ? "Round-robin across the sales team" : "Leads stay unassigned"}
        checked={autoAssign}
        onCheckedChange={setAutoAssign}
      />
      <Switch label="Daily summary on WhatsApp" defaultChecked />
      <Switch label="Agent can send quotes" disabled />
    </div>
  );
}

import { useState } from "react";
import { Checkbox } from "@heigin/ui";

const channels = ["WhatsApp", "Email", "SMS"];

export default function CheckboxBasic() {
  const [selected, setSelected] = useState<string[]>(["WhatsApp"]);
  const all = selected.length === channels.length;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Checkbox
        label="All channels"
        checked={all}
        indeterminate={selected.length > 0 && !all}
        onCheckedChange={(checked) => setSelected(checked ? channels : [])}
      />
      <div style={{ display: "grid", gap: 10, paddingLeft: 24 }}>
        {channels.map((c) => (
          <Checkbox
            key={c}
            label={c}
            checked={selected.includes(c)}
            onCheckedChange={(checked) => setSelected((s) => (checked ? [...s, c] : s.filter((x) => x !== c)))}
          />
        ))}
      </div>
      <Checkbox label="Archived leads" description="Disabled until you have archive access" disabled />
    </div>
  );
}

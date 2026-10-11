import { useState } from "react";
import { Field, Select } from "@heigin/ui";

const stages = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost", disabled: true },
];

export default function SelectBasic() {
  const [stage, setStage] = useState<string | null>("qualified");
  return (
    <div style={{ maxWidth: 260 }}>
      <Field label="Deal stage" description={`Selected: ${stage ?? "none"}`}>
        <Select options={stages} value={stage} onValueChange={setStage} />
      </Field>
    </div>
  );
}

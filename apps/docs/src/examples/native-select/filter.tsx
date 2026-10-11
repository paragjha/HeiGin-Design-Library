import { useState } from "react";
import { Field, NativeSelect } from "@heigin/ui";

export default function NativeSelectFilter() {
  const [status, setStatus] = useState("");
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      {/* Toolbar filter, as on the production Leads page */}
      <NativeSelect aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 160 }}>
        <option value="">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
      </NativeSelect>
      {/* Form field, as in the production New Task dialog */}
      <Field label="Owner">
        <NativeSelect defaultValue="">
          <option value="">Unassigned</option>
          <option value="meera">Meera S</option>
          <option value="arjun">Arjun K</option>
        </NativeSelect>
      </Field>
    </div>
  );
}

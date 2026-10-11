import { Field, Input } from "@heigin/ui";

export default function InputStates() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <Field label="Company">
        <Input placeholder="Northwind Industrial" />
      </Field>
      <Field label="GSTIN" description="15 characters, e.g. 27AAPFU0939F1ZV">
        <Input defaultValue="27AAPFU0939F1ZV" />
      </Field>
      <Field label="Email" error="Enter a valid email address">
        <Input type="email" defaultValue="asha@" />
      </Field>
      <Field label="Lead ID">
        <Input readOnly value="L-10482" />
      </Field>
      <Field label="Owner" disabled>
        <Input value="Assigned by rule" readOnly />
      </Field>
    </div>
  );
}

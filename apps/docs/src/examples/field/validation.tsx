import { useState, type FormEvent } from "react";
import { Button, Field, Input, Select, Textarea } from "@heigin/ui";

const MOBILE = /^[6-9]\d{9}$/;

export default function LeadFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name")).trim()) next.name = "Enter the lead's name";
    if (!MOBILE.test(String(data.get("mobile")))) next.mobile = "Enter a 10-digit Indian mobile number";
    setErrors(next);
    setSaved(Object.keys(next).length === 0);
  }

  return (
    <form noValidate onSubmit={onSubmit} style={{ display: "grid", gap: 16, maxWidth: 380 }}>
      <Field label="Name" required error={errors.name}>
        <Input name="name" autoComplete="name" placeholder="Asha Rao" />
      </Field>
      <Field label="Mobile" required description="Used for WhatsApp updates" error={errors.mobile}>
        <Input name="mobile" inputMode="numeric" placeholder="98765 43210" />
      </Field>
      <Field label="Source">
        <Select
          name="source"
          placeholder="Choose source"
          options={[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "website", label: "Website form" },
            { value: "referral", label: "Referral" },
          ]}
        />
      </Field>
      <Field label="Notes">
        <Textarea name="notes" rows={3} />
      </Field>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button type="submit">Save lead</Button>
        {saved && <span role="status">Saved</span>}
      </div>
    </form>
  );
}

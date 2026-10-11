import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button, Dialog, DialogClose, DialogContent, DialogTrigger, Field, Input, Select } from "@heigin/ui";

export default function DialogForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [created, setCreated] = useState<string>();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name")).trim();
    if (!name) return setError("Enter a name");
    setCreated(name);
    setError(undefined);
    setOpen(false);
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button leadingIcon={<Plus strokeWidth={1.6} />} />}>New lead</DialogTrigger>
        <DialogContent
          title="Create lead"
          description="Leads are assigned by your round-robin rule."
          footer={
            <>
              <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
              <Button type="submit" form="create-lead-form">
                Create lead
              </Button>
            </>
          }
        >
          <form id="create-lead-form" noValidate onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <Field label="Name" required error={error}>
              <Input name="name" autoFocus />
            </Field>
            <Field label="Source">
              <Select
                name="source"
                defaultValue="whatsapp"
                options={[
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "website", label: "Website" },
                ]}
              />
            </Field>
          </form>
        </DialogContent>
      </Dialog>
      {created && <span role="status">Created {created}</span>}
    </div>
  );
}

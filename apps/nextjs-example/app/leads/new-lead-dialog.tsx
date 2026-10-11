"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button, Dialog, DialogClose, DialogContent, DialogTrigger, Field, Input, Select, Textarea, useToast } from "@heigin/ui";

const MOBILE = /^[6-9]\d{9}$/;

/** Client island with form validation. Submitting only shows a toast — no data leaves the browser. */
export function NewLeadDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const mobile = String(data.get("mobile") ?? "").replace(/\s/g, "");
    const next: Record<string, string> = {};
    if (!name) next.name = "Enter the lead's name";
    if (!MOBILE.test(mobile)) next.mobile = "Enter a 10-digit Indian mobile number";
    if (!data.get("source")) next.source = "Choose where the lead came from";
    setErrors(next);
    if (Object.keys(next).length) return;
    setOpen(false);
    toast({ title: "Lead created", description: `${name} was added to New (demo)`, tone: "success" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setErrors({});
      }}
    >
      <DialogTrigger render={<Button leadingIcon={<Plus strokeWidth={1.6} />} />}>New lead</DialogTrigger>
      <DialogContent
        title="Create lead"
        description="New leads are assigned by your round-robin rule."
        footer={
          <>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" form="new-lead">
              Create lead
            </Button>
          </>
        }
      >
        <form id="new-lead" noValidate onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <Field label="Name" required error={errors.name}>
            <Input name="name" autoComplete="name" />
          </Field>
          <Field label="Mobile" required description="Used for WhatsApp updates" error={errors.mobile}>
            <Input name="mobile" inputMode="numeric" placeholder="98765 43210" />
          </Field>
          <Field label="Source" required error={errors.source}>
            <Select
              name="source"
              placeholder="Choose source"
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "web_form", label: "Website form" },
                { value: "indiamart", label: "IndiaMART" },
                { value: "referral", label: "Referral" },
              ]}
            />
          </Field>
          <Field label="Notes">
            <Textarea name="notes" rows={3} />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
}

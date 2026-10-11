import { useState } from "react";
import { Field, Textarea } from "@heigin/ui";

const LIMIT = 300;

export default function TextareaBasic() {
  const [note, setNote] = useState("");
  return (
    <div style={{ maxWidth: 420 }}>
      <Field label="Call notes" description={`${note.length}/${LIMIT} characters`} error={note.length > LIMIT ? "Keep notes under 300 characters" : undefined}>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did the customer ask for?" />
      </Field>
    </div>
  );
}

import * as React from "react";
import { SectionIndex } from "@heigin/ui";

const SECTIONS = [
  { id: "si-demo-inbox", label: "One inbox for every channel", body: "Email, WhatsApp, SMS and missed calls land in one list, sorted by how long the customer has waited." },
  { id: "si-demo-drafts", label: "Agents draft the reply", body: "Each thread gets a draft as it arrives. Open it to edit, or send it as it is." },
  { id: "si-demo-approvals", label: "Nothing goes out without a yes", body: "Outgoing changes wait in one approvals inbox until a person approves them." },
  { id: "si-demo-pipeline", label: "Pipeline numbers you can trust", body: "Open value, win rate and time to close, recalculated each time a deal moves." },
  { id: "si-demo-activity", label: "Activity on every record", body: "Calls, messages, stage changes and agent actions share one timeline per contact." },
];

/** The index follows a scrolling box here (`scrollRoot`). On a page, leave scrollRoot unset and it follows the window. */
export default function SectionIndexScroll() {
  const box = React.useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 640 }}>
      <SectionIndex placement="static" scrollRoot={box} items={SECTIONS.map(({ id, label }) => ({ id, label }))} style={{ alignSelf: "center" }} />
      <div
        ref={box}
        tabIndex={0}
        aria-label="Example sections"
        style={{ flex: 1, height: 300, overflowY: "auto", padding: "0 16px", border: "1px solid var(--hg-color-border)", borderRadius: "var(--hg-radius-lg)" }}
      >
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} style={{ padding: "24px 0 96px", scrollMarginTop: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{s.label}</h3>
            <p style={{ margin: "8px 0 0", color: "var(--hg-color-muted)", fontSize: 14 }}>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

import { ThinkingOrb } from "@heigin/ui";

export default function ThinkingOrbInline() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
        <ThinkingOrb state="searching" size={20} label={null} />
        Searching the customer timeline
      </p>
      <p style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
        <ThinkingOrb state="composing" size={20} label={null} />
        Drafting a reply to Asha Rao
      </p>
    </div>
  );
}

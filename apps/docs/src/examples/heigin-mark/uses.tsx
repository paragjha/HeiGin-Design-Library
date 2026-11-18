import { HeiGinMark } from "@heigin/ui";

/** On its tile, bare in the text colour, and with a visible wordmark beside it. */
export default function HeiGinMarkUses() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      <HeiGinMark size={40} title="HeiGin" />
      <span style={{ color: "var(--hg-color-info)" }}>
        <HeiGinMark size={40} tile={false} title="HeiGin" />
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em" }}>
        <HeiGinMark size={26} />
        HeiGin
      </span>
    </div>
  );
}

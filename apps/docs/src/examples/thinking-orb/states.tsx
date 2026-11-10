import { ThinkingOrb, type ThinkingOrbState } from "@heigin/ui";

const states: ThinkingOrbState[] = [
  "working",
  "searching",
  "solving",
  "listening",
  "connecting",
  "weaving",
  "composing",
  "breathing",
  "shaping",
];

export default function ThinkingOrbStates() {
  return (
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 16, margin: 0, padding: 0, listStyle: "none" }}>
      {states.map((state) => (
        <li key={state} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
          <ThinkingOrb state={state} />
          <span style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>{state}</span>
        </li>
      ))}
    </ul>
  );
}

import { SLAClock, StatusBadge, STATUS_REGISTRY, type StatusKey } from "@heigin/ui";

export default function StatusRegistry() {
  const keys = Object.keys(STATUS_REGISTRY) as StatusKey[];
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {keys.map((key) => (
          <StatusBadge key={key} status={key} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <SLAClock state="on_track" time="2h 10m left" showLabel />
        <SLAClock state="due_soon" time="12m left" showLabel />
        <SLAClock state="breached" time="20m over" showLabel />
      </div>
    </div>
  );
}

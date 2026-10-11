import { Card, Skeleton, Spinner } from "@heigin/ui";

export default function LoadingStates() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <Card aria-busy="true" aria-label="Loading contact">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton shape="circle" />
          <div style={{ flex: 1, display: "grid", gap: 6 }}>
            <Skeleton shape="text" width="60%" />
            <Skeleton shape="text" width="40%" />
          </div>
        </div>
      </Card>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" label="Syncing WhatsApp messages" />
      </div>
    </div>
  );
}

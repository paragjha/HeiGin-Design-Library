import { Clock } from "lucide-react";
import { Badge } from "@heigin/ui";

export default function BadgeTones() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge>Draft</Badge>
      <Badge tone="info" dot>
        New
      </Badge>
      <Badge tone="success" dot>
        Won
      </Badge>
      <Badge tone="warning" icon={<Clock strokeWidth={2} />}>
        Due in 2h
      </Badge>
      <Badge tone="danger" dot>
        Overdue
      </Badge>
      <Badge tone="outline">B2B</Badge>
      <Badge tone="neutral" size="sm">
        12
      </Badge>
    </div>
  );
}

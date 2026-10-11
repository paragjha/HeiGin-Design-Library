import { MoreHorizontal } from "lucide-react";
import { Badge, Card, CardHeader, IconButton } from "@heigin/ui";

export default function CardBasic() {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      <Card>
        <CardHeader
          title="Kaveri Textiles"
          description="Asha Rao · Coimbatore"
          actions={<IconButton label="More actions" icon={<MoreHorizontal strokeWidth={1.6} />} size="sm" touch={false} />}
        />
        <Badge tone="success" dot>
          Qualified
        </Badge>
      </Card>
      <Card interactive as="article" tabIndex={0} aria-label="BluePeak Logistics deal">
        <CardHeader title="BluePeak Logistics" description="Proposal sent 2 days ago" />
        <Badge tone="warning" dot>
          Awaiting reply
        </Badge>
      </Card>
    </div>
  );
}
